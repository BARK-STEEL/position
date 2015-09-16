class AddNetWorthToUsers < ActiveRecord::Migration
  def change
    add_column :users, :net_worth, :decimal
  end
end
