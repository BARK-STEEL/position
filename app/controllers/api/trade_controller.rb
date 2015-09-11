class Api::TradeController < ApplicationController

  def index
  end

  def new
  @trade = Trade.new
  end

  def create
  @trade = Trade.new(trade_params)
  stock_search(@trade[:company_symbol])
  @trade.update({share_purchase_price: @last_price})
  binding.pry
    if @trade.save
      respond_to do |format|
        format.html { redirect_to "/trades/#{@trade.id}" }
        format.json { rend json: @trade}
      end
    else
      render :new
    end
  end

  def show
    render json: Trade.find(params[:id])

    # @trade = Trade.find(params[:id])
    # stock_search(@trade.company_symbol)
    # binding.pry
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
