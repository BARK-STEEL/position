module SessionsHelper

  def authenticate!
    if current_user
      return true
    else
      redirect_to log_in_path
      return false
    end
  end

  def current_user
    if session[:user_id]
      @current_user = User.find(session[:user_id])
    else
      redirect_to log_in_path
    end
  end

end
