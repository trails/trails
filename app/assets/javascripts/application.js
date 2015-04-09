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

var Application = {
  init: function() {
    Application.extendElement();

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

  fillClientData: function (form, client) {
    form.elements['client[id]'].value = client ? client.id : '';
    form.elements['client[name]'].value = client ? client.name : '';
    form.elements['client[country]'].value = client ? client.country : '';
    form.elements['client[state]'].value = client ? client.state : '';
    form.elements['client[city]'].value = client ? client.city : '';
    form.elements['client[zip]'].value = client ? client.zip : '';
    form.elements['client[address]'].value = client ? client.address : '';
    var clientLayout = form.next('span');
    clientLayout.down('h4').innerHTML = client ? client.name : '';
    clientLayout.down('p').innerHTML =
      client
        ?
          client.address + "\n" +
          client.city + ', ' + client.state + ', ' + client.zip + "\n" +
          client.country
        : '';
  },

  showClientForm: function (stepForm) {
    var form = stepForm.el;
    var clientLayout = form.next('span');
    clientLayout.removeClassName('show');
    form.removeClassName('hide');
  },
  showClientView: function (stepForm) {
    var form = stepForm.el;
    var clientLayout = form.next('span');
    clientLayout.addClassName('show');
    form.addClassName('hide');
    stepForm.reset();
  },
  initClientForms: function() {
    $$('#invoices li > header + section > form').each(function (theForm) {
      var stepForm = new stepsForm(theForm, {
        onSubmit: function (form) {
          var form_client = theForm.readAttribute('state');
          if (form_client == 'new') {
            // @TODO: create new client
          } else {
            Application.showClientView(stepForm);
          }
        },
        onInput: function (ev) {
          var input = ev.target;
          if (input.match('form.edit_client:not([state="edit"]) input[type="email"]')) {
            new Ajax.Request("/clients/" + input.value, {
              method: 'get',
              requestHeaders: {
                "X-CSRF-Token": $$('meta[name=csrf-token]')[0].readAttribute('content')
              },
              onSuccess: function (transport) {
                var client = transport.responseJSON;
                theForm.writeAttribute('state', client ? client.id : 'new');
                Application.fillClientData(theForm, client);
              }
            });
          }
        },
        beforeNextQuestion: function () {
          var form_client = theForm.readAttribute('state');
          if (form_client == 'new' || form_client == 'edit') {
            return true;
          }
          Application.showClientView(stepForm);
          return false;
        }
      });
      theForm.next('span').down('button.edit').observe('click', function(ev) {
        theForm.writeAttribute('state', 'edit');
        Application.showClientForm(stepForm);
      });
      theForm.next('span').down('button.change').observe('click', function(ev) {
        theForm.writeAttribute('state', 'select');
        Application.showClientForm(stepForm);
      });
      if (parseInt(theForm.readAttribute('state'))) {
        Application.showClientView(stepForm);
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
    if (!invoice_id) {
      return;
    }
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
      },
      requestHeaders: {
        "X-CSRF-Token": $$('meta[name=csrf-token]')[0].readAttribute('content')
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