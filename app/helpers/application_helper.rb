# Methods added to this helper will be available to all templates in the application.
module ApplicationHelper
  def user
    # @user ||= User.find(session[:user_id])
    @user ||= User.find(:first)
  end

  def html_duration(seconds)
    if(seconds > 60)
      minutes = seconds / 60
      hours   = minutes / 60
      minutes = minutes % 60
      ("%02d<span class='colon'>:</span>%02d"%[hours,minutes]).sub(/([0:]+)/,%q{<span class="fade">\1</span>})
    else
      %Q|#{(seconds).floor}<span class="fade">s</span>|
    end
  end

  def formatted_duration(seconds)
    minutes = seconds / 60
    hours   = minutes / 60
    minutes = minutes % 60
    "%02d:%02d"%[hours,minutes]
  end

  def errors_for(object, message=nil)
    html = ""
    unless object.errors.blank?
      html << "<div class='formErrors #{object.class.name.humanize.downcase}Errors'>\n"
      if message.blank?
        if object.new_record?
          html << "\t\t<h5>There was a problem creating the #{object.class.name.humanize.downcase}</h5>\n"
        else
          html << "\t\t<h5>There was a problem updating the #{object.class.name.humanize.downcase}</h5>\n"
        end
      else
        html << "<h5>#{message}</h5>"
      end
      html << "\t\t<ul>\n"
      object.errors.full_messages.each do |error|
        html << "\t\t\t<li>#{error}</li>\n"
      end
      html << "\t\t</ul>\n"
      html << "\t</div>\n"
    end
    html
  end

  def page_class
    return params[:controller] + ' ' + params[:action]
  end
end
