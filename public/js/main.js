var app = angular.module('Michigan.Time',[]);

app.controller('BusCtrl',
function($scope, $http){

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(findBuses);
    } else {
      console.log('not supported');
    }

    function findBuses(pos) {
        console.log(pos.coords.latitude, pos.coords.longitude);

        $http.get('/near?lat=' + pos.coords.latitude + '&lng=' + pos.coords.longitude)
            .success(function(data, status, headers, config) {
                $scope.results = [];
                for(var i = 0;i<data.length;i++){
                    $scope.results.push(data[i]);
                }
            });
    }

});

