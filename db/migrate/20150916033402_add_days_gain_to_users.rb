class AddDaysGainToUsers < ActiveRecord::Migration
  def change
    add_column :users, :days_gain, :decimal
  end
end
