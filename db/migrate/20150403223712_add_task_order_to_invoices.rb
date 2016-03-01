class AddTaskOrderToInvoices < ActiveRecord::Migration
  def change
    add_column :invoices, :task_order, :string
  end
end
