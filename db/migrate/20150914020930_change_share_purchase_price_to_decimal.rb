class ChangeSharePurchasePriceToDecimal < ActiveRecord::Migration
  def change
    change_column :trades, :share_purchase_price, :decimal
  end
end
