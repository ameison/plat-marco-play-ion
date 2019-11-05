angular.module('starter').factory('EquipoFactory', function ($http, myConfig) {

    var equipoFactory = {}

    equipoFactory.lista = function (callback) {
        $http.get(myConfig.apiUrl + '/equipos').then(function (response) {
            callback(response.data);
        });
    }

    equipoFactory.getXId = function (id, callback) {
        $http.get(myConfig.apiUrl + '/equipo/'+id).then(function (response) {
            callback(response.data);
        });
    }

    equipoFactory.getSeguimientoPreventivo = function (data, callback) {
        $http.post(myConfig.apiUrl + '/equipos/seguimiento', data).then(function (response) {
            callback(response.data);
        });
    }

    return equipoFactory;
});
