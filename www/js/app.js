// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
//angular.module('starter', ['ionic', 'starter.controllers'])
var db = undefined;
var starter = angular.module('starter',
[
  'ionic',
  'ngCordova',
  'LocalStorageModule',
  'satellizer'
])

.run(function($ionicPlatform, $cordovaSQLite, localStorageService) {
  $ionicPlatform.ready(function() {
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
    db = $cordovaSQLite.openDB({ name: "sigeslub.db", iosDatabaseLocation:'default'});
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS categorias (id INTEGER PRIMARY KEY, nombre TEXT)");
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS modelos (id INTEGER PRIMARY KEY, nombre TEXT, categoria_id INTEGER, FOREIGN KEY(categoria_id) REFERENCES categorias(id))");
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS minas (id INTEGER PRIMARY KEY, nombre TEXT)");
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS superintendencias (id INTEGER PRIMARY KEY, nombre TEXT, mina_id INTEGER, FOREIGN KEY(mina_id) REFERENCES minas(id))");
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS equipos (id INTEGER PRIMARY KEY, nombre TEXT, superintendencia_id INTEGER, modelo_id INTEGER, FOREIGN KEY(superintendencia_id) REFERENCES superintendencias(id), FOREIGN KEY(modelo_id) REFERENCES modelos(id))");
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS furs (id INTEGER PRIMARY KEY, nombre TEXT, modelo_id INTEGER, mina_id INTEGER, tipo_inspeccion TEXT, contenido TEXT, FOREIGN KEY(modelo_id) REFERENCES modelos(id), FOREIGN KEY(mina_id) REFERENCES minas(id))");
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS inspecciones (id INTEGER PRIMARY KEY, servidor_id INTEGER, estado TEXT, tipo TEXT, equipo_id INTEGER, fur_id INTEGER, orden_trabajo TEXT, horometro INTEGER, prioridad TEXT, responsable_id INTEGER, responsable_nombres TEXT, resumen_actividad TEXT, aprobado_soporte INTEGER, compartido INTEGER, sincronizado INTEGER, inspeccion_cerrada_id INTEGER, modelo_id INTEGER, superintendencia_id INTEGER, contenido TEXT, fecha_creacion TEXT, observaciones TEXT, FOREIGN KEY(equipo_id) REFERENCES equipos(id), FOREIGN KEY(fur_id) REFERENCES furs(id), FOREIGN KEY(modelo_id) REFERENCES modelos(id), FOREIGN KEY(superintendencia_id) REFERENCES superintendencias(id))");
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS seguimientos (id INTEGER PRIMARY KEY, estado TEXT, equipo_id INTEGER, equipo TEXT, ultima_intervencion TEXT, dias TEXT, resumen TEXT, tipo_inspeccion TEXT, FOREIGN KEY(equipo_id) REFERENCES equipos(id))");
  });
})

.constant("myConfig", {
    //"apiUrl": "http://192.168.1.116:9000/rest-sigeslub",
    //"apiUrl": "http://192.168.1.2:9000/rest-sigeslub",
    //"apiUrl": "http://192.168.40.10:9000/rest-sigeslub",
    "apiUrl": "http://35.184.167.220/mrest-sigeslub",
    "prioridadInspeccion" : [
      { "id": "AL", "nombre": "Alta" },
      { "id": "NO", "nombre": "Normal" },
      { "id": "BA", "nombre": "Baja" }
    ],
    "tipoInspeccion": [
      { "id": "IS", "nombre": "Inspección SCL"},
      { "id": "MT", "nombre": "Monitoreo de temperatura"},
      { "id": "MC", "nombre": "Eventos"},
      { "id": "IE", "nombre": "Inspección engranaje"}
    ],
    "estadoInspeccion": [
      { "id": "P", "nombre": "En proceso"},
      { "id": "O", "nombre": "Observado"},
      { "id": "F", "nombre": "Finalizado"}
    ],
    "historialInspeccion": [
      { "id": "INS", "nombre": "Inspección"},
      { "id": "REV", "nombre": "Revisión"},
      { "id": "OBS", "nombre": "Observado"},
      { "id": "APR", "nombre": "Aprobado"}
    ]
})

.config(function (localStorageServiceProvider) {
    localStorageServiceProvider.setPrefix('sigeslub');
})

.config(function ($provide, $httpProvider, $authProvider) {
    $authProvider.tokenName = 'token';
    $authProvider.tokenPrefix = 'satellizer';
    $authProvider.tokenHeader = 'Authorization';
    $authProvider.tokenType = 'Bearer';
    $authProvider.storageType = 'localStorage';
})

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'MainCtrl'
  })

  .state('app.inspeccion-ssl', {
    url: '/inspeccion-ssl',
    views: {
      'menuContent': {
        templateUrl: 'templates/inspeccion-ssl.html',
        controller: 'InspeccionSSLCtrl'
      }
    }
  })

  .state('app.monitoreo-temperatura', {
    url: '/monitoreo-temperatura',
    views: {
      'menuContent': {
        templateUrl: 'templates/monitoreo-temperatura.html',
        controller: 'MonitoreoTemperaturaCtrl'
      }
    }
  })

  .state('app.mantenimiento-correctivo', {
    url: '/mantenimiento-correctivo',
    views: {
      'menuContent': {
        templateUrl: 'templates/mantenimiento-correctivo.html',
        controller: 'MantenimientoCorrectivoCtrl'
      }
    }
  })

  .state('app.inspeccion-engranaje', {
    url: '/inspeccion-engranaje',
    views: {
      'menuContent': {
        templateUrl: 'templates/inspeccion-engranaje.html',
        controller: 'InspeccionEngranajeCtrl'
      }
    }
  })

  .state('app.formato', {
    url: '/formato',
    views: {
      'menuContent': {
        templateUrl: 'templates/formato.html',
        controller: 'FormatoCtrl'
      }
    },
    params: {inspeccionId: ''}
  })

  .state('app.configuracion', {
    url: '/configuracion',
    views: {
      'menuContent': {
        templateUrl: 'templates/configuracion.html',
        controller: 'ConfiguracionCtrl'
      }
    }
  })

  .state('app.seguimiento', {
    url: '/seguimiento',
    views: {
      'menuContent': {
        templateUrl: 'templates/seguimiento.html',
        controller: 'SeguimientoCtrl'
      }
    }
  })

  .state('login-usuario', {
     url: '/login-usuario',
     templateUrl: 'templates/login.html',
     controller: 'LoginCtrl'
   });

   $urlRouterProvider.otherwise('/login-usuario');



});
