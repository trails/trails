var ClientForm = Class.create(Controller);
ClientForm.prototype.className = 'client_form';
ClientForm.cache = {};

ClientForm.addMethods({
  show: function(wizard) {
    InvoiceForm.disableAll();
    var invoice_id = wizard.recordID('invoice');
    $A(invoice(invoice_id).element().getElementsByTagName("INPUT")).invoke("enable");
    var clientLayout = wizard.next('span');
    clientLayout.removeClassName('show');
    wizard.removeClassName('hide');
  },

  onSuccess: function(transport) {
    var wizard = this.client.form,
        status = wizard.readAttribute('status'),
        invoice_id = wizard.recordID('invoice'),
        data = transport.responseJSON;
    Client.render(data, this.form);
    this.client.show();
    this.form.stepForm.reset();
    if (data.id) {
      invoice(invoice_id).update();
    }
  }
});

ClientForm.init = function (newInvoiceOnly) {
  var selector = '#invoices li' + (newInvoiceOnly ? '#invoice_new' : '') + ' > header + section > fieldset';
  $$(selector).each(function (wizard) {
    wizard.observe("submit", Application.formSubmitHandler);

    wizard.stepForm = new clientForm(wizard, {
      onSubmit: function () {
        var status = wizard.readAttribute('status');
        wizard.form.responder = client(0, wizard).client_form();
        wizard.form.overrideAction = '/clients';
        wizard.form.overrideMethod = 'post';
        wizard.down('button[type="submit"]').click();
      },
      onIDQuery: function(question) {
        var input = question.querySelector('input');
        new Ajax.Request("/clients/" + input.value, {
          method: 'get',
          onSuccess: function (transport) {
            var json = transport.responseJSON;
            if (json.email) {
              Client.render(json, wizard);
              wizard.writeAttribute('client', json.id);
              wizard.stepForm.reset();
              var invoice_id = wizard.recordID('invoice');
              invoice(invoice_id).update();
              client(json.id, wizard).show();
            } else {
              wizard.stepForm.nextQuestion();
            }
          }
        });
        return false;
      }
    });
    wizard.next('span').down('button.change').observe('click', function(ev) {
      ev.stop();
      var id = wizard.readAttribute('client');
      wizard.writeAttribute('status', 'select');
      client(id, wizard).client_form().show(wizard);
    });
    var id = parseInt(wizard.readAttribute('client'));
    wizard.writeAttribute('status', id ? 'display' : 'select');
    if (id) {
      client(id, wizard).show()
    }
  });
};


var client_form = function (id, form) {
  var instance = ClientForm.cache[id];
  if (!instance) {
    instance = new ClientForm();
    instance.id = id;
    ClientForm.cache[id] = instance;
  }
  instance.form = form;
  return instance;
};
