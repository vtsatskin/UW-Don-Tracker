APP_ENV ||= 'development'
require 'mongo_mapper'
require 'loofah'

case APP_ENV
  when 'development'
    DATABASE = "UW-Don-Tracker-Dev"
  when 'test'
    DATABASE = "UW-Don-Tracker-Test"
end

MongoMapper.connection = Mongo::Connection.new('localhost', 27017)
MongoMapper.database = DATABASE

# pp y MongoMapper.connection
puts "Connecting to: #{DATABASE}"

MongoMapper.connection.connect
Dir[Dir.pwd + '/lib/*.rb'].each {|file| load file } # load stuff
Dir[Dir.pwd + '/models/*.rb'].each {|file| load file } # load Models