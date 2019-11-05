angular.module('starter').factory('InspeccionFactory', function ($http, myConfig) {

    var inspeccionFactory = {}

    // inspeccionFactory.descargarInspecciones = function (callback) {
    //   $http.get(myConfig.apiUrl + '/descargar/inspecciones').then(function (response) {
    //     callback(response.data);
    //   });
    // }

    inspeccionFactory.descargarSincInspecciones = function (callback) {
      $http.get(myConfig.apiUrl + '/sync/inspecciones/pendientes').then(function (response) {
        callback(response.data);
      });
    }

    inspeccionFactory.sincRegistrar = function (data, callback) {
      $http.post(myConfig.apiUrl + '/inspeccion', data).then(function (resultado) {
        callback(resultado.data);
      });
    };

    inspeccionFactory.sincActualizar = function (data, callback) {
      $http.put(myConfig.apiUrl + '/inspeccion', data).then(function (resultado) {
        callback(resultado.data);
      });
    };

    inspeccionFactory.descargarConfiguracion = function (callback) {
      $http.get(myConfig.apiUrl + '/configuracion').then(function (response) {
        callback(response.data);
      });
    }

    return inspeccionFactory;
});
