class ContactsController < ApplicationController
  require 'gdata'
  require 'open-uri'

  def next
  end

  def index
    max_results = 100
    page = params[:page] ? params[:page] : 1
    google_id = current_user.identities.select { |identity| identity.provider == 'google_contacts' }.first
    ret = [nil]
    if google_id
      token = google_id.get_token
      start_index = (page.to_i - 1) * max_results + 1
      url_params = "?start-index=" + start_index.to_s + "&max-results=" + max_results.to_s + "&access_token=" + token
      contacts_url = "https://www.google.com/m8/feeds/contacts/default/full" + url_params
      client = GData::Client::Contacts.new
      feed = client.get(contacts_url).to_xml
      ret = []
      feed.elements.each('entry') do |entry|
        avatar = false
        entry.elements.each('link') do |link|
          avatar = true if link.attribute('rel').value == 'http://schemas.google.com/contacts/2008/rel#photo' && link.attribute('gd:etag') != nil
        end
        tmp_ret = {
          id: entry.elements['id'].text.sub('http://www.google.com/m8/feeds/contacts/kordero%40gmail.com/base/', ''),
          name: entry.elements['title'].text,
          email: entry.elements['gd:email'] ? entry.elements['gd:email'].attribute('address').value : '',
          phone: entry.elements['gd:phoneNumber'] ? entry.elements['gd:phoneNumber'].text : '',
          avatar: avatar
        }
        ret << tmp_ret
      end
    end
    render json: ret
  end

  def show
    id = params[:id]
    google_id = current_user.identities.select { |identity| identity.provider == 'google_contacts' }.first
    if google_id
      token = google_id.get_token
      uri = URI.parse("https://www.google.com/m8/feeds/photos/media/default/" + id + "?access_token=" + token)
      begin
        content_type = 'application/octet-stream'
        uri.open {|f| content_type =  f.content_type}
        send_data uri.read, type: content_type , disposition: 'inline'
      rescue OpenURI::HTTPError => ex
        raise ActionController::RoutingError.new('Not Found')
      end
    end
  end
end
