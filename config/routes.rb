Rails.application.routes.draw do
  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".

  # You can have the root of your site routed with "root"
  root 'welcome#index'


  # Trades
  namespace :api do
    resources :trade, only: [:index, :new, :create, :show]
    get '/trades' => 'trade#index'
    get '/trades/new' => 'trade#new'
    get '/trades/:id' => 'trade#show'
    post '/trades' => 'trade#create'
    delete '/trades/:id' => 'trade#destroy'
    get '/trades/:id/edit' => 'trade#edit'
    put '/trades/:id' => 'trade#update'
    patch '/trades/:id' => 'trade#update'
  end

  get '/users' => 'users#index'
  get '/users/register' => 'users#register', as: :register
  post '/users' => 'users#create'
  get '/users/profile' => 'users#profile', as: :profile
  get '/users/login' => 'users#login', as: :log_in
  get '/users/stock_lookup' => 'users#stock_lookup'
  get '/users/trade' => 'users#trade'
  get '/users/preview_order' => 'users#preview_order'
  get '/users/positions' => 'users#positions'
  get '/users/market_research' => 'users#market_research'


  resources :sessions, only: [:destroy, :create]


  # Example of regular route:
  #   get 'products/:id' => 'catalog#view'

  # Example of named route that can be invoked with purchase_url(id: product.id)
  #   get 'products/:id/purchase' => 'catalog#purchase', as: :purchase

  # Example resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Example resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Example resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Example resource route with more complex sub-resources:
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', on: :collection
  #     end
  #   end

  # Example resource route with concerns:
  #   concern :toggleable do
  #     post 'toggle'
  #   end
  #   resources :posts, concerns: :toggleable
  #   resources :photos, concerns: :toggleable

  # Example resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end
end
