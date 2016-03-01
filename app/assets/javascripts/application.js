//= require prototype
//= require effects
//= require _libs
//= require scriptaculous
//= require slider
//= require Sortable
//= require stepsForm

//= require controller
//= require controller/actions

//= require controller/task
//= require controller/task_form

//= require controller/task_list
//= require controller/task_list_form

//= require controller/invoice
//= require controller/invoice_form

//= require controller/client
//= require controller/client_form

var Application = {
  init: function() {
    Application.extendElement();
    Application.CSRFAjax()

    Application.initDragAndDrop();
    Application.initSliders();
    Application.updateTasks();
    //Initialize clockTicking
    $showTick = false;
    setInterval(Application.clockTick, 500);

    //check if totals need to be shown for each list
    Application.toggleTotals();
    Application.attachEventHandlers();

    Invoice.init();
    setInterval(Task.renderDurationBars, 200);
  },

  CSRFAjax: function() {
    if (0 == $$('meta[name=csrf-token]').length) {
      return;
    }
    Ajax.Base.prototype.initialize = Ajax.Base.prototype.initialize.wrap(
      function (original, options) {
        var headers = options.requestHeaders || {},
            token = $$('meta[name=csrf-token]')[0].readAttribute('content');
        headers["X-CSRF-Token"] = token;
        options.requestHeaders = headers;
        return original(options);
      }
    );
  },

  extendElement: function() {
    Element.addMethods({
      recordID: function (element, prefix) {
        var ret = null;
        while (element) {
          var matchRegEx = new RegExp((prefix ? prefix : '') + '\\_(\\d+|new)(?:$|\\_.+)');
          var match;
          if (element.id && matchRegEx.test(element.id)) {
            match = matchRegEx.exec(element.id);
          }
          if (element.href && matchRegEx.test(element.href)) {
            match = matchRegEx.exec(element.href);
          }
          if (match) {
            ret = match[1];
            break;
          }
          element = element.parentNode;
        }
        return ret;
      },

      fadeDelete: function (element) { //fades element, then deletes it
        element.fade({
          afterFinish: function () {
            element.remove();
           }
        });
      },

      findChildren: function(element, tagName) {
        if(!element.hasChildNodes()) return null;
        tagName = tagName.toUpperCase();
        var elements = [];
        $A(element.childNodes).each(function(e) {
          if(e.tagName && e.tagName.toUpperCase()==tagName)
              elements.push(e);
        });
        return (elements.length>0 ? elements.flatten() : []);
      }
    });
  },

  attachEventHandlers: function() {
    $$('section.task_list > .title').each(function(element) {
      element.insert({top: '<i class="fa fa-caret-down"></i>'});
    });
    $("task_form").observe("submit", Application.formSubmitHandler);
    $S(".task .toolbar .edit, .task .toolbar .edit > i").observe("click", function(event) {
      if (event.stopped || !event.isLeftClick()) return;
      event.stop();
      var id = event.element().recordID();
      task(id).edit(event);
    });

    $S(".task .toolbar .delete, .task .toolbar .delete > i").observe("click", function(event) {
      if (event.stopped || !event.isLeftClick()) return;
      event.stop();
      var id = event.element().recordID();
      task(id).remove(event);
    });

    $S('.task_list > .title > i').observe('click', function(event) {
      var currentTh = $(Event.element(event)).up('.title');
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
        $(currentTh).down('i').removeClassName('fa-caret-right').addClassName('fa-caret-down');
        addTotalTo.down('span').remove();
        currentTotal.show();
      } else {
        $(currentTh).down('i').removeClassName('fa-caret-down').addClassName('fa-caret-right');
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

    $S(".new_task a, .new_task a > i").observe("click", function(event) {
      if (event.stopped || !event.isLeftClick()) return;
      event.stop();
      var id = event.element().recordID();
      task_list(id).task_form().show(event);
    });
    $S(".task_list .toolbar .edit, .task_list .toolbar .edit > i").observe("click", function(event) {
      if (event.stopped || !event.isLeftClick()) return;
      event.stop();
      var id = event.element().recordID();
      task_list(id).edit(event);
    });
    $S(".task_list .toolbar .delete, .task_list .toolbar .delete > i").observe("click", function(event) {
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
      var id = element.parentNode.recordID('task_list');
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
      element.form.overrideMethod = element.readAttribute("method");
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
    $S('#slide > form > h2').observe('click', function(event) {
      var item = event.target,
          parent = item.parentNode;
      $$('#slide > form.current').invoke('removeClassName' ,'current');
      parent.addClassName('current');
      if (!item.readAttribute('id') == 'invoices') {
        Invoice.zoomOut();
      }
      $('slide').addClassName('show');
    });
    $S('#slide.show #invoices > div > ul:not(.zoomed) > li, #slide.show #invoices > div > ul:not(.zoomed) > li *').observe('click', function(event) {
      var id = event.element().recordID('invoice');
      invoice(id).zoomIn();
    });
    $S('#slide.show #invoices, #slide.show #invoices > div, #slide.show #invoices > div > ul.zoomed, #invoices > div > ul.zoomed > li:not(.zoom) *').observe('click', function(event) {
      Invoice.zoomOut();
    });
    $S('#slide.show > a:last-child > i').observe('click', function(event) {
      event.preventDefault();
      $('slide').removeClassName('show');
      return false;
    });

    $S('#settings > ul > li:nth-child(2) h3 a > i').observe('click', function(event) {
      event.preventDefault();
      if (!navigator.geolocation) {
        return false;
      }
      navigator.geolocation.getCurrentPosition(function(position) {
        var lat = position.coords.latitude,
            lon = position.coords.longitude;

        new Ajax.Request("/users/me", {
          method: 'put',
          parameters: {
            "user[latitude]": lat,
            "user[longitude]": lon
          },
          onSuccess: function (transport) {
            var json = transport.responseJSON;
            if (json.country) $('user_country').value = json.country;
            if (json.state) $('user_state').value = json.state;
            if (json.city) $('user_city').value = json.city;
            if (json.address) $('user_address').value = json.address;
            if (json.zip) $('user_zip').value = json.zip;
          }
        });
      });
      return false;
    });
    $("settings").observe("submit", Application.formSubmitHandler);

    window.addEventListener('resize', Application.handleResize, false);
    window.addEventListener('keyup', Application.handleKeyUp);
  },

  handleKeyUp: function (event) {
    switch(event.keyCode) {
      case 27:
        Application.handleEscKey(event);
        break;
    }
  },

  handleEscKey: function(event) {
    var element = document.activeElement;
    if (element == $$('body')[0]) {
      if (Invoice.isActiveTab() && Invoice.isZoomed()) {
        Invoice.zoomOut();
      } else if ($('slide').hasClassName('show')) {
        $('slide').removeClassName('show');
      }
    } else {
      var cancelLink = element.up('section') ? element.up('section').down('a[href="#cancel"]') : false;
      if (cancelLink) {
        cancelLink.click();
      } else {
        element.blur();
      }
    }
  },

  handleResize: function () {
    if (!$('slide').hasClassName('show')) {
      return;
    }
    if ($$('#invoices > div > ul')[0].hasClassName('zoomed')) {
      var id = $$('#invoices > div > ul > li.zoom')[0].recordID();
      invoice(id).zoomIn();
    }
  },

  formSubmitHandler: function (event) {
    event.stop();
    var action = this.overrideAction ? this.overrideAction : this.action,
        method = this.overrideMethod ? this.overrideMethod : this.method,
        options = {
          method: method,
          parameters: this.serialize()
        };

    if (this.responder && this.responder.onSuccess) {
      options.onSuccess = this.responder.onSuccess.bind(this.responder);
    }
    // Perform request!
    var request = new Ajax.Request(action, options); //this.request(options);

    this.responder = null;
  },

  initDragAndDrop: function () {
    //This code will eventually need to be changed.
    //on some operations, only single lists need to be re-initialized

    //===== [ SORTABLES ] =====
    //get sortable_containers element by className
    $sortable_containers =  $$(".list_container");

    //make each container Sortable
    $sortable_containers.each(function (container) {
      Application.dragAndDropTaskList(container);
    });
  },

  dragAndDropTaskList: function (task_list_container) {
    var task_list_id = Application.strip_id(task_list_container);
    var tl = task_list(task_list_id);
    tl.sortable =  Sortable.create(task_list_container, {
      draggable: 'li.task_container',
      group: {
        name: 'taskList',
        pull: true,
        put: ['invoices']
      },
      animation: 100,
      onStart: function (evt) {
        $$('body')[0].addClassName('dnd');

        var item = evt.item;
        var parent = item.parentNode;
        var id = item.identify().replace(/task_container_/gi, '');
        var list_id = parent.identify().replace(/task_list_container_/gi, '');
        var t = task(id);
        t.taskListBeforeDnD = list_id;

        Application.invoicesShownBeforeDnD = $('slide').hasClassName('show');
        $('slide').addClassName('show');
        clearTimeout(Application.invoicesDnDTimeout);
      },
      onEnd: function (evt) {
        var afterDropFn = function() {
          if (!Application.invoicesShownBeforeDnD) {
            $('slide').removeClassName('show');
          }
          $$('body')[0].removeClassName('dnd');
        };
        clearTimeout(Application.invoicesDnDTimeout);
        Application.invoicesDnDTimeout = setTimeout(afterDropFn, 400);
      },
      onAdd: function (evt) {
        Application.updateListTasksOrder(evt.target.parentNode);
      },
      onUpdate: function (evt) {
        Application.updateListTasksOrder(evt.target);
      }
    });
  },

  updateListTasksOrder: function(container) {
    var task_list_id = Application.strip_id(container);
    var tl = task_list(task_list_id);
    var seq = Application.getSequence(container);
    tl.setTaskSequence(seq);
  },

  getSequence: function(element) {
    return $(Element.findChildren(element, 'li') || []).map( function(item) {
      var matchre = /^[^_\-](?:[A-Za-z0-9\-\_]*)[_](.*)$/;
      return item.id.match(matchre) ? item.id.match(matchre)[1] : '';
    });
  },

  getEarningsSequence: function(element) {
    return $(Element.findChildren(element, 'li') || []).map( function(item) {
      return parseFloat(item.down('.task > .earnings').innerHTML.trim().replace(/[^0-9.]/g, ''));
    });
  },

  getDurationSequence: function(element) {
    return $(Element.findChildren(element, 'li') || []).map( function(item) {
      return parseFloat(item.down('.task > .duration').getAttribute('duration'));
    });
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

  updateTasks: function() {
    var options = {
      method: "put",
      onSuccess: function (transport) {
        //read json response
        var json = transport.responseJSON;
        var lists = json.tasklists;
        var tasks = json.tasks;

        //update tasks
        for (var i = 0; i < tasks.length; i++) {
          var id = tasks[i].id;
          task(id).update({
            earnings: '$' + tasks[i].task_earnings,
            duration: tasks[i].running_time
          });
        }

        //update taskLists
        for (var i = 0; i < lists.length; i++) {
          var id = lists[i].id;
          var l = task_list(id);
          l.earnings().update(lists[i].task_list_earnings);
          l.duration().update(lists[i].task_list_duration);
        }

        //update grand total
        $("grand_total_earnings").update(json.total_earnings);
        $("grand_total_duration").update(json.total_duration);

        Application.toggleTotals();

        setTimeout(Application.updateTasks, 2000);
      }
    };
    return new Ajax.Request("/task_lists/refresh", options);
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
    $$(".list_container").each(function (s) {
      var l = task_list(Application.strip_id(s));
      l.checkIfTotalNeeded();
    });
  },

  formattedTime: function(t) {
    var mins = parseInt(Math.abs(t % 60));
    if(mins < 10) {
      mins = '0' + mins;
    }
    res = Math.floor(Math.abs(t / 60)) + ':' + mins;
    return res;
  },

  strip_id: function(element) {
    //some_element_12 => 12
    var full_id = element.id;
    var idx = full_id.lastIndexOf('_');
    return full_id.substring(idx + 1);
  }
};
