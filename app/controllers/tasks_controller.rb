class TasksController < ApplicationController
  before_filter :check_rights, :only => [:update, :destroy]
  def index
    @task_lists = TaskList.find(:all,
      :conditions => {
        :owner_id=>session[:user_id]
      },
      :order=>"updated_at DESC"
    )
    @invoices = Invoice.find(:all,
      :include => [:client],
      :conditions=> {
        "clients.user_id" => session[:user_id]
      },
      :order=>"invoices.updated_at DESC"
    )
    @user = User.find(session[:user_id])
  end
  
  def create
    task_list = TaskList.find(params[:task_list_id])
    @task = task_list.tasks.create(params[:task])
    task_list.save!
    diffTime = params[:diffTime].to_i
    if diffTime
      new_duration = @task.updateDiffTime(diffTime)
      @task.update_attributes(:duration_cache => new_duration.to_s)
    end
    render :partial=>@task
  end
  
  def update
    @task = Task.find(params[:id])
    diffTime = params[:diffTime].to_i
    if diffTime
      if @task.running?
        @task.add_action(:action=>"stop")
        @task.add_action(:action=>"start")
      end
       new_duration = @task.updateDiffTime(diffTime)
      @task.update_attributes(:duration_cache => new_duration.to_s)
    end
    @task.update_attributes(params[:task])
    render :partial=>@task
    #respond_to do |format|
    #  format.html {render :partial=>@task}
    #  format.js {
    #    render(:update) do |page|
    #      page["task_container_#{@task.id}"].replace render :partial=>@task
    #    end
    #  }
    #end
  end
  
  def destroy
    task = Task.find(params[:id])
    task_list = TaskList.find(task.task_list_id)
    Task.destroy(params[:id])
    task_list.task_order.delete(params[:id].to_s)
    task_list.save!
    head :ok
  end
  
  private
    def check_rights
      check_obj_rights(Task, "task_list.owner")
    end
end
