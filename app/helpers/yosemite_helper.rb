module YosemiteHelper
  def view_specific_css
    params[:controller] + '_' + params[:action] + '.css'
  end

  def view_specific_css_exist
    Rails.application.assets.find_asset view_specific_css
  end

  def view_specific_js
    params[:controller] + '_' + params[:action] + '.js'
  end

  def view_specific_js_exist
    Rails.application.assets.find_asset view_specific_js
  end
end