class User < ActiveRecord::Base
  has_many :task_lists,
    :foreign_key => "owner_id",
    :dependent => :destroy

  has_many :clients,
    :foreign_key => "user_id"

  has_many :identities

  belongs_to :last_command,
    :class_name => "Command"

  validates_presence_of     :email
  validates_uniqueness_of   :email, :case_sensitive => false
  validates_length_of       :email, :within => 3..100
  validates_format_of       :email, :with => /\A([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})\Z/i, :on => :create

  def self.create_with_omniauth(auth)
    create(email: auth.info.email, name: auth.info.name)
  end
end
