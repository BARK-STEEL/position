class WelcomeController < ApplicationController

  include UsersHelper
  include SessionsHelper

  def index
    # @user = current_user
  end

end
