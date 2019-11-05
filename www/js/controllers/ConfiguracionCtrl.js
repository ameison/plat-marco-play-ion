starter.controller('ConfiguracionCtrl', function($scope, $rootScope, $http, myConfig,
  CategoriaFactory, FormatoFactory, MinaFactory, ModeloFactory, SuperintendenciaFactory,
  EquipoFactory, $cordovaSQLite, $cordovaToast, $cordovaNetwork, InspeccionFactory) {

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


  $scope.descargarFormatos = function(){

    if (conexion) {

      mostrarDialogo();
      InspeccionFactory.descargarConfiguracion(function(data){

        for (var i = 0; i < data.categorias.length; i++) {
          var categoria = data.categorias[i];
          var query = "INSERT INTO categorias (id, nombre) VALUES (?,?)";
          $cordovaSQLite.execute(db, query, [categoria.id, categoria.nombre]).then(function(res) {
              console.log("CATEGORIA REGISTRADA : " + JSON.stringify(res));
          }, function (err) {
              console.error("error categorias: " + JSON.stringify(err));
          });
        }

        for (var i = 0; i < data.modelos.length; i++) {
          var modelo = data.modelos[i];
          var query = "INSERT INTO modelos (id, nombre, categoria_id) VALUES (?,?,?)";
          $cordovaSQLite.execute(db, query, [modelo.id, modelo.nombre, modelo.categoria.id]).then(function(res) {
              console.log("MODELO REGISTRADA : " + JSON.stringify(res));
          }, function (err) {
              console.error("error modelos: " + JSON.stringify(err));
          });
        }

        for (var i = 0; i < data.minas.length; i++) {
          var mina = data.minas[i];
          var query = "INSERT INTO minas (id, nombre) VALUES (?,?)";
          $cordovaSQLite.execute(db, query, [mina.id, mina.nombre]).then(function(res) {
              console.log("MINA REGISTRADA : " + JSON.stringify(res));
          }, function (err) {
              console.error("error minas: " + JSON.stringify(err));
          });
        }

        for (var i = 0; i < data.superintendencias.length; i++) {
          var superintendencia = data.superintendencias[i];
          var query = "INSERT INTO superintendencias (id, nombre, mina_id) VALUES (?,?,?)";
          $cordovaSQLite.execute(db, query, [superintendencia.id, superintendencia.nombre, superintendencia.mina.id]).then(function(res) {
              console.log("SUPERINTENDENCIA REGISTRADA : " + JSON.stringify(res));
          }, function (err) {
              console.error("error superintendencia: " + JSON.stringify(err));
          });
        }

        for (var i = 0; i < data.formatos.length; i++) {
          var formato = data.formatos[i];
          var query = "INSERT INTO furs (id, nombre, modelo_id, mina_id, tipo_inspeccion, contenido) VALUES (?,?,?,?,?,?)";
          $cordovaSQLite.execute(db, query, [formato.id, formato.nombre, formato.modelo.id, formato.mina.id, formato.tipoInspeccion, JSON.stringify(formato.secciones)]).then(function(res) {
            console.log("FORMATO REGISTRADO : " + JSON.stringify(res));
          }, function (err) {
            console.error("error furs: " + JSON.stringify(err));
          });
        }

        if (data.equipos.length > 0){
          for (var i = 0; i < data.equipos.length; i++) {
            var equipo = data.equipos[i];
            var query = "INSERT INTO equipos (id, nombre, superintendencia_id, modelo_id) VALUES (?,?,?,?)";
            $cordovaSQLite.execute(db, query, [equipo.id, equipo.nombre, equipo.superintendencia.id, equipo.modelo.id]).then(function(res) {
                console.log("FORMATO REGISTRADO : " + JSON.stringify(res));
            }, function (err) {
                console.error("error equipos: " + JSON.stringify(err));
            });
            if (i == data.equipos.length-1){
              ocultarDialogo();
              showToast("Se ha descargado la data inicial exitosamente");
            }
          }
        }else{
          ocultarDialogo();
          showToast("Se ha descargado la data inicial exitosamente");
        }

        //ocultarDialogo();
      });

    } else {
      showToast("Necesita conexión a internet para poder descargar");
    }

  };

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
})
