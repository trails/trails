var TaskList = Class.create(Controller);
TaskList.prototype.className = 'task_list';
TaskList.cache = {};

TaskList.addMethods({
  task_form: function() {
    var cachedName = "_task_form";
    if (!this[cachedName]) {
      this[cachedName] = new TaskForm();
      this[cachedName][this.className] = this;
    }
    return this[cachedName];
  },

  task_list_form: function() {
    var cachedName = "_task_list_form";
    if (!this[cachedName]) {
      this[cachedName] = new TaskListForm();
      this[cachedName][this.className] = this;
    }
    return this[cachedName];
  },

  setTaskSequence: function(seq) {
    var options = {
      method: "put",
      parameters: {
        tasks: seq.toString()
      }
    };
    new Ajax.Request(this.url() + '/setSequence', options);
  },

  listContainer: function() {
    return $("task_list_container_" + this.id);
  },

  edit: function() {
    this.task_list_form().show();
    this.element().hide();
  },

  remove: function() {
    var self = this;
    swal({
      title: "Delete list",
      text: "Are you sure you want to delete list?",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Yes, delete it!",
      closeOnConfirm: true
    },
    function(response){
      if (response) {
        self.ajaxAction("remove", {method:"delete"});
      }
    });

  },

  afterRemove: function(name, transport) {
    //remy: replaced remove() with fadeDelete() for consistency
    var oldElement, element = this.element();
    //remove row spacer
    element.previous().fadeDelete();
    do {
      oldElement = element;
      element = element.next();
      oldElement.fadeDelete();
    } while(!element.match(".blank_list_footer"));
    element.fadeDelete();
  },

  earnings: function() {
    return $("task_list_earnings_" + this.id);
  },

  duration: function() {
    return $("task_list_duration_" + this.id);
  },

  numTasks: function() {
    return this.listContainer().childNodes.length;
  },

  hideTotal: function() {
    this.total().hide();
  },

  showTotal: function() {
    this.total().show();
  },

  total: function() {
    return $("total_" + this.id);
  },

  checkIfTotalNeeded: function() {
    var n = this.numTasks();
    if (n < 2) {
      this.hideTotal();
    } else {
      this.showTotal();
    }
  }
});

var task_list = function (id) {
  var instance = TaskList.cache[id];
  if (!instance) {
    instance = new TaskList();
    instance.id = id;
    TaskList.cache[id] = instance;
  }
  return instance;
};
