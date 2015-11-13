require 'curb'

class UsersController < ApplicationController
  skip_filter :authenticate, :only => [:new, :create]
  protect_from_forgery :except => :create

  def new
    @user = flash[:user] || User.new
    render :layout => 'yosemite'
  end

  def update
    id = params[:id] == 'me' ? session[:user_id] : params[:id].to_i
    head :bad_request and return if id != session[:user_id]
    @user = User.find(id)
    @user.update_attributes(user_params)
    @user.save
    update_from_latlon(@user) if user_params.has_key?(:latitude) && user_params[:latitude]
    render json: @user
  end

  private
    def user_params
      params.require(:user).permit(:latitude, :longitude, :country, :state, :city, :address, :zip)
    end

    def update_from_latlon(user)
      request = Curl::Easy.new
      request.url = "http://maps.googleapis.com/maps/api/geocode/json?latlng=#{@user.latitude},#{@user.longitude}&sensor=true"
      request.perform

      data = JSON.parse(request.body_str)['results'].first
      return if !data || !data['address_components']

      address = ''
      data['address_components'].each do |c|
        type =
        case c['types'][0]
        when 'street_number'
          address += " #{c['long_name']}"
        when 'route'
          address = c['long_name'] + address
        when 'locality'
          user.city = c['long_name']
        when 'administrative_area_level_1'
          user.state = c['long_name']
        when 'country'
          user.country = c['long_name']
        end
      end
      user.address = address if address
    end

end
