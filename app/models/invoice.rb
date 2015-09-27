class Invoice < ActiveRecord::Base
  has_many :tasks,
    :foreign_key => "invoice_id"

  belongs_to :client

  validates_presence_of :description,
                        :client_id
  before_save :save_task_order

  def total
    sum = tasks.to_a.sum(&:earnings)
    sum == 0 ? 0.0 : sum.to_money
  end

  def earnings

    return 0.0 if !sum
    return sum if sum
  end

  def sorted_tasks
    ret = []
    task_order.each do |task_id|
      task = tasks.find(task_id)
      next if task.new_record?
      ret << task
    end
    ret
  end

  def task_order
    @task_order ||= ((ord=read_attribute(:task_order)) && ord.split(',')) || []
  end

  def task_order=(order)
    @task_order = order
  end

  private

  def save_task_order
    write_attribute(:task_order, self.task_order.join(','))
  end
end
