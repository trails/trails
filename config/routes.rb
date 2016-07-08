TheApp::Application.routes.draw do
  get 'auth/:provider/callback' => 'sessions#create'
  get 'auth/failure' => redirect('/')

  get '/logout' => 'sessions#destroy'

  match 'task_lists/refresh' => 'task_lists#refresh', via: [:get, :post, :put]
  get 'task_lists/:id/setSequence' => 'task_lists#setSequence', :as => :setsequence
  get 'invoices/:id/setSequence' => 'invoices#setSequence', :as => :setSequence
  get "/clients/:id" => 'clients#show', :constraints => { :id => /[^\/]+/ }

  get 'thanks' => 'pages#thanks'

  resource :sessions, only: [:create, :destroy]
  resources :contacts, only: [:index, :show]

  resources :users,
            :clients,
            :invoices,
            :task_lists


  resources :task_lists do
    resources :tasks
    member do
      post :destroy
    end
  end

  resources :tasks do
    resources :actions
    member do
      post :destroy
    end
  end

  root :to => "pages#home"

  match ':controller/:action', via: [:get, :post, :put, :delete]
  match ':controller/:id/:action', via: [:get, :post, :put, :delete]
end
