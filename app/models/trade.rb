class Trade < ActiveRecord::Base

  belongs_to :user


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


end
