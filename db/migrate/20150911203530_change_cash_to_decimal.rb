class ChangeCashToDecimal < ActiveRecord::Migration
  def change
    change_column :users, :cash, :decimal
  end
end
