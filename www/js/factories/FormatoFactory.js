angular.module('starter').factory('FormatoFactory', function ($http, myConfig) {

    var formatoFactory = {}

    formatoFactory.lista = function (callback) {
        $http.get(myConfig.apiUrl + '/furs').then(function (response) {
            callback(response.data);
        });
    }

    formatoFactory.getXId = function (id, callback) {
        $http.get(myConfig.apiUrl + '/fur/'+id).then(function (response) {
            callback(response.data);
        });
    }
    return formatoFactory;
});
