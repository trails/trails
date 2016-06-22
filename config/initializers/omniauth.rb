OmniAuth.config.logger = Rails.logger

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :google_oauth2, ENV['GOOGLE_OAUTH2_CLIENT_ID'], ENV['GOOGLE_OAUTH2_CLIENT_SECRET'], {
    :name => 'google',
    :scope => 'email, profile',
    :include_granted_scopes => 'true',
    :prompt => 'select_account'
  }

  provider :google_oauth2, ENV['GOOGLE_OAUTH2_CLIENT_ID'], ENV['GOOGLE_OAUTH2_CLIENT_SECRET'], {
    :name => 'google_contacts',
    :scope => 'contacts.readonly',
    :include_granted_scopes => 'true',
    :prompt => 'consent'
  }
end
