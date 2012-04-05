class Feedback
  include MongoMapper::Document
  include NortonAntiVirus

  API_PUBLIC_ATTRS = [
    :message,
  ]

  API_UPDATABLE_ATTRS = [
    :device_token,
    :message,
  ]

  timestamps!

  # Device Info
  key :device_token,  String,  :required => true
  key :message,       String,  :required => true
  key :ip_address,    String,  :required => true

end