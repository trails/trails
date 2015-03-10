class PagesController < ApplicationController
  skip_filter :authenticate
  layout 'yosemite'
end
