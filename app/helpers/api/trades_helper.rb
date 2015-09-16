module Api::TradesHelper

  def current_api_user!
    if token = params[:token] || env['HTTP_TOKEN']
      @current_user = User.find_by({token: token})
    end
  end

end
