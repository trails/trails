class UsersController < ApplicationController
  skip_filter :authenticate, :only => [:new, :create]
  protect_from_forgery :except => :create

  def new
    @user = flash[:user] || User.new
    render :layout => 'yosemite'
  end

  def create
    @user = User.create(params[:user])
    if @user.valid?
      session[:user_id] = @user.id
      redirect_to :controller => "tasks"
    else
      flash[:user] = @user
      flash[:notice] = "Error creating user"
      redirect_to '/signup'
    end
  end

  def edit
    user_id = params[:id].to_i > 0 ? params[:id].to_i : session[:user_id]
    head(:bad_request) and return if user_id != session[:user_id]
    @user = User.find(user_id)
    render :layout => 'yosemite'
  end

  def update
    head :bad_request and return if params[:id].to_i != session[:user_id]
    @user = User.find(params[:id])
    @user.update_attributes(params[:user])
    redirect_to '/tasks'
  end
end