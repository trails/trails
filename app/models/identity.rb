class Identity < ActiveRecord::Base

  belongs_to :user

  def self.find_with_omniauth(auth)
    where(uid: auth.uid, provider: auth.provider).first
  end

  def self.create_with_omniauth(auth)
    create(uid: auth.uid,
      provider: auth.provider,
      token: auth.credentials.token,
      expires: Time.at(auth.credentials.expires_at),
      image: auth.info.image)
  end

  def update_with_omniauth(auth)
    update(image: auth.info.image)
  end
end
