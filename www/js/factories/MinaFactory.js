angular.module('starter').factory('MinaFactory', function ($http, myConfig) {

    var minaFactory = {}

    minaFactory.lista = function (callback) {
        $http.get(myConfig.apiUrl + '/minas').then(function (response) {
            callback(response.data);
        });
    }

    minaFactory.getXId = function (id, callback) {
        $http.get(myConfig.apiUrl + '/mina/'+id).then(function (response) {
            callback(response.data);
        });
    }
    return minaFactory;
});
