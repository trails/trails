class Client < ActiveRecord::Base
  attr_accessible   :user_id,
                    :email,
                    :name,
                    :address,
                    :city,
                    :state,
                    :country,
                    :zip,
                    :email

  has_many :invoices,
    :foreign_key => "client_id"

  validates_presence_of :user_id,
                        :email,
                        :name,
                        :address,
                        :city,
                        :country,
                        :email

  validates_uniqueness_of   :email,
    :case_sensitive => false
  validates_length_of       :email,
    :within => 3..100
  validates_format_of       :email,
    :with => /^\S+\@(\[?)[a-zA-Z0-9\-\.]+\.([a-zA-Z]{2,4}|[0-9]{1,4})(\]?)$/ix
end
