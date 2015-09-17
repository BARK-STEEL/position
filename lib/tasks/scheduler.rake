desc "This task is called by the Heroku scheduler add-on"
task :update_users => :environment do
  puts "Updating users in database..."
  User.update_all_users
  puts "done."
end
