controller("task_list_form",{
  show: function() {
    hideTaskForms();
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
    if(this.task_list){
      this.task_list.element().show();
    }
  },
  onSuccess: function(transport) {
    //call back method on update for Tasks_Lists
  //also handles task_list creation
    if(this.task_list) this.task_list.element().remove();
    var element = this.element();
    element.insert({after:transport.responseText})
    var tList = element.next(".task_list");
    tList.highlight();
    //get newly created TaskList's Id
    var newId = strip_id(tList);
    if (this.task_list) {
      element.remove();
    } else {
      this.hide();
      //new task list needs to be DnD enabled
      initDragAndDrop();
      //new list needs to hide total
      task_list(newId).checkIfTotalNeeded();
    }
  },
  element: function() {
    if (this.task_list) {
      return $("edit_task_list_"+this.task_list.id);
    } else {
      return $("task_list_new");
    }
  }
});