require 'rails_helper'

RSpec.describe WelcomeController, type: :controller do

  describe 'GET #index' do

    it 'displays a welcome message' do
      get :index
      expect( response ).to render_template( 'welcome/index' )
    end

  end

end
