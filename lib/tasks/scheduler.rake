desc "This task is called by the Heroku scheduler add-on"
task :update_users => :environment do
  puts "Updating users in database..."
  User.update_all_users
  puts "done."
end

desc "This task is called by the Heroku scheduler add-on"
task :update_net_worth => :environment do
  puts "Updating the open net worth of users in database..."
  User.update_open_performance
  puts "done."
end
