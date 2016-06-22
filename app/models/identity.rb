class Identity < ActiveRecord::Base

  belongs_to :user

  def self.find_with_omniauth(auth)
    where(uid: auth.uid, provider: auth.provider).first
  end

  def self.create_with_omniauth(auth)
    create(
      uid: auth.uid,
      provider: auth.provider,
      token: auth.credentials.token,
      expires: Time.at(auth.credentials.expires_at),
      image: auth.info.image,
      refresh_token: auth.credentials.refresh_token)
  end

  def update_with_omniauth(auth)
    update(
      image: auth.info.image,
      token: auth.credentials.token,
      expires: Time.at(auth.credentials.expires_at),
      image: auth.info.image,
      refresh_token: auth.credentials.refresh_token)
  end

  def get_token
    return token if expires.future?
    uri = URI.parse("https://accounts.google.com/o/oauth2/token")
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    request = Net::HTTP::Post.new(uri.path)
    request.set_form_data({
      :client_id => ENV['GOOGLE_OAUTH2_CLIENT_ID'],
      :client_secret => ENV['GOOGLE_OAUTH2_CLIENT_SECRET'],
      :refresh_token => refresh_token,
      :grant_type => "refresh_token"
    })
    response = http.request(request)
    case response
    when Net::HTTPSuccess, Net::HTTPRedirection
      data = JSON.parse(response.body)
      token = data['access_token']
      update(
        token: token,
        expires: Time.now + data['expires_in']
      )
      token
    end
  end
end
