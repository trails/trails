Element.addMethods({
  recordID: function(element) {
    do {
      element = element.parentNode;
    } while(!element.id && !element.href);

    if(element.id) {
      var match = element.id.match(/\d+/);
      if(!match) return "new";
      return  parseInt(match[0]);
    }

    if(element.href) {
      return  parseInt(element.href.match(/\d+/).last());
    }
  },

  fadeDelete: function(element) { //fades element, then deletes it
    element.fade({
      afterFinish: function() {
        element.remove();
       }
    });
  }
});

/**
 * Defines an element controller. e.g.
 * >
 * >   controller('task', {methods}, {more methods}, ...)
 * >
 * creates the class Task, and the find-or-create-by-id-constructor task(id)
 *
 * - When using the constructor, instances will have their IDs already set.
 * - All instances also have a property .className (in this case "task") which can be used for reflection.
 * - {methods} works the same as Class.create(), only exception being that you can add as many as you'd like
 * - all controllers will inherit from the class Controller
 */
function controller(className, method_hashes_) {
  var constantName = ("-"+className.dasherize()).camelize();
  var klass = window[constantName] = Class.create(Controller)
  klass.prototype.className = className;
  klass.cache = {};
  window[className] = function(id) {
    var instance = klass.cache[id];
    if (!instance) {
      instance = new klass();
      instance.id = id;
      klass.cache[id] = instance;
    }
    return instance;
  };
  $A(arguments).slice(1).each(function(methods){
    klass.addMethods(methods);
  })
}

/*
 * Hook up as an event observer.
 * Only fires on left clicks.
 * Will stop the event and delegate it to the +constructor+'s +_event_handler_+
 * (already instantiated with the apropriate record ID set)
 * You can pass severeral +_method_+s to specify a call chain path from the constructor
 */
function action(constructor, _methods_, _event_handler_) {
  var methods = $A(arguments).slice(1);
  var eventHandlerName = methods.pop();
  return function(event) {
    if (event.stopped) return;
    if (event.isLeftClick()) {
      event.stop();
      var callObj = constructor(event.element().recordID())
      methods.each(function(method){
        if (Object.isFunction(callObj[method]) ){
          callObj = callObj[method]();
        } else {
          callObj = callObj[method];
        }
      })
      callObj[eventHandlerName](event);
    }
  }
}

// Method gen macros

function ajaxActions(_actions_) {
  var methods = {}
  $A(arguments).each(function(methodName){
    methods[methodName] = function(options) {
      return this.ajaxAction(methodName, options);
    }
    methods["after"+methodName.capitalize()] = function(transport) {
      return this.afterAjaxAction(methodName, transport);
    }
  })
  return methods;
}


function autoBuildChild(_names_) {
  var methods = {}
  $A(arguments).each(function(childAttrib){
    var childAttribName, childAttribClass;
    if(Object.isArray(childAttrib)) {
      childAttribName = childAttrib[0];
      childAttribClass = childAttrib[1];
    } else {
      childAttribName = childAttrib;
    }
    methods[childAttribName] = function() {
      var cachedName = "_"+childAttribName;
      childAttribClass = childAttribClass || window[("-"+childAttribName.dasherize()).camelize()];
      if(!this[cachedName]) {
        this[cachedName] = new childAttribClass();
        this[cachedName][this.className] = this;
      }
      return this[cachedName]
    }
  })
  return methods;
}

var Controller = Class.create({
  element: function() {
    return $(this.className+"_"+this.id);
  },
  baseURL: function() {
    return "/" + this.className + "s/"
  },
  url: function() {
    return this.baseURL() + this.id + "/"
  },
  ajaxAction: function(name, options){
    var ajaxOptions = {
      onSuccess: this["after"+name.capitalize()].bind(this),
      requestHeaders: {
        "X-CSRF-Token": $$('meta[name=csrf-token]')[0].readAttribute('content')
      }
    };
    if(options) Object.extend(ajaxOptions, options);
    return new Ajax.Request(this.url(),ajaxOptions);
  },
  afterAjaxAction: function(name, transport){
    this.element().replace(transport.responseText);
  }
})

function strip_id(element){
  //some_element_12 => 12
  var full_id = element.id;
  var idx = full_id.lastIndexOf("_");
  return full_id.substring(idx+1);
}

function mainFormSubmitHandler(event) {
  event.stop();
  var options = {
    requestHeaders: {
    "X-CSRF-Token": $$('meta[name=csrf-token]')[0].readAttribute('content')
    }
  };
  // Setup before request
  if(this.overrideAction) {
    var defaultAction = this.action;
    this.action = this.overrideAction;
  }
  if(this.overrideMthod) {
    var defaultMethod = this.method;
    this.method = this.overrideMthod;
  }
  if(this.responder) {
    if(this.responder.onSuccess) options.onSuccess = this.responder.onSuccess.bind(this.responder)
  }
  // Perform request!
  this.request(options);

  // Clean up
  if(this.overrideAction) {
    this.action = defaultAction;
  }
  if(this.overrideMthod) {
    this.method = defaultMethod;
  }
  this.responder = null;
}

