class Device
  include MongoMapper::Document
  include NortonAntiVirus

  API_PUBLIC_ATTRS = [
    :token,
    :current_residence,
    :current_area,
    :current_floor,
    :current_building,
  ]

  API_UPDATABLE_ATTRS = [
    :uuid,
    :C2DM_id,
    :name,
    :phonegap,
    :platform,
    :version,
    :current_residence,
    :current_area,
    :current_floor,
    :current_building,
  ]

  timestamps!
  attr_protected :token

  # Device Info
  key :token,         String
  key :uuid,          String
  key :name,          String
  key :phonegap,      String
  key :platform,      String
  key :version,       String
  key :ip_addresses,  Array,  :required => true
  key :user_agent,    String, :required => true
  key :versions,      Array
  key :last_active,   Time,   :default => Time.now

  # Location Info
  key :current_residence, String
  key :current_area,      String
  key :current_floor,     String
  key :current_building,  String

  # Indexes
  ensure_index :token, :unique => true

  # Generate a unique user token for new users
  before_create :generate_token

  def generate_token
    begin
      token = rand(36**20).to_s(36)
    end until Device.find_by_token(token).nil?
    
    self.token = token
  end
end