class Api::TradeController < ApplicationController

  def index

    user = User.find_by({token: env['HTTP_TOKEN']})
    render json: user.trades

  end

  def new

    @trade = Trade.new

  end

  def create

    user = User.find_by({token: env['HTTP_TOKEN']})
    @trade = user.trades.create(trade_params)
    stock_search(@trade[:company_symbol])
    @trade.update({share_purchase_price: @last_price})
    render json: @trade

  end

  def show

    user = User.find_by({token: env['HTTP_TOKEN']})
    @trade = user.trades.find(params[:id])
    render json: @trade

  end

  private

  def stock_search(symbol)

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

    params.require(:trade).permit(:company_symbol, :number_of_shares, :trade_type)

  end

end
