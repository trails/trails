class SessionsController < ApplicationController
  skip_filter :authenticate
  protect_from_forgery :except => :create

  def new
    render :layout => 'yosemite'
  end
  
  def create
    info = params[:session]
    user = User.authenticate(info[:email], info[:password])
    if user
      session[:user_id] = user.id
      redirect_to :controller => "task_lists"
    else
      session[:user_id] = nil
      flash[:notice] = "Incorrect user name or password."
      redirect_to :controller => "sessions", :action => "new"
    end
  end
  
  def destroy
    reset_session
    redirect_to '/'
  end
end
