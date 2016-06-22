class AddRefreshTokenToIdentities < ActiveRecord::Migration
  def change
    add_column :identities, :refresh_token, :string
  end
end
