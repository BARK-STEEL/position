class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users do |t|
      t.string :username
      t.string :password_digest
      t.string :email
      t.string :phone
      t.string :token
      t.integer :cash
      t.string :profile_image

      t.timestamps null: false
    end
  end
end
