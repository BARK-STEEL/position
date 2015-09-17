module UsersHelper

  require 'json'
  require 'httparty'


  def get_titles(symbol)
    response = HTTParty.get("http://pipes.yahoo.com/pipes/pipe.run?_id=2FV68p9G3BGVbc7IdLq02Q&_render=json&feedcount=10&feedurl=http%3A%2F%2Ffinance.yahoo.com%2Frss%2Fheadline%3Fs%3D#{symbol}")
    articles = response['value']['items']
    @alltitles = []
    articles.each do |article|
      title = article['title']
      @alltitles.push(title)
    end
    @alltitles
  end

  def get_links(symbol)
    response = HTTParty.get("http://pipes.yahoo.com/pipes/pipe.run?_id=2FV68p9G3BGVbc7IdLq02Q&_render=json&feedcount=10&feedurl=http%3A%2F%2Ffinance.yahoo.com%2Frss%2Fheadline%3Fs%3D#{symbol}")
    articles = response['value']['items']
    @alllinks = []
    articles.each do |article|
      link = article['link']
      @alllinks.push(link)
    end
    @alllinks
  end

  def apply_trade(user, trade)
    if trade['trade_type'] == 'buy'
      remove_cash(user, trade)
      add_portfolio(user, trade)
    else
      add_cash(user, trade)
      remove_portfolio(user, trade)
    end
    update_net_worth(user)
  end

  def remove_cash(user, trade)
    commission = 7.95
    cash = user['cash'].to_f - ((@last_price.to_f*trade['number_of_shares'].to_i) + commission)

    user.update({
      cash: cash
      })

  return user
  end

  def add_cash(user, trade)
    commission = 7.95

    user.update({
      cash: user['cash'].to_f + ((@last_price.to_f*trade['number_of_shares'].to_i) - commission)
      })
  return user
  end

  def add_portfolio(user, trade)
    user.update({
      portfolio_value: user['portfolio_value'].to_f + (@last_price.to_f*trade['number_of_shares'].to_f)
      })
  return user
  end

  def remove_portfolio(user, trade)
    user.update({
      portfolio_value: user['portfolio_value'].to_f - (@last_price.to_f*trade['number_of_shares'].to_f)
      })
  return user
  end

  def update_net_worth(user)
    net_worth = (user['portfolio_value'].to_f + user['cash'].to_f)
    user.update({
      net_worth: net_worth
      })
    return user
  end

  def update_portfolio(user)
    user.portfolio_value = 0

    user.trades.each do |trade|
      stock_search(trade.company_symbol)

    if trade['trade_type'] == 'buy'
      add_portfolio(user, trade)
    else
      remove_portfolio(user, trade)
    end

    end
    update_net_worth(user)
    return user
  end

  def set_days_gain(user)
    days_gain = user['net_worth'] - user['open_net_worth']

  user.update({
    days_gain: days_gain
    })

  end

end
