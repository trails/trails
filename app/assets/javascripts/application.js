//= require prototype
//= require effects
//= require dragdrop
//= require _libs
//= require scriptaculous
//= require slider

//= require core
//= require controller/task
//= require controller/actions
//= require controller/task_list
//= require controller/task_form
//= require controller/task_list_form

$S(".task .toolbar .edit").observe("click", action(task, "edit"));
$S(".task .toolbar .delete").observe("click", action(task, "remove"));

// Show/hide task_list
Event.observe(window, 'load', function() {
  $$("th.title").each(function(element) {element.insert(" <small>-</small>")});
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
  if(currentList.visible()) {
      $(currentTh).down().update("-");
      addTotalTo.down('span').remove();
      currentTotal.show();
  } else {
      $(currentTh).down().update("+");
      addTotalTo.update('<span>' + currentEarnings + ' ' + currentDuration + '</span> ' + newTaskLink);
      currentTotal.hide();
  }
});

// Need to improve this simple functions
$S(".start_task").observe("click", function(){
    document.title = "*Trails";
});

$S(".stop_task").observe("click", function(){
    document.title = "Trails";
});

$S(".start_task").observe("click", action(task,"actions","start"));
$S(".stop_task").observe("click", action(task,"actions","stop"));
$S("input.stopped_task").observe("click", action(task,"actions","complete"));
$S("input.complete_task").observe("click", action(task,"actions","reopen"));

//$S(".task.stopped *").observe("click", action(task,"actions","start"))
//$S(".task.active *").observe("click", action(task,"actions","stop"))

$S(".new_task a").observe("click", action(task_list,"task_form", "show"));
$S(".task_list .toolbar .edit").observe("click", action(task_list, "edit"));
$S(".task_list .toolbar .delete").observe("click", action(task_list, "remove"));

$S(".new.task.form .submit a").observe("click", action(task_list,"task_form", "hide"));
$S(".edit.task.form .submit a").observe("click", action(task,"task_form", "hide"));

$S(".task.new .submit input[type=submit]").observe("click", function(event){
  var element = event.element();
  element.form.responder = task_list(element.recordID()).task_form()
});

$S(".task.edit .submit input[type=submit]").observe("click", function(event){
  var element = event.element();
  element.form.responder = task(element.recordID()).task_form()
});

$S("#new_task_list").observe("click", action(task_list_form, "show"));
$S(".new.task_list.form .submit a").observe("click", action(task_list_form, "hide"));
$S(".edit.task_list.form .submit a").observe("click", action(task_list,"task_list_form", "hide"));

$S(".task_list.new .submit input[type=submit]").observe("click", function(event){
  var element = event.element();
  element.form.responder = task_list_form()
});

$S(".task_list.edit .submit input[type=submit]").observe("click", function(event){
  var element = event.element();
  element.form.responder = task_list(element.recordID()).task_list_form()
});

$S("input[type=submit][action]").observe("click", function(event){
  var element = event.element();
  element.form.overrideAction = element.readAttribute("action");
});

$S("input[type=submit][method]").observe("click", function(event){
  var element = event.element();
  element.form.overrideMthod = element.readAttribute("method");
});

document.observe("dom:loaded", function(){
 
  $("task_form").observe("submit", mainFormSubmitHandler);
  initDragAndDrop();
  initSliders();
  setInterval ( "updateACtiveTasks()", 10000 );
  
  //Initialize clockTicking
  $showTick = false;
  setInterval ( "clockTick()", 500 );
  
  //check if totals need to be shown for each list
  toggleTotals();
});