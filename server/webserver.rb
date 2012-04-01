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

QUERYABLE_KEYS = [
  :residence,
  :quad,
  :building,
  :floor
]

get '/sightings' do
  search_query = params.select { |k,v| QUERYABLE_KEYS.include? k }

  # Set limit if not specified
  limit ||= 5

  # Ensure specified limit is not rediculous
  if params[:limit]
    specified_limit = params[:limit].to_i
    if specified_limit <= 100 && specified_limit > 0
      limit = specified_limit
    end
  end

  Sighting.where(search_query).sort(:created_at.desc).limit(limit).to_json
end