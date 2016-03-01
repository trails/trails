class Invoice < ActiveRecord::Base
  has_many :tasks,
    :foreign_key => "invoice_id"

  belongs_to :client
  belongs_to :user

  before_create :increment_invoice_number

  def total
    sum = tasks.to_a.sum(&:earnings)
    Money.new(sum == 0 ? 0.0 : sum, "USD")
  end

  def duration
    tasks.to_a.sum(&:running_time)
  end

  def earnings
    return 0.0 if !total
    total
  end

  def earnings?
    !!earnings
  end

  def formatted_total
    total.format(:symbol => "$")
  end

  private
    def increment_invoice_number
      write_attribute(:number, find_next_available_number)
    end

    def find_next_available_number
      (user.invoices.maximum(:number) || 0).succ
    end
end
