var InvoiceForm = Class.create(Controller);
InvoiceForm.prototype.className = 'invoice_form';
InvoiceForm.cache = {};

InvoiceForm.addMethods({
  show: function(form) {
  },

  onSuccess: function (transport) {
    /*
    var client = transport.responseJSON;
    Client.render(client, this.form);
    this.client.show();
    this.form.stepForm.reset();
    */
  },

  disable: function () {
    var elem = this.invoice.element();
    $A(elem.getElementsByTagName("INPUT")).invoke("disable");
  },

  enable: function () {
    InvoiceForm.disableAll();
    var elem = this.invoice.element();
    $A(elem.getElementsByTagName("INPUT")).invoke("enable");
  }
});

InvoiceForm.disableAll = function () {
  $invoices = $$('#invoices > ul > li');
  $invoices.each(function (s) {
    var id = s.recordID();
    invoice(id).invoice_form().disable();
  });
};


var invoice_form = function (id) {
  var instance = InvoiceForm.cache[id];
  if (!instance) {
    instance = new InvoiceForm();
    instance.id = id;
    InvoiceForm.cache[id] = instance;
  }
  return instance;
};