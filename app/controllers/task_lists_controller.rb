class TaskListsController < ApplicationController
  before_filter :check_rights, :only => [:update, :destroy]
  include ApplicationHelper
  
  def create
    @task_list = TaskList.create!(params[:task_list].merge(:owner_id => session[:user_id]))
    render :partial => @task_list
  end
  
  def update
    @task_list = TaskList.update(params[:id], params[:task_list])
    render :partial=>"task_lists/header", :object=>@task_list
  end
  
  def destroy
    TaskList.destroy(params[:id])
    head :ok
  end
  
  def setTasksSequence
    # unlink all tasks from task_list
    @tasks_to_unlink = Task.all(:conditions=> "task_list_id = #{params[:id]}")
    @tasks_to_unlink.each do |task_id|
      @task = Task.find(task_id)
      @task.update_attributes("task_list_id" => 0)
    end
    
    # get list of tasks to be modified
    @tasks = params[:tasks].split(",")
    @tasks.each do |task_id|
      @task = Task.find(task_id)
      @task.update_attributes("task_list_id" => params[:id])
    end

    @task_list = TaskList.find(params[:id])
    @task_list.update_attributes("task_order" => @tasks)
    head :ok
  end
  
  def refresh
    @jsonTasks = []
    @task_lists = TaskList.find(:all, :conditions=> {:owner_id=>session[:user_id]}, :order=>"updated_at DESC")
    total_duration = 0
    total_earnings = Money.new(0, "USD")
    @task_lists.each do |task_list_id|
      @task_list = TaskList.find(task_list_id)
      @tasks = @task_list.sorted_tasks
      @tasks.each do |task|
        @jsonTasks << task
        total_duration += task.duration
        total_earnings += task.earnings
      end
    end
    json_tasks = @jsonTasks.to_json(:only=>:id,:methods=>[:task_duration,:task_earnings,:task_duration_bar])
    json_task_lists = @task_lists.to_json(:only=>:id,:methods=>[:task_list_duration,:task_list_earnings])
    render :json => {:tasklists => json_task_lists,:tasks => json_tasks,:total_duration => formatted_duration(total_duration),:total_earnings => total_earnings.to_money.format(:no_cents_if_whole => true, :symbol => "$")}
    #render :json => @jsonTasks.to_json(:only=>:id,:methods=>[:task_duration,:task_earnings,:task_duration_bar])
  end
  
  private
    def check_rights
      check_obj_rights(TaskList, "owner")
    end

end
