class UsersController < ApplicationController

  include UsersHelper
  include SessionsHelper

# users GET  /users(.:format)         users#index
  def index
    @user = current_user

    @users = User.order(net_worth: :desc)

    render layout: "profile_layout"
  end
# signup GET  /signup(.:format)        users#new
  def register

    @user = User.new

  end
#      POST /users(.:format)         users#create
  def create

    @user = User.new(user_params)

    if @user.save

      update_user_performance(@user)


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
    update_user_performance(@user)


    @trade = @user.trades.new
    render layout: "profile_layout"

  end

  def stock_lookup
    @user = current_user
    @search_term = params[:search]
    @all_titles = get_titles(@search_term)
    @all_links = get_links(@search_term)

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
    @alltitles = get_titles('spx')
    @alllinks = get_links('spx')
    render layout: "profile_layout"
  end

  def login
  end

  def search_bar
    @user = current_user

  end

  def user_params

    params.require( :user ).permit( :username, :email, :password, :phone, :profile_image, :cash, :portfolio_value )

  end

  def stock_search( symbol )
    @response = true;
    response = HTTParty.get("http://dev.markitondemand.com/Api/v2/Quote?symbol=#{symbol}")

      if response['Error']
        @response = false;
        return @response;
      else
      @company_name = response['StockQuote']['Name']
      @last_price = response['StockQuote']['LastPrice']
      @dollar_change = response['StockQuote']['Change']
      @change_percent = response['StockQuote']['ChangePercent']
      @open_price = response['StockQuote']['Open']
      @high_price = response['StockQuote']['High']
      @low_price = response['StockQuote']['Low']
      end
    sleep (0.1)

  end


  def update_user_performance(user)
    @net_worth = user.cash
    @days_gain = 0

    user.trades.each do |trade|

        stock_search(trade.company_symbol)

        if @response == false
          puts '***** UPDATE ERROR: RESPONSE FALSE ******'
        else
          value_added = @last_price.to_f() * trade.number_of_shares
          @net_worth += value_added
          @days_gain += ((@last_price.to_f() - trade.share_purchase_price) * trade.number_of_shares)
        end
    end
    @net_worth = '%.2f' % @net_worth
    @days_gain = '%.2f' % @days_gain
      user.update({

        net_worth: user.cash + user.portfolio_value,
        days_gain: @days_gain
        })


  end

# https://query.yahooapis.com/v1/public/yql?q=select%20symbol%2C%20ChangeRealtime%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22YHOO%22%2C%22AAPL%22%2C%22GOOG%22%2C%22MSFT%22)%20%7C%20sort(field%3D%22ChangeRealtime%22%2C%20descending%3D%22true%22)%0A%09%09&format=json&diagnostics=true&env=http%3A%2F%2Fdatatables.org%2Falltables.env&callback=

end
