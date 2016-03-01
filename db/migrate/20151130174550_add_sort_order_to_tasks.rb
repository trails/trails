class AddSortOrderToTasks < ActiveRecord::Migration
  def change
    add_column :tasks, :sort_order, :int
  end
end
