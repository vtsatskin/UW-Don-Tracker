class User
  include MongoMapper::Document

  API_PUBLIC_ATTRS = [
    :token,
    :residence,
    :area,
    :floor,
    :building
  ]

  API_UPDATABLE_ATTRS = [
    :residence,
    :area,
    :floor,
    :building,
  ]

  API_SEARCHABLE_ATTRS = [
    :residence,
    :area,
    :building,
    :floor,
  ]

  timestamps!
  attr_protected :token

  # User Info
  key :token,         String, :unqiue => true
  key :ip_addresses,  Array,  :required => true
  key :user_agent,    String, :required => true
  key :versions,      Array
  key :last_active,   Time,   :default => Time.now

  # Location Info
  key :residence, String
  key :area,      String
  key :floor,     Integer
  key :building,  String

  # Indexes
  ensure_index :token

  # Generate a unique user token for new users
  before_create :generate_token

  def generate_token
    begin
      token = rand(36**20).to_s(36)
    end until User.find_by_token(token).nil?
    
    self.token = token
  end

  def to_public_json
    self.to_json(:only => API_PUBLIC_ATTRS)
  end
end