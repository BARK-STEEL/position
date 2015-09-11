class UsersController < ApplicationController

  include SessionsHelper

# users GET  /users(.:format)         users#index
  def index

    @users = User.all

  end
# signup GET  /signup(.:format)        users#new
  def new

    @user = User.new

  end
#      POST /users(.:format)         users#create
  def create

    @user = User.new(user_params)
    if @user.save

      respond_to do |format|

        format.html { redirect_to log_in_path}
        format.json { render json: @user }

      end

    else

      redirect_to '/register'

    end

  end
# users_profile GET  /users/profile(.:format) users#profile
  def profile

    authorize!
    @user = current_user

  end

  def login

  end

  def user_params

    params.require( :user ).permit( :username, :email, :password, :phone, :profile_image, :cash )

  end

end
