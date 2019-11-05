angular.module('starter').factory('SuperintendenciaFactory', function ($http, myConfig) {

    var superintendenciaFactory = {}

    superintendenciaFactory.lista = function (callback) {
        $http.get(myConfig.apiUrl + '/superintendencias').then(function (response) {
            callback(response.data);
        });
    }

    superintendenciaFactory.getXId = function (id, callback) {
        $http.get(myConfig.apiUrl + '/superintendencia/'+id).then(function (response) {
            callback(response.data);
        });
    }
    return superintendenciaFactory;
});
