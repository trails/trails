class Identity < ActiveRecord::Base

  belongs_to :user

  def self.find_with_omniauth(auth)
    where(uid: auth.uid, provider: auth.provider).first
  end

  def self.create_with_omniauth(auth)
    create(uid: auth.uid, provider: auth.provider, token: auth.credentials.token, expires: Time.at(auth.credentials.expires_at))
  end
end
