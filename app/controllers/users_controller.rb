class UsersController < ApplicationController


  include SessionsHelper

# users GET  /users(.:format)         users#index
  def index
    @user = current_user
    @users = User.all
    render layout: "profile_layout"
  end
# signup GET  /signup(.:format)        users#new
  def register

    @user = User.new

  end
#      POST /users(.:format)         users#create
  def create

    @user = User.new(user_params)
    @net_worth = get_net_worth(@user)
    @days_gain = get_days_gain(@user)

    @user.update( {
      net_worth: @net_worth,
      days_gain: @days_gain
      })

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
    @net_worth = get_net_worth(@user)
    @days_gain = get_days_gain(@user)

    @user.update({
      net_worth: @net_worth,
      days_gain: @days_gain
      })

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

  def stock_search( symbol )

    response = HTTParty.get("http://dev.markitondemand.com/Api/v2/Quote?symbol=#{symbol}")
    @company_name = response['StockQuote']['Name']
    @last_price = response['StockQuote']['LastPrice']
    @dollar_change = response['StockQuote']['Change']
    @change_percent = response['StockQuote']['ChangePercent']
    @open_price = response['StockQuote']['Open']
    @high_price = response['StockQuote']['High']
    @low_price = response['StockQuote']['Low']

  end




def get_net_worth(user)
  @net_worth = user.cash;

  user.trades.each do |trade|
    stock_search(trade.company_symbol)
    puts @last_price
    value_added = @last_price.to_f() * trade.number_of_shares
    @net_worth += value_added
  end

  return @net_worth
end

def get_days_gain(user)
  @days_gain = 0;

  user.trades.each do |trade|
    stock_search(trade.company_symbol)
    @days_gain += @dollar_change.to_f() * trade.number_of_shares
  end

  return '%.2f' % @days_gain

end


end
