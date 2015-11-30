class TaskList < ActiveRecord::Base
  has_many :tasks,
    :dependent  => :destroy,
    :before_add  => :update_ordering_for_new_task

  belongs_to :owner,
    :class_name => "User"

  composed_of :actual_default_rate,
    :class_name => "Money",
    :mapping    => [%w(default_rate_cents cents), %w(default_currency currency_as_string)],
    :allow_nil  => true

  validates_presence_of :title, :actual_default_rate

  include ApplicationHelper

  def default_rate
    actual_default_rate.to_s or ((last_list = TaskList.find(:first, :order=>"updated_at DESC")) and last_list.default_rate) or 0.to_money
  end

  def default_rate=(rate)
    self.actual_default_rate = Money.new(rate.to_i * 100, "USD")
  end

  def earnings
    Money.new(tasks.to_a.sum(&:earnings), "USD")
  end

  def duration
    tasks.to_a.sum(&:running_time)
  end

  def task_list_earnings
    earnings.format(:no_cents_if_whole => true, :symbol => "$")
  end

  def task_list_duration
    html_duration(duration)
  end

  private

  def update_ordering_for_new_task(new_task)
    new_task.sort_order = (self.tasks.first.sort_order || 0).succ if new_task.id
  end

end
