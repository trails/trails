TheApp::Application.routes.draw do  

  # The priority is based upon order of creation:
  # first created -> highest priority.

  # Sample of regular route:
  #   match 'products/:id' => 'catalog#view'
  # Keep in mind you can assign values other than :controller and :action
  match 'task_lists/refreshactivetasks' => 'task_lists#refreshActiveTasks'
  match 'signup' => 'users#new'

  match 'thanks' => 'pages#thanks'


  # Sample of named route:
  #   match 'products/:id/purchase' => 'catalog#purchase', :as => :purchase
  # This route can be invoked with purchase_url(:id => product.id)
  match 'task_lists/:id/setsequence' => 'task_lists#setTasksSequence', :as => :setsequence
  
  match 'login' => 'sessions#new'
  match 'session/destroy' => 'sessions#destroy'

  # Sample resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products
  resource :session
  
  resources :users
  # Sample resource route with options:
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
  
  # Sample resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Sample resource route with more complex sub-resources
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', :on => :collection
  #     end
  #   end

  # Sample resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end

  # You can have the root of your site routed with "root"
  # just remember to delete public/index.html.
  # root :to => 'welcome#index'
  root :to => "pages#home"

  # See how all your routes lay out with "rake routes"

  # This is a legacy wild controller route that's not recommended for RESTful applications.
  # Note: This route will make all actions in every controller accessible via GET requests.
  # match ':controller(/:action(/:id))(.:format)'
  match ':controller/:action'
  match ':controller/:action.:format'  

  match ':controller/:id/:action'
  match ':controller/:id/:action.:format'
end
