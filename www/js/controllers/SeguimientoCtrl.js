starter.controller('SeguimientoCtrl', function($scope, $rootScope, $http, myConfig,
  CategoriaFactory, EquipoFactory, $cordovaSQLite, $cordovaToast, $cordovaNetwork, $ionicPlatform) {

  $scope.tiposSeguimientos = [];
  $scope.seguimientos = [];
  $scope.data = {};

  $ionicPlatform.ready(function () {

    var conexion;

    if(window.Connection) {
        if(navigator.connection.type == Connection.NONE) {
          conexion = false;
        } else {
          conexion = true;
        }
    }

    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
      if (toState.name == 'app.configuracion') {
        if(window.Connection) {
            if(navigator.connection.type == Connection.NONE) {
              conexion = false;
            } else {
              conexion = true;
            }
        }
      }
    });

    document.addEventListener("deviceready", function () {

      $rootScope.$on('$cordovaNetwork:online', function(event, networkState){
        conexion = true;
        showToast("Tienes conexión a internet");
      })

      $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
        conexion = false;
        showToast("No tienes conexión a internet");
      })

    }, false);

    $scope.descargarSeguimiento = function(){
      var categorias = []
      for (var i = 0; i < $scope.categorias.length; i++) {
        var categoria = $scope.categorias[i];
        if (categoria.checked){
          categorias.push(categoria.id);
        }
      }

      var data = {
        "minaId": $scope.data.mina,
        "categorias": categorias,
        "tipoSeguimiento": $scope.data.tipo
      }

      //console.log("Data pa enviar", JSON.stringify(data));

      EquipoFactory.getSeguimientoPreventivo(data, function (response){
        //console.log("Respuesta del servidor");
        //console.log("getSeguimientoPreventivo", JSON.stringify(response));
        $scope.limpiarSeguimiento(response);
      });
    }

    $scope.limpiarSeguimiento = function(seguimientos){
      var queryDel = "DELETE FROM seguimientos";
      $cordovaSQLite.execute(db, queryDel, []).then(function(res) {
        if (seguimientos.length > 0){
          for (var i = 0; i < seguimientos.length; i++) {
            $scope.registrarSeguimiento(seguimientos[i]);
          }
        }else{
          $scope.seguimientos = [];
          showToast("No se encontraron resultados");
        }
      }, function (err) {
        console.error(JSON.stringify(err));
        $scope.seguimientos = [];
      });
    }

    $scope.registrarSeguimiento = function(seguimiento){
      var query = "INSERT INTO seguimientos (estado, equipo_id, equipo, ultima_intervencion, dias, resumen, tipo_inspeccion) VALUES (?,?,?,?,?,?,?)";
      $cordovaSQLite.execute(db, query, [seguimiento.estado, seguimiento.equipo_id, seguimiento.equipo, seguimiento.ultima_intervencion,
        seguimiento.dias, seguimiento.resumen, seguimiento.tipo_inspeccion]).then(function(res) {
        $scope.listarSeguimiento();
      }, function (err) {
        console.error(JSON.stringify(err));
      });
    }

    $scope.listarSeguimiento = function(){
      try {
        //console.log("Listado de seguimientos");
        var query = "SELECT estado, equipo_id, equipo, ultima_intervencion, dias, resumen, tipo_inspeccion FROM seguimientos";
        $cordovaSQLite.execute(db, query, []).then(function(res) {
          $scope.seguimientos = [];
          for (var i = 0; i < res.rows.length; i++) {

            var tipoInspeccion = "";

            for (var k = 0; k < myConfig.tipoInspeccion.length; k++) {
              if (myConfig.tipoInspeccion[k].id == res.rows.item(i).tipo_inspeccion){
                tipoInspeccion = myConfig.tipoInspeccion[k].nombre;
              }
            }

            $scope.seguimientos.push({
              "estado": res.rows.item(i).estado.toUpperCase(),
              "equipo_id": res.rows.item(i).equipo_id,
              "equipo": res.rows.item(i).equipo,
              "ultima_intervencion": res.rows.item(i).ultima_intervencion,
              "dias": res.rows.item(i).dias,
              "resumen": res.rows.item(i).resumen,
              "tipo_inspeccion": tipoInspeccion
            });
          }
        }, function (err) {
          console.error("Error Sqlite", JSON.stringify(err));
        });
      } catch (err) {
        console.error("Error Catch", JSON.stringify(err));
      }
    }

    $scope.obtenerCategorias = function(){
      if (conexion) {
        var queryCat = "SELECT id, nombre FROM categorias";
        $cordovaSQLite.execute(db, queryCat, []).then(function(res) {
          $scope.categorias = [];
          for (var i = 0; i < res.rows.length; i++) {
            $scope.categorias.push({"id": res.rows.item(i).id, "nombre": res.rows.item(i).nombre, "checked": false})
          }
        }, function (err) {
          console.error(err);
        });

      } else {
        showToast("Necesita conexión a internet para poder descargar");
      }
    }

    $scope.obtenerMinas = function(){
      if (conexion) {
        var queryMin = "SELECT id, nombre FROM minas";
        $cordovaSQLite.execute(db, queryMin, []).then(function(res) {
          $scope.minas = [];
          for (var i = 0; i < res.rows.length; i++) {
            $scope.minas.push({"id": res.rows.item(i).id, "nombre": res.rows.item(i).nombre})
          }
          $scope.data.mina = $scope.minas[0].id;
        }, function (err) {
          console.error(err);
        });

      } else {
        showToast("Necesita conexión a internet para poder descargar");
      }
    }

    $scope.obtenerTipos = function(){
      $scope.tiposSeguimientos.push(myConfig.tipoInspeccion[0]);
      $scope.tiposSeguimientos.push(myConfig.tipoInspeccion[3]);
      $scope.data.tipo = $scope.tiposSeguimientos[0].id;
    }

    function showToast(message) {
      $cordovaToast.show(message, 'long', 'bottom').then(function(success) {
        console.log("Se mostro toast");
      }, function (error) {
        console.log("Error al mostrar toast " + error);
      });
    }

    function mostrarDialogo(){
      if(window.device){
        cordova.plugin.pDialog.init({
            theme : 'HOLO_DARK',
            progressStyle : 'SPINNER',
            cancelable : false,
            title : 'Descargando datos...',
            message : 'Espere por favor...'
        });
      }
    }

    function ocultarDialogo(){
      if(window.device){
        cordova.plugin.pDialog.dismiss();
      }
    }

    $scope.listarSeguimiento();
    $scope.obtenerCategorias();
    $scope.obtenerMinas();
    $scope.obtenerTipos();

  });


})
