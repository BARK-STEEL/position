class User < ActiveRecord::Base
  has_secure_password
  has_many :trades

  before_create :generate_token


  def generate_token
    self.token = SecureRandom.urlsafe_base64(nil, false)
  end

  def self.stock_search( symbol )

      response = HTTParty.get("http://dev.markitondemand.com/Api/v2/Quote?symbol=#{symbol}")

      if (response != nil)
      @company_name = response['StockQuote']['Name']
      @last_price = response['StockQuote']['LastPrice']
      @dollar_change = response['StockQuote']['Change']
      @change_percent = response['StockQuote']['ChangePercent']
      @open_price = response['StockQuote']['Open']
      @high_price = response['StockQuote']['High']
      @low_price = response['StockQuote']['Low']
      else
        puts '******************'
        puts 'No RESPONSE RECEIVED'
      end
      sleep (0.5)

  end


def self.update_user_performance(user)
  @net_worth = user.cash
  @days_gain = 0

  user.trades.each do |trade|
    self.stock_search(trade.company_symbol)
    trade.update( {
      last_price: @last_price,
      dollar_change: @dollar_change,
      change_percent: @change_percent,
      open_price: @open_price,
      high_price: @high_price,
      low_price: @low_price
      } )

    if trade['trade_type'] == 'buy'
      self.remove_cash(user)
      self.add_portfolio(user)
    else
      self.add_cash(user)
      self.remove_portfolio(user)
    end

    value_added = @last_price.to_f() * trade.number_of_shares
    @net_worth += value_added

    @days_gain += ((@last_price.to_f() - trade.share_purchase_price) * trade.number_of_shares)

  end
  @net_worth = (user.cash + user.portfolio_value)
  @days_gain = '%.2f' % @days_gain

  user.update({
    net_worth: @net_worth,
    days_gain: @days_gain
    })

end

def self.update_open_performance
  User.all.each do |user|
  user.update({
    open_net_worth: user.net_worth
    })
  end
end

def self.update_all_users
  User.all.each do |user|
    # self.update_user_performance(user)
    self.update_portfolio(user)
  end
end

def self.apply_trade(user, trade)
  if trade['trade_type'] == 'buy'
    remove_cash(user, trade)
    add_portfolio(user, trade)
  else
    add_cash(user, trade)
    remove_portfolio(user, trade)
  end
  update_net_worth(user)
end

def self.remove_cash(user, trade)
  commission = 7.95
  cash = user['cash'].to_f - ((@last_price.to_f*trade['number_of_shares'].to_i) + commission)

  user.update({
    cash: cash
    })

return user
end

def self.add_cash(user, trade)
  commission = 7.95

  user.update({
    cash: user['cash'].to_f + ((@last_price.to_f*trade['number_of_shares'].to_i) - commission)
    })
return user
end

def self.add_portfolio(user, trade)
  user.update({
    portfolio_value: user['portfolio_value'].to_f + (@last_price.to_f*trade['number_of_shares'].to_f)
    })
return user
end

def self.remove_portfolio(user, trade)
  user.update({
    portfolio_value: user['portfolio_value'].to_f - (@last_price.to_f*trade['number_of_shares'].to_f)
    })
return user
end

def self.update_net_worth(user)
  net_worth = (user['portfolio_value'].to_f + user['cash'].to_f)
  user.update({
    net_worth: net_worth
    })
  return user
end


def self.update_portfolio(user)
  user.portfolio_value = 0

  user.trades.each do |trade|
    self.stock_search(trade.company_symbol)

  if trade['trade_type'] == 'buy'
    self.add_portfolio(user, trade)
  else
    self.remove_portfolio(user, trade)
  end

  end
  self.update_net_worth(user)
  return user
end



end
