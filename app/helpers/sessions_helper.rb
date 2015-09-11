module SessionsHelper

  def authorize!

    redirect_to log_in_path unless current_user

  end

  def current_user

    if session[:user_id]
      @current_user = User.find(session[:user_id])
    else
      redirect_to log_in_path
    end

  end

end
