class TasksController < ApplicationController
  before_filter :check_rights, :only => [:update, :destroy]
  def index
    @task_lists = TaskList.order(updated_at: :desc).where({owner_id: current_user.id})
    @invoices = Invoice.includes(:client).order("invoices.updated_at DESC").where(user_id: current_user.id)
    @user = current_user
  end

  def create
    task_list = TaskList.find(params[:task_list_id])
    @task = task_list.tasks.create(task_params)
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
    @task.update_attributes(task_params)
    render json: @task.as_json(only: [:id, :description], methods: [:task_earnings, :running_time])
  end

  def destroy
    task = Task.find(params[:id])
    task_list = TaskList.find(task.task_list_id)
    Task.destroy(params[:id])
    head :ok
  end

  private
    def task_params
      params.require(:task).permit(:description, :rate)
    end

    def check_rights
      check_obj_rights(Task, "task_list.owner")
    end
end
