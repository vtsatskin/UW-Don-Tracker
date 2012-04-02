# webserver.rb
APP_ENV ||= 'development'

require 'sinatra'
require 'haml'
require 'json'
require './config/mongodb.rb'

set :server, :thin
set :haml, :format => :html5, :layout => :default
enable :reload_templates if APP_ENV == 'development'
enable :static
set :static_cache_control, [:public, :max_age => 300]

post '/sighting' do
  sighting = Sighting.create params

  if sighting.valid?
    sighting.to_json
  else
    errors = sighting.errors.map { |k,v| "#{k}: #{v}" }
    [500, "Error creating sighting: #{errors}"]
  end
end

get '/sightings' do
  search_query = params.select { |k,v| User::API_SEARCHABLE_ATTRS.include? k }

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

  Sighting.where(search_query).sort(:created_at.desc).limit(limit).to_json
end

# Creates and returns a new User (JSON)
post '/user' do
  User.create({
    :ip_addresses => [request.ip],
    :user_agent   => request.user_agent,
  }).to_public_json
end

# Gets a User from specified Token (JSON)
# Attributes displayed are whitelisted
get '/user/:token' do
  if user = User.find_by_token(params[:token])
    user.to_public_json
  else
    [500, "No user found"]
  end
end

# Updates a specified User by given POST data.
# Attributes updated are whitelisted
# Updated User is returned (JSON)
post '/user/:token/update' do
  if user = User.find_by_token(params[:token])
    filtered_params = params.select { |key, value| User::API_UPDATABLE_ATTRS.include? key.to_sym }
    user.update_attributes filtered_params unless filtered_params.empty? 
    user.to_public_json
  else
    [500, "No user found"]
  end
end