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
      remove_cash(current_user)
      add_portfolio(current_user)
    else
      add_cash(current_user)
      remove_portfolio(current_user)
    end
    update_net_worth(user)
  end

  def remove_cash(user)
    commission = 7.95
    cash = user['cash'].to_f - ((@last_price.to_f*@trade['number_of_shares'].to_i) + commission)

    user.update({
      cash: cash
      })

  return user
  end

  def add_cash(user)
    commission = 7.95

    user.update({
      cash: user['cash'].to_f + ((@last_price.to_f*@trade['number_of_shares'].to_i) - commission)
      })
  return user
  end

  def add_portfolio(user)
    user.update({
      portfolio_value: user['portfolio_value'].to_f + (@last_price.to_f*@trade['number_of_shares'].to_f)
      })
  return user
  end

  def remove_portfolio(user)
    user.update({
      portfolio_value: user['portfolio_value'].to_f - (@last_price.to_f*@trade['number_of_shares'].to_f)
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

end
