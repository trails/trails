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
end
