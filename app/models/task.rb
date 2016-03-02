class Task < ActiveRecord::Base
  composed_of :specific_rate,
    :class_name => "Money",
    :mapping    => [%w(rate_cents cents), %w(currency currency_as_string)],
    :allow_nil  => true

  has_many :log_entries,
    :dependent  => :destroy

  has_one :last_start, -> { where action: 'start' },
    :class_name => "LogEntry",
    :order      => "created_at DESC"

  belongs_to :task_list
  belongs_to :invoice

  default_scope {order({sort_order: :desc})}

  include ApplicationHelper

  validates_presence_of :description

  STATUS_MAP = {
    "start"     => :active,
    "stop"      => :stopped,
    "complete"  => :complete,
    "reopen"    => :stopped
  }

  def add_action(action)
    action_name = action[:action]
    #do nothing if the new action won't change our status
    return if STATUS_MAP[action_name] == status
    case status
    when :active
    when :stopped
    when :complete
    end
    log_entries.create(action)
    reload
  end

  def status
    le = log_entries.last
    return :stopped unless le
    STATUS_MAP[le.action]
  end

  def completed?
    status == :complete
  end

  def active?
    status == :stopped or status == :active
  end

  def running?
    status == :active
  end

  def specific_rate?
    rate_cents?
  end

  #if rate is negative then use default rate
  #else use specific_rate (value of 0 is now valid)
  def rate
    if(specific_rate?)
      if(rate_cents < 0)
        task_list.default_rate.to_money
      else
        specific_rate.to_money
      end
    else
      Money.new(0, "USD")
    end
  end

  def rate=(value)
    self.specific_rate = Money.new(value.to_f ? (value.to_f * 100).to_i : 0, "USD")
  end

  def duration
    duration_cache || 0
  end

  def earnings
    rate * (running_time.to_f/(60*60))
  end

  def earnings?
    !!earnings
  end

  def running_time
    if(running?)
      (Time.now - last_start.created_at + duration).to_i
    else
      duration.to_i
    end
  end

  def updateDiffTime(difftime)
    new_time = duration + difftime*60
    if(new_time < 0)
      new_time = 0
    end
    return new_time
  end

  def formatted_duration(html = false)
    if html
      html_duration(running_time)
    else
      minutes = ((running_time / 60).to_i % 60).to_i
      hours   = ((running_time / 60).to_i / 60).to_i
      "%02d:%02d"%[hours,minutes]
    end
  end

  def task_earnings
    earnings.cents / 100.00 if earnings?
  end
end
