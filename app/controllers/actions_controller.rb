class ActionsController < ApplicationController
  def create
    @task = Task.find(params[:task_id])
    @task.add_action(action_params)
    render :partial=>@task
  end

  private
    def action_params
      params.require(:log_entry).permit(:action)
    end
end
