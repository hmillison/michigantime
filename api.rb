# api.rb
require 'rubygems'
require 'sinatra'
require "sinatra/json"
require 'rest_client'
require "json"

get '/near' do
    loc = [42.277565,-83.7354167]
    closest = []
    stops = get_stops()
    routes = get_routes()

    #Get stops within half mile of user and the next buses arriving at each stop
    #Params: latitude and longitude of user
    stops.each do |stop|
        stop_loc = [stop['lat'], stop['lon']]
        dist = get_distance(loc, stop_loc)
        if dist < 0.5
            stop_obj = {}
            stop_obj['stopID'] = stop['id']
            stop_obj['dist'] = dist
            stop_obj['name'] = stop['name']
            stop_obj['description'] = stop['description']

            id = stop_obj['stopID']
            eta_response = JSON.parse(get_etas(id))
            etas = eta_response['etas']["#{id}"]['etas']
            stop_obj['etas'] = reformat_etas(etas, routes)

            closest << stop_obj
        end
    end

    JSON closest
end

#Gets bus route names for every ETA
def reformat_etas(etas, routes)
    result = []
    etas.each do |eta|
        routes.each do |route|

            if eta['route'] == route['id']
                eta['name'] = route['name']
                eta['shortname'] = route['short_name']
                result << eta
                break
            end
        end
    end
    return result
end

def get_stops
    return response = JSON.parse(RestClient.get 'http://mbus.doublemap.com/map/v2/stops')
end

def get_routes
    return response = JSON.parse(RestClient.get 'http://mbus.doublemap.com/map/v2/routes')
end

def get_etas(id)
    response = RestClient.get "http://mbus.doublemap.com/map/v2/eta?stop=#{id}";
    return response
end

#Returns Distance in Miles beteween two sets of coordinates
def get_distance(loc1, loc2)
  rad_per_deg = Math::PI/180  # PI / 180
  rkm = 6371                  # Earth radius in kilometers
  rm = rkm * 1000             # Radius in meters

  dlat_rad = (loc2[0]-loc1[0]) * rad_per_deg  # Delta, converted to rad
  dlon_rad = (loc2[1]-loc1[1]) * rad_per_deg

  lat1_rad, lon1_rad = loc1.map {|i| i * rad_per_deg }
  lat2_rad, lon2_rad = loc2.map {|i| i * rad_per_deg }

  a = Math.sin(dlat_rad/2)**2 + Math.cos(lat1_rad) * Math.cos(lat2_rad) * Math.sin(dlon_rad/2)**2
  c = 2 * Math::atan2(Math::sqrt(a), Math::sqrt(1-a))

  return rm * c * 0.00062137# Delta in meters
end
