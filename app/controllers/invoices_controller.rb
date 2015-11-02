class InvoicesController < ApplicationController
  def index
    @invoices = Invoice.find(:all, :conditions=> {"clients.user_id"=>current_user.id}, :order=>"id ASC", :joins=> :client)
    render json: @invoices
  end

  def create
    @invoice = Invoice.create!(invoice_params)

    # get list of tasks to be modified
    @tasks = params[:tasks].split(",")
    linkTasks(@tasks, @invoice)

    render json: @invoice
  end

  def update
    @invoice = Invoice.find(params[:id])
    @invoice.update(params[:invoice])
    render json: @invoice
  end

  def destroy
    Invoice.destroy(params[:id])
    head :ok
  end

  def setSequence
    @invoice = Invoice.find(params[:id])

    # unlink all tasks from invoice
    @tasks_to_unlink = Task.where(invoice_id: params[:id]).all
    @tasks_to_unlink.each do |task_id|
      @task = Task.find(task_id)
      @task.update_attributes("invoice_id" => 0)
    end

    # get list of tasks to be modified
    @tasks = params[:tasks].split(",")
    linkTasks(@tasks, @invoice)

    head :ok
  end

  protected
    def invoice_params
      params.require(:invoice).permit(:id, :client_id, :description)
    end


    def linkTasks (tasks, invoice)
      tasks.each do |task_id|
        @task = Task.find(task_id)
        @task.update_attributes("invoice_id" => invoice.id)
      end
      invoice.update_attributes("task_order" => tasks)
    end

end
