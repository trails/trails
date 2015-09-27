class Client < ActiveRecord::Base
  has_many :invoices,
    :foreign_key => "client_id"

  validates_presence_of :user_id,
                        :email,
                        :name,
                        :address,
                        :city,
                        :country,
                        :email

  validates_uniqueness_of   :email, :case_sensitive => false
  validates_length_of       :email, :within => 3..100
  validates_format_of       :email, :with => /\A([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})\Z/i, :on => :create
end
