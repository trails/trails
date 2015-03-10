class ClientsController < ApplicationController
  def index
    @clients = Client.find(:all, :conditions=> {:user_id=>current_user.id}, :order=>"id ASC")
    render json: @clients
  end

  def create
    @client = Client.create!(params[:client].merge(:user_id => session[:user_id]))
    render json: @client
  end

  def update
    @client = Client.update(params[:id], params[:client])
    render json: @client
  end

  def destroy
    Client.destroy(params[:id])
    head :ok
  end
end
