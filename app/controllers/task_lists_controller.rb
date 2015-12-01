class TaskListsController < ApplicationController
  before_filter :check_rights, :only => [:update, :destroy]
  include ApplicationHelper

  def create
    @task_list = TaskList.create!(task_list_params.merge(:owner_id => session[:user_id]))
    render :partial => @task_list
  end

  def update
    @task_list = TaskList.find(params[:id])
    @task_list.update_attributes(task_list_params)
    render :partial=>"task_lists/header", :object=>@task_list
  end

  def destroy
    TaskList.destroy(params[:id])
    head :ok
  end

  def setSequence
    @task_list = TaskList.find(params[:id])
    # unlink all tasks from task_list
    @task_list.tasks.each do |task|
      task.update(task_list_id: 0)
    end

    # get list of tasks to be modified
    @tasks = params[:tasks].split(",")
    @tasks.to_enum.with_index.each do |task_id, index|
      @task = Task.find(task_id)
      @task.invoice_id = 0
      @task.task_list_id = params[:id]
      @task.sort_order = @tasks.length - index
      @task.save
    end

    head :ok
  end

  def refresh
    @jsonTasks = []
    @task_lists = TaskList.order("updated_at DESC").where({:owner_id => current_user.id})
    total_duration = 0
    total_earnings = Money.new(0, "USD")
    @task_lists.each do |task_list_id|
      @task_list = TaskList.find(task_list_id)
      @tasks = @task_list.tasks
      @tasks.each do |task|
        @jsonTasks << task
        total_duration += task.duration
        total_earnings += task.earnings
      end
    end
    json_tasks = @jsonTasks.as_json(only: :id, methods: [:task_earnings, :running_time])
    json_task_lists = @task_lists.as_json(only: :id, methods: [:task_list_duration,:task_list_earnings])
    render :json => {:tasklists => json_task_lists,:tasks => json_tasks,:total_duration => html_duration(total_duration),:total_earnings => total_earnings.to_money.format(:no_cents_if_whole => true, :symbol => "$")}
  end

  private
    def task_list_params
      params.require(:task_list).permit(:title, :default_rate)
    end

    def check_rights
      check_obj_rights(TaskList, "owner")
    end

end
