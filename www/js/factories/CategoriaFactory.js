angular.module('starter').factory('CategoriaFactory', function ($http, myConfig) {

    var categoriaFactory = {}

    categoriaFactory.lista = function (callback) {
        $http.get(myConfig.apiUrl + '/categorias').then(function (response) {
            callback(response.data);
        });
    }

    categoriaFactory.getXId = function (id, callback) {
        $http.get(myConfig.apiUrl + '/categoria/'+id).then(function (response) {
            callback(response.data);
        });
    }
    return categoriaFactory;
});
