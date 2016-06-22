class SessionsController < ApplicationController
  skip_filter :authenticate
  protect_from_forgery :except => :create

  def new
    render :layout => 'yosemite'
  end

  def create
    auth = request.env['omniauth.auth']

    @identity = Identity.find_with_omniauth(auth)
    if @identity.nil?
      # create new identity if unknown
      @identity = Identity.create_with_omniauth(auth)
    else
      @identity.update_with_omniauth(auth)
    end

    if signed_in?
      if @identity.user != current_user
        # identity is not associated with current_user: link them
        @identity.user = current_user
        @identity.save()
      end
      case @identity.provider
      when 'google'
        redirect_to :controller => 'tasks'
      when 'google_contacts'
        render json: [{success: true}]
      end
    else
      if !@identity.user.present?
        @identity.user = User.find_by_email(auth.info.email)
        if !@identity.user.present?
          @identity.user = User.create_with_omniauth(auth)
        end
      end
      @identity.save()
      self.current_user = @identity.user
      case @identity.provider
      when 'google'
        redirect_to :controller => 'tasks'
      when 'google_contacts'
        render json: [{success: true}]
      end
    end
  end

  def destroy
    self.current_user = nil
    redirect_to root_url
  end
end
