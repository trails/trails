class ClientsController < ApplicationController
  def show
    if (true if Float params[:id] rescue false)
      @client = Client.find(params[:id], :conditions=> {:user_id => current_user.id})
    else
      @client = Client.find_by_email(params[:id], :conditions=> {:user_id => current_user.id})
    end
    render json: @client
  end

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
