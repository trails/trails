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
    var task_list = this.task.taskList();
    var listContainer = task_list.listContainer();
    this.task.taskContainer().remove();
    listContainer.insert({bottom: transport.responseText});
  },

  reopen: function (options) {
    return this.ajaxAction('reopen', options);
  },

  afterReopen: function (transport) {
    var task_list = this.task.taskList();
    var listContainer = task_list.listContainer();
    this.task.taskContainer().remove();
    listContainer.insert({top: transport.responseText});
    // reopened task should be allowed to DnD again
    task_list.sortable.destroy();
    Application.dragAndDropTaskList($('task_list_container_' + task_list.id));
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
    this.task.taskContainer().replace(transport.responseText);
    this.task.initSlider();
    document.title = ($$('.active_task').length ? '*' : '') + 'Trails';
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