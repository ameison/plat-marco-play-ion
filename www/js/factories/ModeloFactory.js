angular.module('starter').factory('ModeloFactory', function ($http, myConfig) {

    var modeloFactory = {}

    modeloFactory.lista = function (callback) {
        $http.get(myConfig.apiUrl + '/modelos').then(function (response) {
            callback(response.data);
        });
    }

    modeloFactory.getXId = function (id, callback) {
        $http.get(myConfig.apiUrl + '/modelo/'+id).then(function (response) {
            callback(response.data);
        });
    }
    return modeloFactory;
});
