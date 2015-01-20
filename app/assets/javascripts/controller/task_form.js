var TaskForm = Class.create(Controller);
TaskForm.prototype.className = 'task_form';
TaskForm.cache = {};

TaskForm.addMethods({
  show: function() {
    Application.hideTaskForms();
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
      var task_rate_input = this.element().down("input#task_rate");
      var list_default_rate = task_list_form.element().down('input#task_list_default_rate').value;
      var default_rate_checkbox = this.element().down('.default_rate_check > input');
      task_rate_input.value = list_default_rate;
      task_rate_input.writeAttribute('default_rate', list_default_rate);
      default_rate_checkbox.checked = (parseFloat(list_default_rate) > 0.00);
      task_rate_input.writeAttribute('readonly', default_rate_checkbox.checked ? true : null);
      default_rate_checkbox.writeAttribute('disabled', (parseFloat(list_default_rate) > 0.00) ? null : true);

      this.initSlider();
      this.getSlider().setValue(0, 0);
      this.getSlider().setValue(0, 1);
    }
    title_input.focus();
    title_input.select();
  },
  initSlider: function() {
    this.slider = new Control.Slider($('track_').select(".slider_handle"), 'track_', {
      range: $R(0,120),
      sliderValue: [0.03,0.03],
      myId: 0,
      onSlide: function(values) {
        var hours = values[0];
        var mins = Math.floor(values[1]);
        if (hours) {
          hours /= 10;
        }
        var diffTime = $("diffTime_");
        var diffTimeInput = $("diffTime_input_");
        total = Math.floor(hours)*60  + mins;
        diffTime.innerHTML = Application.formattedTime(total);
        diffTimeInput.value = total;
      }
    });
  },
  getSlider: function() {
    return this.slider;
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
      this.task.initSlider();
    } else {
      //insert newly created task
      var listContainer = this.task_list.listContainer();
      listContainer.insert({top:transport.responseText});
      var newTask = listContainer.firstChild;
      //the content of the list has changed so we need to re-init
      Application.initDragAndDrop();
      this.task_list.checkIfTotalNeeded();
      //get new task id
      var newTaskId = Application.strip_id(newTask);
      task(newTaskId).initSlider();
      //hide new_task_form
      this.hide();
    }
  },
  element: function() {
    return this.task_list ? $("task_list_" + this.task_list.id + "_task_new") : (this.task ? $("edit_task_" + this.task.id) : null);
  }
});

var task_form = function (id) {
  var instance = TaskForm.cache[id];
  if (!instance) {
    instance = new TaskForm();
    instance.id = id;
    TaskForm.cache[id] = instance;
  }
  return instance;
};