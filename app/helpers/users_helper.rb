module UsersHelper

  require 'json'
  require 'httparty'


  def get_titles
    response = HTTParty.get('http://pipes.yahoo.com/pipes/pipe.run?_id=2FV68p9G3BGVbc7IdLq02Q&_render=json&feedcount=10&feedurl=http%3A%2F%2Ffinance.yahoo.com%2Frss%2Fheadline%3Fs%3Dspx')
    articles = response['value']['items']
    @alltitles = []
    articles.each do |article|
      title = article['title']
      @alltitles.push(title)
    end
    @alltitles
  end

  def get_links
    response = HTTParty.get('http://pipes.yahoo.com/pipes/pipe.run?_id=2FV68p9G3BGVbc7IdLq02Q&_render=json&feedcount=10&feedurl=http%3A%2F%2Ffinance.yahoo.com%2Frss%2Fheadline%3Fs%3Dspx')
    articles = response['value']['items']
    @alllinks = []
    articles.each do |article|
      link = article['link']
      @alllinks.push(link)
    end
    @alllinks
  end

end
