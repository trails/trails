var TaskListForm = Class.create(Controller);
TaskListForm.prototype.className = 'task_list_form';
TaskListForm.cache = {};

TaskListForm.addMethods({
  show: function() {
    Application.hideTaskForms();
    $A(this.element().getElementsByTagName("INPUT")).invoke("enable");
    this.element().show();
    var titleInput = this.element().down(".title").down("input");
    titleInput.value = "";
    titleInput.focus();
    titleInput.select();
  },
  hide: function() {
    $A(this.element().getElementsByTagName("INPUT")).invoke("disable");
    this.element().hide();
    if (this.task_list) {
      this.task_list.element().show();
    }
  },
  onSuccess: function(transport) {
    //call back method on update for Tasks_Lists
    //also handles task_list creation
    if (this.task_list) {
      this.task_list.element().remove();
    }
    var element = this.element();
    element.insert({
      after: transport.responseText
    });
    var tList = element.next(".task_list");
    //get newly created TaskList's Id
    var newId = Application.strip_id(tList);
    if (this.task_list) {
      element.remove();
    } else {
      this.hide();
      //new task list needs to be DnD enabled
      Application.initDragAndDrop();
      //new list needs to hide total
      task_list(newId).checkIfTotalNeeded();
    }
  },
  element: function() {
    return this.task_list ? $("edit_task_list_"+this.task_list.id) : $("task_list_new");
  }
});

var task_list_form = function (id) {
  var instance = TaskListForm.cache[id];
  if (!instance) {
    instance = new TaskListForm();
    instance.id = id;
    TaskListForm.cache[id] = instance;
  }
  return instance;
};