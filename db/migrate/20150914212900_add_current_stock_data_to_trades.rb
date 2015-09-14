class AddCurrentStockDataToTrades < ActiveRecord::Migration
  def change
    add_column :trades, :last_price, :decimal
    add_column :trades, :dollar_change, :decimal
    add_column :trades, :change_percent, :decimal
    add_column :trades, :open_price, :decimal
    add_column :trades, :high_price, :decimal
    add_column :trades, :low_price, :decimal
  end
end
 
