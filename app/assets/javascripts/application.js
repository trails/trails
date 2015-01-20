//= require prototype
//= require effects
//= require dragdrop
//= require _libs
//= require scriptaculous
//= require slider

//= require controller
//= require controller/task
//= require controller/actions
//= require controller/task_list
//= require controller/task_form
//= require controller/task_list_form

var Application = {
  init: function() {
    Application.extendElementMethods();

    Application.initDragAndDrop();
    Application.initSliders();
    setInterval(Application.updateActiveTasks, 10000);
    //Initialize clockTicking
    $showTick = false;
    setInterval(Application.clockTick, 500);
    
    //check if totals need to be shown for each list
    Application.toggleTotals();

    Application.attachEventHandlers();
  },

  extendElementMethods: function() {
    Element.addMethods({
      recordID: function (element) {
        do {
          element = element.parentNode;
        } while (!element.id && !element.href);

        if (element.id) {
          var match = element.id.match(/\d+/);
          if(!match) return "new";
          return parseInt(match[0]);
        }

        if (element.href) {
          return parseInt(element.href.match(/\d+/).last());
        }
      },

      fadeDelete: function (element) { //fades element, then deletes it
        element.fade({
          afterFinish: function () {
            element.remove();
           }
        });
      }
    });
  },

  attachEventHandlers: function() {
    $$("th.title").each(function(element) {
      element.insert(" <small>-</small>");
    });
    $("task_form").observe("submit", Application.formSubmitHandler);
    $S(".task .toolbar .edit").observe("click", function(event) {
      if (event.stopped || !event.isLeftClick()) return;
      event.stop();
      var id = event.element().recordID();
      task(id).edit(event);
    });

    $S(".task .toolbar .delete").observe("click", function(event) {
      if (event.stopped || !event.isLeftClick()) return;
      event.stop();
      var id = event.element().recordID();
      task(id).remove(event);
    });

    $S('th.title').observe('click', function(event) {
      var currentTh = $(Event.element(event));
      trTitleId = currentTh.up().identify();
      currentList = $(trTitleId).next(2);
      currentTotal = currentTh.up().next('.total');
      currentTitleTr = currentTh.up();
      currentEarnings = currentTotal.down('.earnings').innerHTML;
      currentDuration = currentTotal.down('.duration').innerHTML;
      newTaskLink = currentTitleTr.down(('.new_task')).innerHTML;
      addTotalTo = currentTitleTr.down(('.new_task'));
      currentList.toggle();
      if (currentList.visible()) {
        $(currentTh).down().update("-");
        addTotalTo.down('span').remove();
        currentTotal.show();
      } else {
        $(currentTh).down().update("+");
        addTotalTo.update('<span>' + currentEarnings + ' ' + currentDuration + '</span> ' + newTaskLink);
        currentTotal.hide();
      }
    });

    $S(".start_task").observe("click", function(event) {
      if (event.stopped || !event.isLeftClick()) return;
      event.stop();
      var id = event.element().recordID();
      task(id).actions().start(event);
    });
    $S(".stop_task").observe("click", function(event) {
      if (event.stopped || !event.isLeftClick()) return;
      event.stop();
      var id = event.element().recordID();
      task(id).actions().stop(event);
    });
    $S("input.stopped_task").observe("click", function(event) {
      if (event.stopped || !event.isLeftClick()) return;
      event.stop();
      var id = event.element().recordID();
      task(id).actions().complete(event);
    });
    $S("input.complete_task").observe("click", function(event) {
      if (event.stopped || !event.isLeftClick()) return;
      event.stop();
      var id = event.element().recordID();
      task(id).actions().reopen(event);
    });

    $S(".new_task a").observe("click", function(event) {
      if (event.stopped || !event.isLeftClick()) return;
      event.stop();
      var id = event.element().recordID();
      task_list(id).task_form().show(event);
    });
    $S(".task_list .toolbar .edit").observe("click", function(event) {
      if (event.stopped || !event.isLeftClick()) return;
      event.stop();
      var id = event.element().recordID();
      task_list(id).edit(event);
    });
    $S(".task_list .toolbar .delete").observe("click", function(event) {
      if (event.stopped || !event.isLeftClick()) return;
      event.stop();
      var id = event.element().recordID();
      task_list(id).remove(event);
    });

    $S(".new.task.form .submit a").observe("click", function(event) {
      if (event.stopped || !event.isLeftClick()) return;
      event.stop();
      var id = event.element().recordID();
      task_list(id).task_form().hide(event);
    });
    $S(".edit.task.form .submit a").observe("click", function(event) {
      if (event.stopped || !event.isLeftClick()) return;
      event.stop();
      var id = event.element().recordID();
      task(id).task_form().hide(event);
    });

    $S(".task.new .submit input[type=submit]").observe("click", function(event) {
      var element = event.element();
      var id = element.recordID();
      element.form.responder = task_list(id).task_form();
    });

    $S(".task.edit .submit input[type=submit]").observe("click", function(event) {
      var element = event.element();
      var id = element.recordID();
      element.form.responder = task(id).task_form();
    });

    $S("#new_task_list").observe("click", function(event) {
      if (event.stopped || !event.isLeftClick()) return;
      event.stop();
      var id = event.element().recordID();
      task_list_form(id).show(event);
    });

    $S(".new.task_list.form .submit a").observe("click", function(event) {
      if (event.stopped || !event.isLeftClick()) return;
      event.stop();
      var id = event.element().recordID();
      task_list_form(id).hide(event);
    });

    $S(".edit.task_list.form .submit a").observe("click", function(event) {
      if (event.stopped || !event.isLeftClick()) return;
      event.stop();
      var id = event.element().recordID();
      task_list(id).task_list_form().hide(event);
    });

    $S(".task_list.new .submit input[type=submit]").observe("click", function(event) {
      var element = event.element();
      element.form.responder = task_list_form();
    });

    $S(".task_list.edit .submit input[type=submit]").observe("click", function(event) {
      var element = event.element();
      element.form.responder = task_list(element.recordID()).task_list_form();
    });

    $S("input[type=submit][action]").observe("click", function(event) {
      var element = event.element();
      element.form.overrideAction = element.readAttribute("action");
    });

    $S("input[type=submit][method]").observe("click", function(event) {
      var element = event.element();
      element.form.overrideMthod = element.readAttribute("method");
    });

    $S('.task.form .default_rate_check > input[type="checkbox"]').observe('change', function(event) {
      var element = event.element();
      var task_rate_input = $(element).up(2).down('input#task_rate');
      var list_default_rate = task_rate_input.readAttribute('default_rate');
      if (element.checked && typeof list_default_rate != 'undefined' && parseFloat(list_default_rate) > 0.00) {
        task_rate_input.value = list_default_rate;
        task_rate_input.writeAttribute('readonly', true);
      } else {
        task_rate_input.writeAttribute('readonly', null);
        if (element.checked) {
          return false;
        }
      }
    });
  },

  formSubmitHandler: function (event) {
    event.stop();
    var options = {
      requestHeaders: {
      "X-CSRF-Token": $$('meta[name=csrf-token]')[0].readAttribute('content')
      }
    };
    // Setup before request
    if (this.overrideAction) {
      var defaultAction = this.action;
      this.action = this.overrideAction;
    }
    if (this.overrideMthod) {
      var defaultMethod = this.method;
      this.method = this.overrideMthod;
    }
    if (this.responder) {
      if(this.responder.onSuccess) options.onSuccess = this.responder.onSuccess.bind(this.responder)
    }
    // Perform request!
    this.request(options);

    // Clean up
    if (this.overrideAction) {
      this.action = defaultAction;
    }
    if (this.overrideMthod) {
      this.method = defaultMethod;
    }
    this.responder = null;
  },

  initDragAndDrop: function () {
    //This code will eventually need to be changed.
    //on some operations, only single lists need to be re-initialized

    //===== [ SORTABLES ] =====
    //get sortable_containers element by className
    $sortable_containers =  $$(".list_container");

    //get sortable_containers' ids
    $sortable_containers_ids = $sortable_containers.pluck("id");

    //make each container Sortable
    $sortable_containers_ids.each(function (s) {
      Sortable.create(s, {
        tag: 'li',
        dropOnEmpty: true,
        handle: "taskhandle",
        constraint: false,
        onUpdate: Application.updateTasksOrder,
        containment: $sortable_containers_ids
      });
    });
  },

  updateTasksOrder: function(container) {
    var task_list_id = container.identify().replace(/task_list_container_/gi, '');
    var tl = task_list(task_list_id);
    var seq = Sortable.sequence(container.identify());
    tl.setTaskSequence(seq);
  },

  initSliders: function() {
    //get slider tracks' ids
    $slider_track_elements = $$(".slider_track");
    $slider_track_elements.each(function (s) {
      id = Application.strip_id(s);
      if (id != '') {
        currentTask = task(id);
        currentTask.initSlider();
      }
    });
  },

  updateActiveTasks: function() {
    if ($$(".active").length <= 0) {
      return;
    }
    var options = {
      method: "put",
      onSuccess: function (transport) {
        //read json response
        var json = transport.responseText.evalJSON();
        var jsonTaskLists = json.tasklists.evalJSON();
        var jsonTasks = json.tasks.evalJSON();

        //update tasks
        for (var i = 0; i < jsonTasks.length; i++) {
          var id = jsonTasks[i].id;
          var t = task(id);
          t.earnings().update(jsonTasks[i].task_earnings);
          t.duration().update(jsonTasks[i].task_duration);
          t.durationBar().replace(jsonTasks[i].task_duration_bar);
        }

        //update taskLists
        for (var i = 0; i < jsonTaskLists.length; i++) {
          var id = jsonTaskLists[i].id;
          var l = task_list(id);
          l.earnings().update(jsonTaskLists[i].task_list_earnings);
          l.duration().update(jsonTaskLists[i].task_list_duration);
        }

        //update grand total
        $("grand_total_earnings").update(json.total_earnings);
        $("grand_total_duration").update(json.total_duration);
      },
      requestHeaders: {
        "X-CSRF-Token": $$('meta[name=csrf-token]')[0].readAttribute('content')
      }
    };
    new Ajax.Request("/task_lists/refreshactivetasks", options);
  },

  //this method called every 1000ms to show/hide clock colons.
  clockTick: function() {
    var c;
    var showColon = Application.toggleTick();
    $active_tasks =  $$(".active");
    $active_tasks.each(function (taskElem) {
      t = task(Application.strip_id(taskElem));
      c = t.duration().down(".colon");
      if (c != null) {
        if(showColon) {
          c.addClassName("colonTick");
        } else {
          c.removeClassName("colonTick");
        }
      }
    });
  },

  toggleTick: function() {
    $showTick = $showTick ? false : true;
    return $showTick;
  },

  toggleTotals: function() {
    $sortable_containers =  $$(".list_container");
    $sortable_containers.each(function (s) {
      var l = task_list(Application.strip_id(s));
      l.checkIfTotalNeeded();
    });
  },

  hideTaskForms: function() {
    //lists (task_form + task_list_form)
    $lists = $$(".list_container");
    $lists.each(function (s) {
      var tl = task_list(Application.strip_id(s));
      tl.task_form().hide();
      tl.task_list_form().hide();
    });
    //tasks (task_form)
    $tasks = $$(".task_container");
    $tasks.each(function (s) {
      var t = task(Application.strip_id(s));
      t.task_form().hide();
    });
    //task_list_Create
    var taskListCreator = $("task_list_new");
    taskListCreator.hide();
    $A(taskListCreator.getElementsByTagName("INPUT")).invoke("disable");
  },

  formattedTime: function(t) {
    var res = (total < 0) ? '-' : '+';
    var mins = Math.abs(t % 60);
    if(mins < 10) {
      mins = '0' + mins;
    }
    res += Math.floor(Math.abs(t / 60)) + ':' + mins;
    return res;
  },

  strip_id: function(element) {
    //some_element_12 => 12
    var full_id = element.id;
    var idx = full_id.lastIndexOf('_');
    return full_id.substring(idx + 1);
  }
};