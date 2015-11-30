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

  earnings: function(earnings) {
    var elem = this.element().down(".earnings");
    if (typeof earnings != 'undefined') {
      elem.update(earnings);
    }
    return elem;
  },

  duration: function(duration) {
    var elem = this.element().down('.duration');
    if (typeof duration != 'undefined') {
      elem.update(Task.HTMLDuration(duration));
      this.durationBar(duration);
    }
    return elem;
  },

  durationBar: function(duration) {
    var elem = this.element().down(".duration_bar");
    if (typeof duration != 'undefined') {
      elem.writeAttribute('duration', duration)
    }
    return elem;
  },

  description: function(description) {
    var elem = this.element().down(".description");
    if (typeof description != 'undefined') {
      elem.update(description);
    }
    return elem;
  },

  update: function(json) {
    if (json.description) {
      this.description(json.description);
    }
    if (json.duration) {
      this.duration(json.duration);
    }
    if (json.earnings) {
      this.earnings(json.earnings);
    }
  }
});

Task.HTMLDuration = function(seconds) {
  if (seconds > 60) {
    var minutes = ("00" + parseInt((parseInt(seconds / 60) % 60))).substr(-2),
        hours   = ("00" + parseInt((parseInt(seconds / 60) / 60))).substr(-2),
        ret = hours + '<span class="colon">:</span>' + minutes;
    return ret.replace(/[0:]+/g, function($1) {
      return '<span class="fade">' + $1 + '</span>';
    });
  } else {
    return Math.floor(seconds) + '<span class="fade">s</span>';
  }
};

Task.renderDurationBars = function () {
  var maxDuration = .0;
  $$('.duration_bar').each(function (element) {
    if (!element.up('.list_container')) {
      return;
    }
    var duration = parseFloat(element.readAttribute('duration'));
    if (duration > maxDuration) {
      maxDuration = duration;
    }
  });
  $$('.duration_bar').each(function (element) {
    if (!element.up('.list_container')) {
      return;
    }
    var duration = parseFloat(element.readAttribute('duration'));
    element.setStyle({
      width: (duration * 100 / maxDuration) + '%'
    });
  });
};

var task = function (id) {
  var instance = Task.cache[id];
  if (!instance) {
    instance = new Task();
    instance.id = id;
    Task.cache[id] = instance;
  }
  return instance;
};
