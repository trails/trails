var Invoice = Class.create(Controller);
Invoice.prototype.className = 'invoice';
Invoice.cache = {};

Invoice.addMethods({
  invoice_form: function() {
    var cachedName = "_invoice_form";
    if (!this[cachedName]) {
      this[cachedName] = new InvoiceForm();
      this[cachedName][this.className] = this;
    }
    return this[cachedName];
  },

  setTaskSequence: function(sequence) {
    if (this.id) {
      this.update(sequence);
    }
  },

  data: function() {
    return {
      "invoice[id]": parseInt(this.id) ? 'new' : '',
      "invoice[client_id]": this.element().select('fieldset[client]')[0].readAttribute('client'),
      "invoice[description]": this.element().select('header > input[name="invoice[description]"]')[0].value,
      "invoice[due]": this.element().select('header p > input[name="invoice[due]"]')[0].value
    };
  },

  update: function(sequence) {
    var self = this,
        url = this.url() + (sequence && parseInt(this.id) ? '/setSequence' : ''),
        params = this.data();
    sequence = sequence ? sequence : [];
    if (sequence) {
      params.tasks = sequence.toString();
    }
    var request = new Ajax.Request(url, {
      method: parseInt(this.id) ? 'put' : 'post',
      parameters: params,
      onSuccess: function(transport) {
        data = transport.responseJSON;
        var element = self.element(),
            id = element.recordID('invoice');
        if (id == 'new' && data.id > 0) {
          element.writeAttribute('id', 'invoice_' + data.id);
          $(element).down('header:first-child > h3').innerHTML = 'Invoice #' + data.number;
          $(element).down('input[name="invoice[description]"]').value = data.description;
          $(element).down('fieldset > a:first-child').setAttribute('href', '/invoices/' + data.id + '.pdf');
          Sortable.create($$("#invoice_" + data.id + " main > ul")[0], {
            draggable: 'li.task_container',
            group: {
              name: 'invoices',
              pull: true,
              put: ['taskList']
            },
            onStart: function() {
              $$('body')[0].addClassName('dnd');
            },
            onEnd: function() {
              $$('body')[0].removeClassName('dnd');
            },            onAdd: Invoice.updateTasksOrder,
            onUpdate: Invoice.updateTasksOrder,
            onRemove: Invoice.updateTasksOrder
          });
          var clone = Invoice.newInvoiceClone.clone(true);
          element.insert({before: clone});
          ClientForm.init(true);
          invoice(data.id).zoomIn();
        }
      }
    });
  },

  zoomIn: function() {
    var element = this.element();
    var inv = {
      width: element.getLayout().get('margin-box-width'),
      height: element.getLayout().get('margin-box-height'),
      left: element.offsetLeft,
      top: element.offsetTop
    };
    var viewport = {
      width: $('invoices').getLayout().get('margin-box-width'),
      height: $('invoices').getLayout().get('margin-box-height')
    };
    inv.ratio = inv.width / inv.height;
    viewport.ratio = viewport.width / viewport.height;

    var result = {
      width: (
        (viewport.ratio > inv.ratio)
          ? inv.width * viewport.height / inv.height
          : viewport.width
      ),
      height: (
        (viewport.ratio > inv.ratio)
          ? viewport.height
          : inv.height * viewport.width / inv.width
      ),
    };
    result.scale = (
      (viewport.ratio > inv.ratio)
        ? result.width / inv.width
        : result.height / inv.height
    );

    result.top = -inv.top * result.scale + 50;
    result.left = -inv.left * result.scale + 50;

    InvoiceForm.disableAll();
    invoice_id = element.recordID('invoice');
    $A(invoice(invoice_id).element().getElementsByTagName("INPUT")).invoke("enable");

    $$('#invoices > div > ul')[0].addClassName('zoomed').setStyle({
      transform:
        'translate(' + result.left.toString() + 'px, ' + result.top.toString() + 'px) ' +
        'scale(' + result.scale.toString() + ')'
    });

    element.addClassName('zoom');
  }
});

Invoice.CSS_SCALE = .2;

Invoice.zoomOut = function () {
  var zoomItem = $$('#invoices > div > ul > li.zoom');
  if (zoomItem.length) {
    zoomItem[0].removeClassName('zoom');
  }
  $$('#invoices > div > ul')[0].removeClassName('zoomed').setStyle({
    transform: 'translate(0, 0) scale(' + Invoice.CSS_SCALE + ')'
  });
};

Invoice.isZoomed = function() {
  return $$('#invoices > div > ul')[0].hasClassName('zoomed');
};

Invoice.isActiveTab = function() {
  return $$('#invoices')[0].hasClassName('current');
};

Invoice.init = function () {
  $('invoices').observe("submit", Application.formSubmitHandler);
  Invoice.zoomOut();
  Invoice.initDnD();
  Invoice.newInvoiceClone = invoice('new').element().clone(true);
  ClientForm.init();
};

Invoice.initDnD = function () {
  $$("#invoices li main > ul").each(function (container) {
    Sortable.create(container, {
      draggable: 'li.task_container',
      group: {
        name: 'invoices',
        pull: true,
        put: ['taskList']
      },
      onStart: function() {
        $$('body')[0].addClassName('dnd');
      },
      onEnd: function() {
        $$('body')[0].removeClassName('dnd');
      },
      onAdd: Invoice.updateTasksOrder,
      onUpdate: Invoice.updateTasksOrder,
      onRemove: Invoice.updateTasksOrder
    });
  });
};

Invoice.updateTasksOrder = function (event) {
  var id = event.target.recordID('invoice');
  var inv = invoice(id);
  var element = inv.element();
  var seq = Application.getSequence(element.down('main > ul'));
  inv.setTaskSequence(seq);
  var earnings = Application.getEarningsSequence(element.down('main > ul'));
  var total_earnings = .0;
  for (var i=0; i<earnings.length; i++) {
    total_earnings += earnings[i];
  }
  total_earnings = total_earnings.toFixed(2);
  element.down('header:first-child > p > span').innerHTML = total_earnings;
  element.down('footer > p:last-child > strong > span').innerHTML = total_earnings;

  var durations = Application.getDurationSequence(element.down('main > ul'));
  var total_duration = 0;
  for (var i=0; i<durations.length; i++) {
    total_duration += durations[i];
  }
  total_duration = total_duration.toFixed(2) / 60;
  element.down('footer > p:first-child > span').innerHTML = Application.formattedTime(total_duration);
};

var invoice = function (id) {
  var instance = Invoice.cache[id];
  if (!instance) {
    instance = new Invoice();
    instance.id = id;
    Invoice.cache[id] = instance;
  }
  return instance;
};
