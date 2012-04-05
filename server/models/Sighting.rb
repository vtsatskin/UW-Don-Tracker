class Sighting
  include MongoMapper::Document
  include NortonAntiVirus

  SANITIZED_KEYS = [ :residence, :area, :floor, :building, :danger_level, :device_token ]

  API_PUBLIC_ATTRS = [
    :residence,
    :area,
    :building,
    :floor,
    :created_at,
    :danger_level,
  ]

  API_SEARCHABLE_ATTRS = [
    :residence,
    :area,
    :building,
    :floor,
  ]

  # Reporter info
  key :ip_address,    String,   :required => true
  key :device_token,  String,   :required => true

  # Location Info
  key :residence,     String,   :required => true
  key :area,          String
  key :floor,         String,   :required => true
  key :building,      String

  # Report info
  key :danger_level,  String,   :required => true

  timestamps!
  attr_accessible :residence, :area, :floor, :building, :danger_level, :device_token, :ip_address

  before_save :sanitize!

  def sanitize!
    SANITIZED_KEYS.each do |key|
      data = self.send(key)
      doc = Loofah.fragment(data)
      self.send(key.to_s+'=', doc.text)
    end
  end
end