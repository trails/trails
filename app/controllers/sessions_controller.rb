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
      redirect_to :controller => 'tasks'
    else
      if !@identity.user.present?
        @identity.user = User.create_with_omniauth(auth)
      end
      @identity.save()
      self.current_user = @identity.user
      redirect_to :controller => 'tasks'
    end
  end

  def destroy
    self.current_user = nil
    redirect_to root_url
  end
end
