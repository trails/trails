var Task = Class.create(Controller);
Task.prototype.className = 'task';
Task.cache = {};

Task.addMethods({
  actions: function() {
    var cachedName = "_actions";
    if (!this[cachedName]) {
      this[cachedName] = new Actions();
      this[cachedName][this.className] = this;
    }
    return this[cachedName];
  },

  task_form: function() {
    var cachedName = "_task_form";
    if (!this[cachedName]) {
      this[cachedName] = new TaskForm();
      this[cachedName][this.className] = this;
    }
    return this[cachedName];
  },

  edit: function() {
    this.task_form().show();
    this.element().hide();
    this.getSlider().setValue(0, 0);
    this.getSlider().setValue(0, 1);
  },

  remove: function() {
    var response = confirm("Are you sure you want to delete task?");
    if (response) {
      this.ajaxAction("remove",{method:"delete"});
    }
  },

  afterRemove: function(name, transport) {
    ///remove whole container instead of single task element
    //this.element().fadeDelete();
    var tContainer = this.taskContainer();
    var tList = this.taskList();
    tContainer.fade({
      afterFinish: function() {
        tContainer.remove();
        tList.checkIfTotalNeeded();
      }
    });
  },

  initSlider: function() {
    this.slider = new Control.Slider($('track_'+this.id).select(".slider_handle"), 'track_' + this.id, {
      range: $R(-60,60),
      sliderValue: [0.03,0.03],
      myId: this.id,
      onSlide: function(values) {
        var hours = values[0];
        var mins = Math.floor(values[1]);
        if (hours) {
          hours /= 10;
        }
        var diffTime = $("diffTime_"+this.myId);
        var diffTimeInput = $("diffTime_input_"+this.myId);
        total = Math.floor(hours)*60  + mins;
        diffTime.innerHTML = Application.formattedTime(total);
        diffTimeInput.value = total;
      }
    });
  },

  getSlider: function() {
    return this.slider;
  },

  taskContainer: function() {
    //LI task_container
    return $("task_container_" + this.id);
  },

  taskList: function() {
    var elem = this.element().up(".list_container");
    return task_list(Application.strip_id(elem));
  },

  durationBar: function() {
    return this.element().down(".duration_bar");
  },

  earnings: function() {
    return this.element().down(".earnings");
  },

  duration: function() {
    return this.element().down(".duration");
  }
});

var task = function (id) {
  var instance = Task.cache[id];
  if (!instance) {
    instance = new Task();
    instance.id = id;
    Task.cache[id] = instance;
  }
  return instance;
};