class UsersController < ApplicationController


  include SessionsHelper

# users GET  /users(.:format)         users#index
  def index

    @users = User.all

  end
# signup GET  /signup(.:format)        users#new
  def register

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

  def profile
    return nil if !authenticate!
    @user = current_user
    @trade = @user.trades.new
    render layout: "profile_layout"

  end

  def stock_lookup
    @user = current_user
    render layout: "profile_layout"
  end

  def trade
    @user = current_user
  end

  def preview_order
    @user = current_user
    @trade = @user.trades.last
    render layout: "profile_layout"
  end

  def positions
    @user = current_user
    render layout: "profile_layout"
  end

  def market_research
    @user = current_user
    render layout: "profile_layout"
  end

  def login
  end

  def user_params

    params.require( :user ).permit( :username, :email, :password, :phone, :profile_image, :cash )

  end

end
