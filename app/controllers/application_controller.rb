class ApplicationController < ActionController::Base
  protect_from_forgery
  
  helper :all # include all helpers, all the time

  before_filter :authenticate
  
  protected
    def authenticate
      unless session[:user_id]
         redirect_to :controller => "sessions", :action => "new"
        return false
      end
    end
    
    def check_obj_rights(klass, owner_path)
       obj = klass.find(params[:id])
      if obj == nil or eval("obj.#{owner_path}") != current_user
         render :file => "#{RAILS_ROOT}/public/422.html", :status => 422
        return false
      end
    end
    
    def current_user
      User.find(session[:user_id]) if session[:user_id]
    end
end
