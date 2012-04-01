APP_ENV ||= 'development'
require 'mongo_mapper'

if APP_ENV == 'development'
  MongoMapper.connection = Mongo::Connection.new('localhost', 27017)
  MongoMapper.database = "UW-Don-Tracker-Dev"
elsif APP_ENV == 'test'
  MongoMapper.connection = Mongo::Connection.new('localhost', 27017)
  MongoMapper.database = "UW-Don-Tracker-Test"
end

MongoMapper.connection.connect
Dir[Dir.pwd + '/models/*.rb'].each {|file| load file } # load Models