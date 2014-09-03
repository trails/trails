controller("task_list",
  autoBuildChild("task_form","task_list_form"),
  {
    setTaskSequence: function(seq){
    var options = {
      method: "put",
    onSuccess:this["afterSetTaskSequence"].bind(this),
      parameters: { tasks: seq.toString() },
      requestHeaders: {
        "X-CSRF-Token": $$('meta[name=csrf-token]')[0].readAttribute('content')
      }
    };
    new Ajax.Request(this.url() + "setsequence", options);
  },
  listContainer: function(){
    return $("task_list_container_" + this.id);
  },
  edit: function() {
    this.task_list_form().show();
    this.element().hide();
    },
    remove: function(){
      this.ajaxAction("remove",{method:"delete"});
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
      } while(!element.match(".blank_list_footer"))
      element.fadeDelete();
    },
  afterSetTaskSequence: function(transport) {
    //update list earnings and duration after task_reordering
    eval(transport.responseText);
    },
  earnings: function(){
    return $("task_list_earnings_" + this.id);
  },
  duration: function(){
    return $("task_list_duration_" + this.id);
  },
  numTasks: function(){
    return this.listContainer().childNodes.length;
  },
  hideTotal: function(){
    this.total().hide();
  },
  showTotal: function(){
    this.total().show();
  },
  total: function(){
    return $("total_" + this.id);
  },
  checkIfTotalNeeded: function(){
    var n = this.numTasks();
    if(n < 2){
      this.hideTotal();
    }else{
      this.showTotal();
    }
  }
  }
);