class Sighting
  include MongoMapper::Document

  # Reporter info
  key :ip_address, String
  key :session_id, String

  # Location Info
  key :residence, String,  :required => true
  key :quad,      String,  :required => true
  key :floor,     Integer, :numeric  => true
  key :building,  String,  :required => true

  # Report info
  key :danger_level,  Integer

  timestamps!
  attr_accessible :residence, :quad, :floor, :building, :danger_level
end
