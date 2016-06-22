class ContactsController < ApplicationController
  require 'gdata'

  def index
    google_id = current_user.identities.select { |identity| identity.provider == 'google_contacts' }.first
    ret = [nil]
    if google_id
      token = google_id.get_token
      contacts_url = "https://www.google.com/m8/feeds/contacts/default/full?max-results=100&access_token=" + token
      client = GData::Client::Contacts.new
      feed = client.get(contacts_url).to_xml
      ret = []
      feed.elements.each('entry') do |entry|
        tmp_ret = {
          id: entry.elements['id'].text,
          name: entry.elements['title'].text,
          email: entry.elements['gd:email'].attribute('address').value
        }
        tmp_ret[:postalAddress] = entry.elements['postalAddress'].text if entry.elements['postalAddress']
        links = {}
        entry.elements.each('link') do |link|
          links[link.attribute('rel').value] = link.attribute('href').value
        end
        tmp_ret[:links] = links
        ret << tmp_ret
      end
    end
    render json: ret
  end
end
