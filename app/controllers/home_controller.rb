class HomeController < ApplicationController
  skip_filter :authenticate
  
  def index
    render :layout => 'home'
  end
end
