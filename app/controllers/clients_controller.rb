class ClientsController < ApplicationController
  def show
    if (true if Float params[:id] rescue false)
      @client = Client.find(params[:id], :conditions=> {:user_id => current_user.id})
    else
      @client = Client.where({:user_id => current_user.id}).find_by_email(params[:id])
    end
    render json: (@client or {})
  end

  def index
    @clients = Client.find(:all, :conditions=> {:user_id=>current_user.id}, :order=>"id ASC")
    render json: @clients
  end

  def create
    @client = Client.create!(client_params.merge(:user_id => session[:user_id]))
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

  private
    def client_params
      params.require(:client).permit(:email, :name)
    end

end
