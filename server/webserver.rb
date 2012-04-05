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
    [500, "Error creating sighting: #{errors}"]
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
  if params[:since]
    begin
      since = Time.parse(params[:since])
      search_query[:created_at.gte] = since
    rescue => e
      # TODO: include errors in results                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  # 
      # [500, 'Invalid Time given for since parameter']
    end
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
    puts device.errors.map { |k,v| "#{k}: #{v}" }
    device.to_public_json
  else
    errors = device.errors.map { |k,v| "#{k}: #{v}" }
    [500, "Error saving your device: #{errors}"]
  end
end

# Gets a Device from specified Token (JSON)
# Attributes displayed are whitelisted
get '/device/:token' do
  content_type :json
  if device = Device.find_by_token(params[:token])
    device.to_public_json
  else
    [500, "No device found"]
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
    [500, "No device found"]
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