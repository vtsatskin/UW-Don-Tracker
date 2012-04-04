class Sighting
  include MongoMapper::Document

  # Reporter info
  key :ip_address, String
  key :session_id, String

  # Location Info
  key :residence, String,  :required => true
  key :area,      String
  key :floor,     String,  :required => true
  key :building,  String,  :required => true

  # Report info
  key :danger_level,  String, :required => true

  timestamps!
  attr_accessible :residence, :area, :floor, :building, :danger_level

  before_save :format_data

  def format_data
    self.residence.upcase!
  end
end