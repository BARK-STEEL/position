class AddOpenNetWorthToUsers < ActiveRecord::Migration
  def change
    add_column :users, :open_net_worth, :decimal
  end
end
