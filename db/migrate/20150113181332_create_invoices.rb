class CreateInvoices < ActiveRecord::Migration
  def change
    create_table :invoices do |t|
      t.integer :id
      t.string :description
      t.integer :client_id
      t.datetime :created
      t.datetime :due

      t.timestamps
    end
  end
end
