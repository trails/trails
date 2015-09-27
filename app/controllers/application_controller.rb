class ApplicationController < ActionController::Base
  protect_from_forgery

  helper :all # include all helpers, all the time

  before_filter :authenticate

  protected
    def authenticate
      unless session[:user_id]
         redirect_to root_url
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
      @current_user ||= User.find(session[:user_id]) if session[:user_id]
    end

    def signed_in?
      !!current_user
    end

    def current_user=(user)
      @current_user = user
      session[:user_id] = user.nil? ? nil : user.id
    end
end
