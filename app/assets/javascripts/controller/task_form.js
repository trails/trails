controller("task_form",{
  show: function() {
    hideTaskForms();
    $A(this.element().getElementsByTagName("INPUT")).invoke("enable");
    this.element().show();
    //focus on title input when form appears
    var title_input = this.element().down(".task_title").down("input");
    if (!this.task) {
      //if this is not an existing task, reset input value.
      title_input.value = '';
      var slider_row = this.element().down(".slider_row");
      slider_row.display = "none";

      // inherit the default rate from the one set by the task list
      var task_list_form = this.task_list.task_list_form();
      var task_rate = this.element().down("input#task_rate");
      task_rate.value = task_list_form.element().down('input#task_list_default_rate').value
    }
    title_input.focus();
    title_input.select();
  },
  hide: function() {
    var elem = this.element();
    $A(elem.getElementsByTagName("INPUT")).invoke("disable");
    elem.hide();
    if(this.task) {
      this.task.element().show();
    }
  },
  onSuccess: function(transport) {
    //call back method on update for Tasks
    var element = this.element();
    if (this.task) {
      //update existing task
      var taskContainer = this.task.taskContainer();
      taskContainer.update(transport.responseText);
      taskContainer.highlight();
      this.task.initSlider();
    } else {
      //insert newly created task
      var listContainer = this.task_list.listContainer();
      listContainer.insert({top:transport.responseText});
      var newTask = listContainer.firstChild;
      newTask.highlight();
      //the content of the list has changed so we need to re-init
      initDragAndDrop();
      this.task_list.checkIfTotalNeeded();
      //get new task id
      var newTaskId = strip_id(newTask);
      task(newTaskId).initSlider();
      //hide new_task_form
      this.hide();
    }
  },
  element: function() {
    return this.task_list ? $("task_list_" + this.task_list.id + "_task_new") : (this.task ? $("edit_task_" + this.task.id) : null);
  }
});