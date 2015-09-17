class AddPortfolioValueToUsers < ActiveRecord::Migration
  def change
    add_column :users, :portfolio_value, :decimal
  end
end
