class Api::TradeController < ApplicationController

  respond_to :html, :json

  include Api::TradesHelper
  include SessionsHelper
  include UsersHelper


  before_action :current_api_user!

  def index

    render json: current_user.trades

  end

  def create

    @trade = current_user.trades.create( trade_params )
    stock_search(@trade[:company_symbol])
    @trade.update( {
      share_purchase_price: @last_price,
      last_price: @last_price,
      dollar_change: @dollar_change,
      change_percent: @change_percent,
      open_price: @open_price,
      high_price: @high_price,
      low_price: @low_price
      } )

      apply_trade(current_user, @trade)

    respond_to do |format|

      format.json { render json: @trade }
      format.html { redirect_to '/users/preview_order' }

    end
  end

  def show

    render json:  current_user.trades.find( params[:id] )

  end

  def edit

    @trade = current_user.trades.last

  end

  def update

    trade = current_user.trades.find( params[:id] )
    trade.update( params[ trade_params ] )
    respond_to do |format|

      format.json { render json: trade }
      format.html { redirect_to profile_path }

    end
  end

  def destroy

    current_user.trades.destroy( params[:id] )
    respond_to do |format|

      format.json { render json: current_user.trades }
      format.html { redirect_to '/users/profile' }

    end

  end

  private

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



  def trade_params

    params.require(:trade).permit(:company_symbol, :number_of_shares, :trade_type, :share_purchase_price)

  end




end
