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
    this.update(sequence);
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
          Sortable.create($$("#invoice_" + data.id + " main > ul")[0], {
            draggable: 'li.task_container',
            group: {
              name: 'invoices',
              pull: true,
              put: ['taskList']
            },
            onAdd: Invoice.updateTasksOrder,
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
    var list = {
      width: $$('#invoices > div > ul')[0].getLayout().get('width'),
      height: $$('#invoices > div > ul')[0].getLayout().get('height')
    };
    var inv = {
      width: element.getLayout().get('margin-box-width'),
      height: element.getLayout().get('margin-box-height')
    };
    var viewport = {
      width: $('invoices').getLayout().get('margin-box-width'),
      height: $('invoices').getLayout().get('margin-box-height')
    };
    var diff = {
      x: inv.width - viewport.width,
      y: inv.height - viewport.height
    };
    var invScale = {
      x: list.width / (inv.width + diff.x / 2),
      y: list.height / (inv.height + diff.y / 2)
    };
    var scale = invScale.x < invScale.y ? invScale.x : invScale.y;
    console.log(scale == invScale.x ? 'x' : 'y');
    var realScale = scale * Invoice.CSS_SCALE;
    var offset = {
      x: ((list.width - (inv.width + diff.x / 4) * scale) / 2 - element.offsetLeft * scale) * Invoice.CSS_SCALE,
      y: ((list.height - (inv.height + diff.y / 4) * scale) / 2 - element.offsetTop * scale) * Invoice.CSS_SCALE
    };

    InvoiceForm.disableAll();
    invoice_id = element.recordID('invoice');
    $A(invoice(invoice_id).element().getElementsByTagName("INPUT")).invoke("enable");

    $$('#invoices > div > ul')[0].addClassName('zoomed').setStyle({
      transform:
        'translate(' + offset.x.toString() + 'px, ' + offset.y.toString() + 'px) ' +
        'scale(' + realScale.toString() + ')'
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
  $$("#invoices li:not(#invoice_new) main > ul").each(function (container) {
    Sortable.create(container, {
      draggable: 'li.task_container',
      group: {
        name: 'invoices',
        pull: true,
        put: ['taskList']
      },
      onAdd: Invoice.updateTasksOrder,
      onUpdate: Invoice.updateTasksOrder
    });
  });
};

Invoice.updateTasksOrder = function (event) {
  var id = event.target.recordID('invoice'); //Application.strip_id(container);
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
