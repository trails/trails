//= require prototype
//= require effects
//= require _libs
//= require scriptaculous
//= require slider
//= require Sortable
//= require stepsForm

//= require controller
//= require controller/task
//= require controller/actions
//= require controller/task_list
//= require controller/task_form
//= require controller/task_list_form
//= require controller/invoice
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
    Application.invoiceZoomOut();
    Application.initClientForms();
  },

  CSRFAjax: function() {
    Ajax.Base.prototype.initialize = Ajax.Base.prototype.initialize.wrap(
      function (original, options) {
        var headers = options.requestHeaders || {},
            token = $$('meta[name=csrf-token]')[0].readAttribute('content');
        headers["X-CSRF-Token"] = token
        options.requestHeaders = headers;
        return original(options);
      }
    );
  },

  extendElement: function() {
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

    $S('.task_list > .title').observe('click', function(event) {
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
    $S('#invoices > h2').observe('click', function(event) {
      Application.invoiceZoomOut();
      $('invoices').toggleClassName('show');
    });
    $S('#invoices.show > ul:not(.zoomed) > li, #invoices.show > ul:not(.zoomed) > li *').observe('click', function(event) {
      var element =
        event.element().match('#invoices > ul > li')
          ? event.element()
          : event.element().up('#invoices > ul > li');
      Application.invoiceZoomIn(element);
    });
    $S('#invoices.show > ul.zoomed, #invoices > ul.zoomed > li:not(.zoom)').observe('click', function(event) {
      Application.invoiceZoomOut();
    });
    window.addEventListener('resize', Application.handleResize, false);
  },

  INVOICES_CSS_SCALE: .2,
  invoiceZoomIn: function (element) {
    var listWidth = $$('#invoices > ul')[0].getLayout().get('width');
    var listHeight = $$('#invoices > ul')[0].getLayout().get('height');
    var scaleX = listWidth / element.getLayout().get('margin-box-width');
    var scaleY = listHeight / element.getLayout().get('margin-box-height');
    var width = element.getLayout().get('margin-box-width');
    var height = element.getLayout().get('margin-box-height');
    var scale = scaleX < scaleY ? scaleX : scaleY;
    var realScale = scale * Application.INVOICES_CSS_SCALE;
    var offsetX = ((listWidth - width * scale) / 2 - element.offsetLeft * scale) * Application.INVOICES_CSS_SCALE;
    var offsetY = ((listHeight - height * scale) / 2 - element.offsetTop * scale) * Application.INVOICES_CSS_SCALE;
    $$('#invoices > ul')[0].addClassName('zoomed').setStyle({
      transform:
        'translate(' + offsetX.toString() + 'px, ' + offsetY.toString() + 'px) ' +
        'scale(' + realScale.toString() + ')'
    });
    element.addClassName('zoom');
  },
  invoiceZoomOut: function () {
    var zoomItem = $$('#invoices > ul > li.zoom');
    if (zoomItem.length) {
      zoomItem[0].removeClassName('zoom');
    }
    $$('#invoices > ul')[0].removeClassName('zoomed').setStyle({
      transform: 'translate(0, 0) scale(' + Application.INVOICES_CSS_SCALE + ')'
    });
  },


  showClientView: function (form) {
    var clientLayout = form.next('span');
    clientLayout.addClassName('show');
    form.addClassName('hide');
  },
  initClientForms: function() {
    $$('#invoices li > header + section > form').each(function (theForm) {
      theForm.observe("submit", Application.formSubmitHandler);

      theForm.stepForm = new stepsForm(theForm, {
        onSubmit: function (form) {
          var status = theForm.readAttribute('status');
          theForm.responder = client(0, theForm).client_form();
          theForm.overrideAction = '/clients' + (status == 'new' ? '' : '/' + theForm.readAttribute('client'));
          theForm.overrideMethod = status == 'new' ? 'post' : 'put';
          theForm.down('button[type="submit"]').click();
        },
        onInput: function (ev) {
          var input = ev.target;
          if (input.match('form[action^="/clients"] input[type="email"]')) {
            new Ajax.Request("/clients/" + input.value, {
              method: 'get',
              onSuccess: function (transport) {
                var client = transport.responseJSON,
                    status = theForm.readAttribute('status'),
                    current = theForm.readAttribute('client');
                if (status == 'edit') {
                  if (client.email && client.id != current) {
                    // email address already in use
                  }
                } else {
                  Client.render(client, theForm);
                  theForm.stepForm.reset();
                }
              }
            });
          }
        },
        beforeNextQuestion: function () {
          var status = theForm.readAttribute('status');
          if (status == 'new' || status == 'edit') {
            return true;
          }
          Application.showClientView(theForm);
          theForm.stepForm.reset();
          return false;
        }
      });
      theForm.next('span').down('button.edit').observe('click', function(ev) {
        var id = theForm.readAttribute('client');
        theForm.writeAttribute('status', 'edit');
        client(id, theForm).client_form().show();
      });
      theForm.next('span').down('button.change').observe('click', function(ev) {
        var id = theForm.readAttribute('client');
        theForm.writeAttribute('status', 'select');
        client(id, theForm).client_form().show();
      });
      var id = parseInt(theForm.readAttribute('client'));
      theForm.writeAttribute('status', id ? 'display' : 'select');
      if (id) {
        client(id, theForm).show()
      }
    });
  },

  handleResize: function () {
    if (!$('invoices').match('.show')) {
      return;
    }
    if ($$('#invoices > ul')[0].match('.zoomed')) {
      var element = $$('#invoices > ul > li.zoom')[0];
      Application.invoiceZoomIn(element);
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

    Application.initInvoicesDnD();
  },

  initInvoicesDnD: function () {
    $$("#invoices li main > ul").each(function (container) {
      Sortable.create(container, {
        draggable: 'li.task_container',
        group: {
          name: 'invoices',
          pull: true,
          put: ['taskList']
        },
        onAdd: function (evt) {
          Application.updateInvoiceTasksOrder(evt.target.up('#invoices > ul > li'));
        },
        onUpdate: function (evt) {
          Application.updateInvoiceTasksOrder(evt.target.up('#invoices > ul > li'));
        },
        onRemove: function (evt) {
          Application.updateInvoiceTasksOrder(evt.target.up('#invoices > ul > li'));
        }
      });
    });
  },

  updateInvoiceTasksOrder: function (container) {
    var invoice_id = Application.strip_id(container);
    var inv = invoice(invoice_id);
    var seq = Application.getSequence(container.down('ul'));
    inv.setTaskSequence(seq);
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
        var item = evt.item;
        var parent = item.parentNode;
        var id = item.identify().replace(/task_container_/gi, '');
        var list_id = parent.identify().replace(/task_list_container_/gi, '');
        var t = task(id);
        t.taskListBeforeDnD = list_id;

        Application.invoicesShownBeforeDnD = $('invoices').hasClassName('show');
        $('invoices').addClassName('show');
        clearTimeout(Application.invoicesDnDTimeout);
      },
      onEnd: function (evt) {
        var afterDropFn = function() {
          if (!Application.invoicesShownBeforeDnD) {
            $('invoices').removeClassName('show');
          }
        };
        clearTimeout(Application.invoicesDnDTimeout);
        Application.invoicesDnDTimeout = setTimeout(afterDropFn, 400);
      },
      onAdd: function (evt) {
        Application.updateListTasksOrder(evt.target.parentNode);
      },
      onUpdate: function (evt) {
        Application.updateListTasksOrder(evt.target);
      },
      onRemove: function (evt) {
        var parent = evt.item.parentNode;
        if (parent.hasClassName('list_container')) {
          // task was moved to another list
          Application.updateListTasksOrder(evt.target);
        } else if (parent.match('#invoices > ul > li:not(.new) main > ul')) {
          // task was moved to an invoice
        }
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
        var maxDuration = 0;
        $$('.duration_bar').each(function (element) {
          var duration = parseInt(element.readAttribute('duration'));
          if (duration > maxDuration) {
            maxDuration = duration;
          }
        });
        $$('.duration_bar').each(function (element) {
          var duration = parseInt(element.readAttribute('duration'));
          element.setStyle({
            width: (duration * 100 / maxDuration) + '%'
          });
        });

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

        Application.toggleTotals();

        setTimeout(Application.updateTasks, 10000);
      }
    };
    new Ajax.Request("/task_lists/refresh", options);
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