var app = angular.module('michigantime',['ngResource', 'ngAnimate']);

app.controller('MainController', ['$scope', '$http', '$resource', '$timeout', 
function($scope, $http, $resource, $timeout){
		if (navigator.geolocation){
			$scope.loading = "Finding your Location";
	    	navigator.geolocation.getCurrentPosition(function(position){

	      			var userlat = position.coords.latitude;
	      			var userlon = position.coords.longitude
	        		$http.defaults.useXDomain = true;
	        		$scope.loading = "Getting Closest Bus Stops"
	        		$http.get('/stops').
	        		success(function(data, status, headers, config) {
					    getClosestStops(userlat,userlon,data);
					});
	        
	    	});
	  	}
  	//$scope.output = [];

  	//takes in users location and returns an array of stops within half a mile
	function getClosestStops(userlat, userlon, stops){
		var closestStops = [];
		for(var i = 0;i<stops.length;i++){
			var distToStop = getDistance(userlat, userlon, stops[i].lat, stops[i].lon);
			if(distToStop < .5){
				closestStops.push({
					id : stops[i].id,
					name : stops[i].name,
					description : stops[i].description,
					distance : distToStop.toFixed(2)
				});
			}
		}
			
		$scope.buses = closestStops; //debugging
		return getBusTimes(closestStops);
	}

	function getBusTimes(stops){
		$scope.buses = [];
		for(var i = 0;i<stops.length;i++){
			currentstop = stops[i];
			$http.get('/eta?stop=' + currentstop.id).
			success((function(currentstop){
				//console.log(currentstop);
				 return function(data) {
        			console.log(currentstop);
        			console.log(data);
    			}	
			})(currentstop));
		}
	}

	 //takes in two sets of points and returns distance
	function getDistance(lat1, lon1, lat2, lon2){
	    var radlat1 = Math.PI * lat1/180;
	    var radlat2 = Math.PI * lat2/180;
	    var radlon1 = Math.PI * lon1/180;
	    var radlon2 = Math.PI * lon2/180;
	    var theta = lon1-lon2;
	    var radtheta = Math.PI * theta/180;
	    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	    dist = Math.acos(dist);
	    dist = dist * 180/Math.PI;
	    dist = dist * 60 * 1.1515;
	    return dist;
	} 

}]);
