var Actions = Class.create(Controller);
Actions.prototype.className = 'actions';
Actions.cache = {};

Actions.addMethods({
  start: function (options) {
    return this.ajaxAction('start', options);
  },

  afterStart: function (transport) {
    return this.afterAjaxAction('start', transport);
  },

  stop: function (options) {
    return this.ajaxAction('stop', options);
  },

  afterStop: function (transport) {
    return this.afterAjaxAction('stop', transport);
  },

  complete: function (options) {
    return this.ajaxAction('complete', options);
  },

  afterComplete: function(transport) {
    /*
     * apparently, this piece of code tries to insert the closed task at the proper index.
     * for the sake of simplicity, I think it is better to just
     * append it to the bottom of the list and let the user move it around.
     *
     * > var nexts = [this.task.element().next(".total"),this.task.element().next(".complete.task")].compact().pluck("rowIndex");
     * > var targetRowIndex = Math.min.apply(Math,nexts)-1;
     * > this.task.element().remove();
     * > var newRow = $("task_lists").insertRow(targetRowIndex);
     * > $(newRow).replace(transport.responseText);
     */
    var task_list = this.task.taskList();
    var listContainer = task_list.listContainer();
    this.task.taskContainer().remove();
    listContainer.insert({bottom: transport.responseText});
  },

  reopen: function (options) {
    return this.ajaxAction('reopen', options);
  },

  afterReopen: function (transport) {
  /*
   * apparently, this piece of code tries to insert the reopened task at the proper index.
   * for the sake of simplicity, I think it is better to just
   * insert it at the top of the list and let the user move it around.
   *
   * > var prevs = [this.task.element().previous(".task_list"), this.task.element().previous(".stopped.task")].compact().pluck("rowIndex");
   * > var targetRowIndex = Math.max.apply(Math, prevs)+1;
   * > this.task.element().remove();
   * > var newRow = $("task_lists").insertRow(targetRowIndex);
   * > $(newRow).replace(transport.responseText);
   */
    var task_list = this.task.taskList();
    var listContainer = task_list.listContainer();
    this.task.taskContainer().remove();
    listContainer.insert({top: transport.responseText});
    //when a task is reOpened, it should be allowed to start moving again
    Application.initDragAndDrop();
    this.task.initSlider();
  },

  url: function() {
    return this.task.url()+"actions";
  },

  ajaxAction: function($super, name) {
    return $super(name, {parameters:{"log_entry[action]":name}});
  },

  afterAjaxAction: function(name, transport) {
    //call back for all actions (start, stop ...)
    this.task.taskContainer().update(transport.responseText);
    this.task.initSlider();
  }
});

var actions = function (id) {
  var instance = Actions.cache[id];
  if (!instance) {
    instance = new Actions();
    instance.id = id;
    Actions.cache[id] = instance;
  }
  return instance;
};