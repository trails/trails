var Client = Class.create(Controller);
Client.prototype.className = 'client';
Client.cache = {};

Client.addMethods({
  client_form: function() {
    var cachedName = "_client_form";
    if (!this[cachedName]) {
      this[cachedName] = client_form(this.id, this.form);
      this[cachedName][this.className] = this;
    }
    return this[cachedName];
  },

  show: function() {
    var form = this.form;
    var clientLayout = form.next('span');
    clientLayout.addClassName('show');
    form.addClassName('hide');
  },

  element: function() {
    return null;
  }
});

Client.render = function(client, form) {
  form.writeAttribute('status', client.id ? 'display' : 'new');
  form.writeAttribute('client', client.id);
  if (!client.id) {
    for (var i = 0; i < form.elements.length; i++) {
      var name = form.elements[i].name;
      if (name.match(/client\[\w+\]/) && name != 'client[email]') {
        form.elements[i].value = '';
      }
    }
    return;
  }
  for (var field in client) {
    if (form.elements['client[' + field + ']'] != undefined) {
      form.elements['client[' + field + ']'].value = client[field];
    }
  }
  var clientLayout = form.next('span');
  clientLayout.down('h4').innerHTML = client.id ? client.name : '';
  clientLayout.down('p').innerHTML =
    client.id
      ?
        client.address + "\n" +
        client.city + ', ' + client.state + ', ' + client.zip + "\n" +
        client.country
      : '';
};

var client = function (id, form) {
  var instance = Client.cache[id];
  if (!instance) {
    instance = new Client();
    instance.id = id;
    Client.cache[id] = instance;
  }
  instance.form = form;
  return instance;
};