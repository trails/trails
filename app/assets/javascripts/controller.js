var Controller = Class.create({
  element: function () {
    return $(this.className + "_" + this.id);
  },

  baseURL: function () {
    return '/' + this.className + 's';
  },

  url: function () {
    return this.baseURL() + (parseInt(this.id) ? '/' + this.id: '');
  },


  ajaxAction: function (name, options) {
    var ajaxOptions = {
      onSuccess: this["after"+name.capitalize()].bind(this)
    };
    if(options) Object.extend(ajaxOptions, options);
    return new Ajax.Request(this.url(),ajaxOptions);
  },

  afterAjaxAction: function (name, transport) {
    this.element().replace(transport.responseText);
  }
});