function updateTasksOrder(container){
  var task_list_id = container.identify().replace(/task_list_container_/gi, '');
  var tl = task_list(task_list_id);
  var seq = Sortable.sequence(container.identify());
  tl.setTaskSequence(seq);
}

function debug(string){
  $("debugger").innerHTML += string + "\n";
}

function initSliders(){
  //get slider tracks' ids
  $slider_track_elements = $$(".slider_track");
  $slider_track_elements.each(function(s) {
    id = strip_id(s);
    if (id != "") {
      currentTask = task(id);
      currentTask.initSlider();
    }
  });
}

function formattedTime(t){
  var res = "";
  if(total<0){
    res ="-";
  }else{
    res = "+";
  }
  var mins = Math.abs(t%60);
  if(mins <10){
    mins = "0"+mins;
  }
  res += Math.floor(Math.abs(t/60)) + ":" + mins;
  return res;
}

function toggleTotals(){
  $sortable_containers =  $$(".list_container");
  $sortable_containers.each(function(s) {
    var l = task_list(strip_id(s));
    l.checkIfTotalNeeded()
  });
}

function initDragAndDrop(){
  //This code will eventually need to be changed.
  //on some operations, only single lists need to be re-initialized

  //===== [ SORTABLES ] =====
  //get sortable_containers element by className
  $sortable_containers =  $$(".list_container");

  //get sortable_containers' ids
  $sortable_containers_ids = $sortable_containers.pluck("id");

  //make each container Sortable
  $sortable_containers_ids.each(function(s) {
    Sortable.create(s, { tag: 'li', dropOnEmpty: true, handle: "taskhandle", constraint: false, onUpdate: updateTasksOrder , containment: $sortable_containers_ids });
  });
}
function updateACtiveTasks(){
  if($$(".active").length<=0)
    return;
   var options = {
      method: "put",
    onSuccess:this["updateACtiveTasks_callback"].bind(this),
    requestHeaders: {
      "X-CSRF-Token": $$('meta[name=csrf-token]')[0].readAttribute('content')
    }
    };
    new Ajax.Request("/task_lists/refreshactivetasks", options);
}

function updateACtiveTasks_callback(transport){
  //read json response
  var json = transport.responseText.evalJSON();
  var jsonTaskLists = json.tasklists.evalJSON();
  var jsonTasks = json.tasks.evalJSON();
  //update tasks
  for(var i=0; i<jsonTasks.length;i++){
    var id = jsonTasks[i].id;
    var t = task(id);
    t.earnings().update(jsonTasks[i].task_earnings);
    t.duration().update(jsonTasks[i].task_duration);
    t.durationBar().replace(jsonTasks[i].task_duration_bar);
    t.durationBar().highlight();
  }
  //update taskLists
  for(var i=0; i<jsonTaskLists.length;i++){
    var id = jsonTaskLists[i].id;
    var l = task_list(id);
    l.earnings().update(jsonTaskLists[i].task_list_earnings);
    l.duration().update(jsonTaskLists[i].task_list_duration);
  }
  //update grand total
  $("grand_total_earnings").update(json.total_earnings);
  $("grand_total_duration").update(json.total_duration);
}

//this method called every 1000ms to show/hide clock colons.
function clockTick(){
  var c;
  var showColon = toggleTick();
  $active_tasks =  $$(".active");
  $active_tasks.each(function(taskElem) {
    t = task(strip_id(taskElem));
    c = t.duration().down(".colon");
    if (c != null) {
      if(showColon)
      c.addClassName("colonTick");
    else
      c.removeClassName("colonTick");
    }
  });
}

function toggleTick(){
  if($showTick)
    $showTick = false;
  else
    $showTick = true;
  return $showTick;
}

function hideTaskForms(){
  //lists (task_form + task_list_form)
  $lists =  $$(".list_container");
  $lists.each(function(s) {
    var tl = task_list(strip_id(s));
    tl.task_form().hide();
    tl.task_list_form().hide();
  });
  //tasks (task_form)
  $tasks = $$(".task_container");
  $tasks.each(function(s) {
    var t = task(strip_id(s));
    t.task_form().hide();
  });
  //task_list_Create
  var taskListCreator = $("task_list_new");
  taskListCreator.hide();
  $A(taskListCreator.getElementsByTagName("INPUT")).invoke("disable");
}