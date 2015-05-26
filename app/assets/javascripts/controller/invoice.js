var Invoice = Class.create(Controller);
Invoice.prototype.className = 'invoice';
Invoice.cache = {};

Invoice.addMethods({
  create: function(callback) {
  },

  setTaskSequence: function(seq) {
    if (!parseInt(this.id)) {
      this.create(function() {
        this.setTaskSequence(seq);
      })
      return;
    }

    new Ajax.Request(this.url() + '/setSequence', {
      method: 'put',
      parameters: {
        tasks: seq.toString()
      }
    });
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