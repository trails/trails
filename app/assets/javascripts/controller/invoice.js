var Invoice = Class.create(Controller);
Invoice.prototype.className = 'invoice';
Invoice.cache = {};

Invoice.addMethods({
  setTaskSequence: function(seq) {
    var options = {
      method: "put",
      parameters: {
        tasks: seq.toString()
      },
      requestHeaders: {
        "X-CSRF-Token": $$('meta[name=csrf-token]')[0].readAttribute('content')
      }
    };
    new Ajax.Request(this.url() + "setSequence", options);
  }
});

var invoice = function (id) {
  var instance = Invoice.cache[id];
  if (!instance) {
    instance = new Invoice();
    instance.id = id;
    Invoice.cache[id] = instance;
  }
  return instance;
};