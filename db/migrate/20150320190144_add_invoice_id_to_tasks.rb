class AddInvoiceIdToTasks < ActiveRecord::Migration
  def change
    add_column :tasks, :invoice_id, :integer
  end
end
