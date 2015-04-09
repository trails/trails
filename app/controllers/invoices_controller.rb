class InvoicesController < ApplicationController
  def index
    @invoices = Invoice.find(:all, :conditions=> {"clients.user_id"=>current_user.id}, :order=>"id ASC", :joins=> :client)
    render json: @invoices
  end

  def create
    @invoices = Invoice.create!(params[:invoice])
    render json: @invoices
  end

  def update
    @invoices = Invoice.update(params[:id], params[:invoice])
    render json: @invoices
  end

  def destroy
    Invoice.destroy(params[:id])
    head :ok
  end

  def setSequence
    # unlink all tasks from invoice
    @tasks_to_unlink = Task.all(:conditions=> "invoice_id = #{params[:id]}")
    @tasks_to_unlink.each do |task_id|
      @task = Task.find(task_id)
      @task.update_attributes("invoice_id" => 0)
    end

    # get list of tasks to be modified
    @tasks = params[:tasks].split(",")
    @tasks.each do |task_id|
      @task = Task.find(task_id)
      @task.update_attributes("invoice_id" => params[:id])
    end

    @invoice = Invoice.find(params[:id])
    @invoice.update_attributes("task_order" => @tasks)
    head :ok
  end
end
