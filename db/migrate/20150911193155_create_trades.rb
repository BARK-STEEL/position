class CreateTrades < ActiveRecord::Migration
  def change
    create_table :trades do |t|
      t.integer :user_id
      t.string :company_symbol
      t.integer :number_of_shares
      t.decimal :share_purchase_price
      t.string :trade_type

      t.timestamps null: false
    end
  end
end
