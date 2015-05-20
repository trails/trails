var ClientForm = Class.create(Controller);
ClientForm.prototype.className = 'client_form';
ClientForm.cache = {};

ClientForm.addMethods({
  show: function(form) {
    var form = this.form;
    var clientLayout = form.next('span');
    clientLayout.removeClassName('show');
    form.removeClassName('hide');
  },

  onSuccess: function(transport) {
    var client = transport.responseJSON;
    Client.render(client, this.form);
    this.client.show();
    this.form.stepForm.reset();
  }
});


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