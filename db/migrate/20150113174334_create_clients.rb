class CreateClients < ActiveRecord::Migration
  def change
    create_table :clients do |t|
      t.integer :id
      t.string :name
      t.string :address
      t.string :city
      t.string :state
      t.string :zip
      t.string :country
      t.string :email

      t.timestamps
    end
  end
end
