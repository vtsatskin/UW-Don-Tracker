# webserver.rb
APP_ENV ||= 'development'

require 'sinatra'
require 'haml'
require 'json'
require './config/mongodb.rb'

disable :protection
set :server, :thin
set :haml, :format => :html5, :layout => :default
enable :reload_templates if APP_ENV == 'development'
enable :static
set :static_cache_control, [:public, :max_age => 300]
set :public_folder, File.join(File.dirname(__FILE__), '..', 'mobile/assets/www')

def json_error code, message
  [500, { :errors => [ { :code => code, :message => message } ] }.to_json ]
end

# jQuery mobile insists on making forms AJAX
post '/index.html' do
  "Stupid jQuery..."
end

post '/sighting' do
  content_type :json
  params[:ip_address] = request.ip;
  sighting = Sighting.create params

  if sighting.valid?
    sighting.to_public_json
  else
    errors = sighting.errors.map { |k,v| "#{k}: #{v}" }
    json_error "WHYYOULIE", "Error creating sighting: #{errors}"
  end
end

get '/sightings' do
  content_type :json
  search_query = params.select { |k,v| Sighting::API_SEARCHABLE_ATTRS.include? k }

  # Set limit if not specified
  limit ||= 5

  # Ensure specified limit is not rediculous
  if params[:limit]
    specified_limit = params[:limit].to_i
    if specified_limit <= 100 && specified_limit > 0
      limit = specified_limit
    end
  end

  # Return only queries since specified time
  # A relative or concrete time may be given
  if params[:since] && !params[:since].empty? && params[:since] != "null"
    since = Time.parse(params[:since])
    search_query[:created_at.gte] = since
  end

  sightings = Sighting.where(search_query).sort(:created_at.desc).limit(limit)
  sightings.map { |s| s.to_public }.to_json
end

# Creates and returns a new Device (JSON)
post '/device' do
  content_type :json
  device = Device.new
  device.update_attributes_from_public(params).update_attributes({
    :ip_addresses => [request.ip],
    :user_agent   => request.user_agent,
  })
  if device.save
    device.to_public_json
  else
    json_error "STRANGERDANGER", "No device found"
  end
end

# Gets a Device from specified Token (JSON)
# Attributes displayed are whitelisted
get '/device/:token' do
  content_type :json
  if device = Device.find_by_token(params[:token])
    device.to_public_json
  else
    json_error "STRANGERDANGER", "No device found"
  end
end

# Updates a specified Device by given POST data.
# Attributes updated are whitelisted
# Updated Device is returned (JSON)
post '/device/:token/update' do
  if device = Device.find_by_token(params[:token])
    device.update_attributes_from_public params
    device.to_public_json
  else
    json_error "STRANGERDANGER", "No device found"
  end
end

get '/check_version/:version' do
  # Upcoming: ALPHADEV2
  current_version = "ALPHADEV"
  update_text = "A new version is avaliable <a href='https://build.phonegap.com/apps/96858/share'>download here</a>"

  unless params[:version] == current_version
    { :latest => false, :message => update_text }.to_json
  else
    { :latest => true }.to_json
  end
end

# Params: device_token, message
post '/feedback' do
  if device = Device.find_by_token(params[:device_token])
    f = Feedback.new({
      :device_token => device.token,
      :message => params[:message],
      :ip_address => request.ip,
    })
    if f.save
      f.to_public_json
    else
      errors = f.errors.map { |k,v| "#{k}: #{v}" }
      json_error "TALKTOTHEHAND", "Error creating feedback: #{errors}"
    end
  else
    json_error "STRANGERDANGER", "No device found"
  end
end