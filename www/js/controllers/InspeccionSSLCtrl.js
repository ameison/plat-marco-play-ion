starter.controller('InspeccionSSLCtrl', function($scope, $rootScope, $http, myConfig, localStorageService, $ionicModal,
  $cordovaSQLite, $location, $state, InspeccionFactory, $cordovaToast, $cordovaNetwork, $ionicPlatform, $cordovaDialogs) {

  var conexion;
  $scope.inspecciones = [];
  $scope.historialInspecciones = [];
  $scope.inspectorId =  localStorageService.get("id");
  $scope.minaId =  localStorageService.get("mina_id");
  console.log("Inspector id : ", $scope.inspectorId);

  $ionicPlatform.ready(function () {

    $scope.irCorrectivo = function(){
      $state.go('app.mantenimiento-correctivo');
    }

    if(window.Connection) {
      if(navigator.connection.type == Connection.NONE) {
        conexion = false;
      } else {
        conexion = true;
      }
    }

    document.addEventListener("deviceready", function () {
      $rootScope.$on('$cordovaNetwork:online', function(event, networkState){
        conexion = true;
        $scope.showToast("Conectado a internet");
      })
      $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
        conexion = false;
        $scope.showToast("Desconectado a internet");
      })

    }, false);

    $scope.listarCombos = function(){

      var queryCat = "SELECT id, nombre FROM categorias";
      var queryMin = "SELECT id, nombre FROM minas where id = ?";

      $cordovaSQLite.execute(db, queryCat, []).then(function(res) {
        $scope.categorias = [];
        for (var i = 0; i < res.rows.length; i++) {
          $scope.categorias.push({"id": res.rows.item(i).id, "nombre": res.rows.item(i).nombre})
        }
        $scope.data.categoria = $scope.categorias[0].id;
        //$scope.obtenerModelosXCategoria($scope.data.categoria);
      }, function (err) {
        console.error(err);
      });

      $cordovaSQLite.execute(db, queryMin, [$scope.minaId]).then(function(res) {
        $scope.minas = [];
        for (var i = 0; i < res.rows.length; i++) {
          $scope.minas.push({"id": res.rows.item(i).id, "nombre": res.rows.item(i).nombre})
        }
        $scope.data.mina = $scope.minas[0].id;
        $scope.obtenerSuperintendenciasXMina($scope.data.mina);
      }, function (err) {
        console.error(err);
      });

    };

    $scope.obtenerSuperintendenciasXMina = function(minaId){
      var querySup = "SELECT id, nombre, mina_id FROM superintendencias WHERE mina_id = ?";
      $cordovaSQLite.execute(db, querySup, [minaId]).then(function(res) {
        $scope.superintendencias = [];
        for (var i = 0; i < res.rows.length; i++) {
          $scope.superintendencias.push({"id": res.rows.item(i).id, "nombre": res.rows.item(i).nombre})
        }
        if ($scope.superintendencias.length > 0){
          $scope.data.superintendencia = $scope.superintendencias[0].id;

          $scope.obtenerModelosXCategoria($scope.data.categoria, $scope.data.superintendencia);
        }else{
          console.log("No hay superintendencias para esta mina");
        }
      }, function (err) {
        console.error(err);
      });
    }

    $scope.obtenerModelosXCategoria = function(categoriaId, superintendencia_id){
      $scope.modelos = [];
      var queryMod = "SELECT id, nombre, categoria_id FROM modelos WHERE categoria_id = ? and id in (select DISTINCT modelo_id from equipos where superintendencia_id = ?)";
      $cordovaSQLite.execute(db, queryMod, [categoriaId, superintendencia_id]).then(function(res) {

        for (var i = 0; i < res.rows.length; i++) {
          $scope.modelos.push({"id": res.rows.item(i).id, "nombre": res.rows.item(i).nombre})
        }
        if ($scope.modelos.length > 0) {
          $scope.data.modelo = $scope.modelos[0].id;
          $scope.obtenerFormatosXModeloYMina();
        }else{
          console.log("No hay modelos para esta categoria");
        }
      }, function (err) {
        console.error(err);
      });
    }

    $scope.obtenerFormatosXModeloYMina = function(){
      console.log("obtenerFormatosXModeloYMina");
      console.log("parametros : ", $scope.data.modelo + " - " + $scope.data.mina);
      $scope.furs = [];
      var queryFur = "SELECT id, nombre, contenido, modelo_id, mina_id FROM furs WHERE modelo_id = ? and mina_id = ? and tipo_inspeccion = ?";
      $cordovaSQLite.execute(db, queryFur, [$scope.data.modelo, $scope.data.mina, myConfig.tipoInspeccion[0].id]).then(function(res) {

        for (var i = 0; i < res.rows.length; i++) {
          $scope.furs.push({
            "id": res.rows.item(i).id,
            "nombre": res.rows.item(i).nombre,
            "contenido": res.rows.item(i).contenido
          })
          console.log("*** TIPO DE INSPECCION ****" + res.rows.item(i).tipo_inspeccion);
        }
        if ($scope.furs.length > 0) {
          $scope.data.fur = $scope.furs[0];
        }else{
          console.log("No hay furs para este modelo");
        }
      }, function (err) {
        console.error(JSON.stringify(err));
      });
    }

    $scope.data = {
      categoria: undefined,
      mina: undefined,
      superintendencia: undefined,
      modelos: undefined,
      fur: undefined
    }

    $ionicModal.fromTemplateUrl('templates/dialog-nueva-inspeccion.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;
    });

    $scope.closeNew = function(){
      $scope.modal.hide();
    }

    $scope.openNew = function(){
      $scope.listarCombos();
      $scope.modal.show();
    }

    $scope.nuevaInspeccion = function(){

      if ($scope.data.mina != undefined && $scope.data.superintendencia != undefined
        && $scope.data.categoria != undefined && $scope.data.modelo != undefined && $scope.data.fur != undefined){

        var contenido = $scope.data.fur.contenido;
        var nuevo = {
          "estado": myConfig.estadoInspeccion[0].id,
          "tipo": myConfig.tipoInspeccion[0].id,
          "fur_id": $scope.data.fur.id,
          "superintendencia_id": $scope.data.superintendencia,
          "modelo_id": $scope.data.modelo,
          "contenido": JSON.parse(contenido),
          "prioridad": myConfig.prioridadInspeccion[1].id,
          "servidor_id": 0,
          "orden_trabajo": '',
          "horometro": 0,
          "resumen_actividad": 'Inspección SCL',
          "aprobado_soporte": 0,
          "compartido": 0,
          "sincronizado": 0,
          "responsable_id": localStorageService.get("id"),
          "responsable_nombres": localStorageService.get("nombres")
        }

        var query = "INSERT INTO inspecciones (estado, tipo, fur_id, superintendencia_id, modelo_id, contenido, prioridad, servidor_id, orden_trabajo, horometro, resumen_actividad, aprobado_soporte, compartido, sincronizado, responsable_id, responsable_nombres) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
        $cordovaSQLite.execute(db, query, [nuevo.estado, nuevo.tipo, nuevo.fur_id, nuevo.superintendencia_id, nuevo.modelo_id,
          JSON.stringify(nuevo.contenido), nuevo.prioridad, nuevo.servidor_id, nuevo.orden_trabajo, nuevo.horometro,
          nuevo.resumen_actividad, nuevo.aprobado_soporte, nuevo.compartido, nuevo.sincronizado, nuevo.responsable_id, nuevo.responsable_nombres]).then(function(res) {
          $scope.listarInspeccionesSCL();
        }, function (err) {
          console.error(JSON.stringify(err));
        });

        $scope.modal.hide();

      }else{
        $scope.showToast("Todos los campos son obligatorios.");
      }
    }

    $scope.listarInspeccionesSCL = function(){
      try {
        console.log("Listado de inspecciones pendientes y observadas");
        var queryFur = "SELECT ins.id, ins.estado, ins.tipo, ins.superintendencia_id, ins.equipo_id, ins.servidor_id, ins.compartido, ins.sincronizado, ins.responsable_id, ins.resumen_actividad, fecha_creacion, ins.responsable_nombres, spi.nombre as sup_nombre, mis.nombre as min_nombre, eq.nombre as eq_nombre FROM inspecciones as ins LEFT JOIN superintendencias as spi ON ins.superintendencia_id = spi.id LEFT JOIN minas as mis ON spi.mina_id = mis.id LEFT JOIN equipos as eq ON eq.id = ins.equipo_id WHERE ins.tipo = ? and ins.estado in (?,?)";
        $cordovaSQLite.execute(db, queryFur, [myConfig.tipoInspeccion[0].id, myConfig.estadoInspeccion[0].id, myConfig.estadoInspeccion[1].id]).then(function(res) {
          $scope.inspecciones = [];
          for (var i = 0; i < res.rows.length; i++) {
            $scope.inspecciones.push({
              "id": res.rows.item(i).id,
              "estado": res.rows.item(i).estado,
              "tipo": res.rows.item(i).tipo,
              "fur_id": res.rows.item(i).fur_id,
              "superintendencia_id": res.rows.item(i).superintendencia_id,
              "modelo_id": res.rows.item(i).modelo_id,
              "sincronizado": res.rows.item(i).sincronizado,
              "compartido": res.rows.item(i).compartido,
              "servidor_id": res.rows.item(i).servidor_id,
              "responsable_id": res.rows.item(i).responsable_id,
              "responsable_nombres": res.rows.item(i).responsable_nombres,
              "sup_nombre": res.rows.item(i).sup_nombre,
              "min_nombre": res.rows.item(i).min_nombre,
              "eq_nombre": res.rows.item(i).eq_nombre,
              "equipo_id": res.rows.item(i).equipo_id,
              "fecha_creacion": res.rows.item(i).fecha_creacion,
              "resumen_actividad": res.rows.item(i).resumen_actividad
            });
          }
          console.log("INSPECCIONES SCL", JSON.stringify($scope.inspecciones));
        }, function (err) {
          console.error(JSON.stringify(err));
        });
      } catch (err) {
        console.error(JSON.stringify(err));
      }
    }

    $scope.listarInspeccionesSCLHistorico = function(){
      try {
        console.log("Listado historial de inspecciones");
        var queryFur = "SELECT ins.id, ins.estado, ins.tipo, ins.superintendencia_id, ins.equipo_id, ins.servidor_id, ins.compartido, ins.sincronizado, ins.responsable_id, ins.responsable_nombres, spi.nombre as sup_nombre, mis.nombre as min_nombre FROM inspecciones as ins LEFT JOIN superintendencias as spi ON ins.superintendencia_id = spi.id LEFT JOIN minas as mis ON spi.mina_id = mis.id WHERE ins.tipo = ? and ins.estado = ?";
        $cordovaSQLite.execute(db, queryFur, [myConfig.tipoInspeccion[0].id, myConfig.estadoInspeccion[2].id]).then(function(res) {
          $scope.inspeccionesHistorico = [];
          for (var i = 0; i < res.rows.length; i++) {
            $scope.inspeccionesHistorico.push({
              "id": res.rows.item(i).id,
              "estado": res.rows.item(i).estado,
              "tipo": res.rows.item(i).tipo,
              "fur_id": res.rows.item(i).fur_id,
              "superintendencia_id": res.rows.item(i).superintendencia_id,
              "modelo_id": res.rows.item(i).modelo_id,
              "sincronizado": res.rows.item(i).sincronizado,
              "compartido": res.rows.item(i).compartido,
              "servidor_id": res.rows.item(i).servidor_id,
              "responsable_id": res.rows.item(i).responsable_id,
              "responsable_nombres": res.rows.item(i).responsable_nombres,
              "sup_nombre": res.rows.item(i).sup_nombre,
              "min_nombre": res.rows.item(i).min_nombre
            });
          }
        }, function (err) {
          console.error(JSON.stringify(err));
        });
      } catch (err) {
        console.error(JSON.stringify(err));
      }
    }

    $scope.descargarInspeccionesSCL = function(){
      if (conexion) {
        var queryExIns = "SELECT id FROM inspecciones where sincronizado = ?";
        $cordovaSQLite.execute(db, queryExIns, [0]).then(function(res) {
          if (res.rows.length > 0){
            $scope.showToast("Para descargar las inspecciones no debes tener inspecciones pendientes de sincronización");
          }else{
            showProgress("Descargando inspecciones...");
            InspeccionFactory.descargarSincInspecciones(function(data){
              var queryDel = "DELETE FROM inspecciones";
              $cordovaSQLite.execute(db, queryDel, []).then(function(res) {
                $scope.inspecciones = [];
                $scope.inspeccionesHistorico = [];
                for (var i = 0; i < data.length; i++) {
                  var inspeccion = data[i].inspeccion;
                  var nuevo = {
                    "estado": inspeccion.estado,
                    "tipo": inspeccion.tipo,
                    "fur_id": inspeccion.furId,
                    "equipo_id": inspeccion.equipo.id,
                    "superintendencia_id": inspeccion.equipo.superintendencia.id,
                    "modelo_id": inspeccion.equipo.modelo.id,
                    "contenido": inspeccion.hi[0] != undefined ? inspeccion.hi[0].contenido.data : "",
                    "prioridad": inspeccion.prioridad,
                    "servidor_id": inspeccion.id,
                    "orden_trabajo": inspeccion.ordenTrabajo,
                    "horometro": inspeccion.horometro,
                    "resumen_actividad": inspeccion.resumenActividad,
                    "aprobado_soporte": inspeccion.aprobadoSoporte ? 1 : 0,
                    "compartido": inspeccion.compartido ? 1 : 0,
                    "sincronizado": 1,
                    "responsable_id": inspeccion.responsable.id,
                    "responsable_nombres": inspeccion.responsable.nombres + ' ' + inspeccion.responsable.apellidos,
                    "fecha_creacion": inspeccion.fechaCreacion,
                    "observaciones": inspeccion.observaciones
                  }
                  var query = "INSERT INTO inspecciones (estado, tipo, fur_id, superintendencia_id, modelo_id, contenido, prioridad, servidor_id, orden_trabajo, horometro, resumen_actividad, aprobado_soporte, compartido, sincronizado, responsable_id, responsable_nombres, equipo_id, fecha_creacion, observaciones) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
                  $cordovaSQLite.execute(db, query, [nuevo.estado, nuevo.tipo, nuevo.fur_id, nuevo.superintendencia_id, nuevo.modelo_id,
                    JSON.stringify(nuevo.contenido), nuevo.prioridad, nuevo.servidor_id, nuevo.orden_trabajo, nuevo.horometro,
                    nuevo.resumen_actividad, nuevo.aprobado_soporte, nuevo.compartido, nuevo.sincronizado, nuevo.responsable_id,
                    nuevo.responsable_nombres, nuevo.equipo_id, nuevo.fecha_creacion, nuevo.observaciones]).then(function(res) {

                    $scope.listarInspeccionesSCL();
                    $scope.listarInspeccionesSCLHistorico();

                  }, function (err) {
                    console.error(JSON.stringify(err));
                  });
                }
                hideProgress();
                $scope.showToast("Se realizo la descarga de inspecciones correctamente");
              }, function (err) {
                  console.error(JSON.stringify(err));
                  hideProgress();
              });
            });
          }
        }, function (err) {
          $scope.showToast("Ocurrio un error, comuniquese con el administrador del sistema");
        });
      } else {
        $scope.showToast("Necesita conexión a internet para poder descargar");
      }
    }

    $scope.abrirInspeccion = function(inspeccionId){
      var params = {
        "inspeccionId": inspeccionId
      }
      $state.go('app.formato', params, {'params': params});
    }

    function existeDataXSincronizar(){
      var queryExIns = "SELECT id FROM inspecciones where sincronizado = ?";
      $cordovaSQLite.execute(db, queryExIns, [0]).then(function(res) {
        if (res.rows.length > 0){
          $scope.showToast("Para descargar las inspecciones no debes tener inspecciones pendientes de sincronización");
          return false;
        }else{
          return true;
        }
      }, function (err) {
        $scope.showToast("Ocurrio un error, comuniquese con el administrador");
        return false;
      });
    }

    $scope.sincronizarInspeccion = function(inspeccionId){
      showProgress("Enviando inspección");
      var inspeccion = undefined
      var query = "SELECT id, equipo_id, tipo, superintendencia_id, modelo_id, contenido, prioridad, resumen_actividad, orden_trabajo, horometro, fur_id, compartido, responsable_id, servidor_id FROM inspecciones where id = ?";
      $cordovaSQLite.execute(db, query, [inspeccionId]).then(function(res) {
        for (var i = 0; i < res.rows.length; i++) {
          inspeccion = {
            "contenido": JSON.parse(res.rows.item(i).contenido),
            "equipo": res.rows.item(i).equipo_id == null ? 0: res.rows.item(i).equipo_id,
            "tipo": res.rows.item(i).tipo,
            "prioridad": res.rows.item(i).prioridad,
            "resumen_actividad": res.rows.item(i).resumen_actividad,
            "orden_trabajo": res.rows.item(i).orden_trabajo,
            "horometro": res.rows.item(i).horometro,
            "fur": res.rows.item(i).fur_id,
            "compartido": res.rows.item(i).compartido,
            "responsable_id": res.rows.item(i).responsable_id,
            "servidor_id": res.rows.item(i).servidor_id
          }
          break;
        }

        if (inspeccion != undefined){
          var data = {
            "tipo": myConfig.tipoInspeccion[0].id,
            "equipo": {"id": inspeccion.equipo},
            "ordenTrabajo": inspeccion.orden_trabajo,
            "prioridad": inspeccion.prioridad,
            "resumenActividad": inspeccion.resumen_actividad,
            "compartido": inspeccion.compartido == 1 ? true : false,
            "horometro": inspeccion.horometro,
            "furId": inspeccion.fur,
            "hi": [
              {
                "contenido": {"data": inspeccion.contenido},
                "estado": myConfig.historialInspeccion[0].id
              }
            ]
          }

          if (data.equipo.id > 0){
            console.log("hay equipo");
            console.log("servidor_id", inspeccion.servidor_id);
            if (inspeccion.servidor_id != undefined && inspeccion.servidor_id > 0){
              data.id = inspeccion.servidor_id
              console.log("Ya esta registrado");
              InspeccionFactory.sincActualizar(data, function (response){
                console.log("sincActualizar", response);
                if(response.respuesta == 'actualizacion-exitosa'){
                  $scope.actualizarInspeccion(inspeccionId);
                }else if(response.respuesta == 'faltan-datos'){
                  hideProgress();
                  $scope.showToast("Faltan datos para la sincronización");
                }
              });
            }else{
              console.log("Nuevo registro");
              InspeccionFactory.sincRegistrar(data, function (response){
                console.log("sincRegistrar", response);
                if(response.respuesta == undefined){
                  $scope.actualizarInspeccionNuevo(inspeccionId, response);
                }else if(response.respuesta == 'faltan-datos'){
                  hideProgress();
                  $scope.showToast("Faltan datos para la sincronización");
                }
              });
            }
          }else{
            hideProgress();
            $scope.showToast("No ha seleccionado un equipo para esta inspección");
          }
        }else {
          console.log("Inspeccion es nulo!!!!");
          hideProgress();
          $scope.showToast("Ocurrio un error al enviar la inspección");
        }
      }, function (err) {
        hideProgress();
        $scope.showToast("Ocurrio un error al enviar la inspección");
        console.error(JSON.stringify(err));
      });
    }

    $scope.actualizarInspeccion = function(inspeccionId){
      // 1 = true - 0 = false
      console.log("actualizarInspeccion");
      var query = "UPDATE inspecciones set sincronizado = ? WHERE id = ?";
      $cordovaSQLite.execute(db, query, [1, inspeccionId]).then(function(res) {
        console.log("FORMATO ACTUALIZADO : " + JSON.stringify(res));
        hideProgress();
        $scope.showToast("Inspección enviada correctamente");
        $scope.listarInspeccionesSCL();
      }, function (err) {
        hideProgress();
        console.error(err);
      });
    }

    $scope.actualizarInspeccionNuevo = function(inspeccionId, response){
      // 1 = true - 0 = false
      console.log("actualizarInspeccionNuevo");
      console.log("DATOS RESPONSE", JSON.stringify(response));
      var query = "UPDATE inspecciones set sincronizado = ?, servidor_id = ?, fecha_creacion = ? WHERE id = ?";
      $cordovaSQLite.execute(db, query, [1, response.servidor_id, response.fecha_creacion, inspeccionId]).then(function(res) {
        console.log("FORMATO ACTUALIZADO : " + JSON.stringify(res));
        hideProgress();
        $scope.showToast("Inspección enviada correctamente");
        $scope.listarInspeccionesSCL();
      }, function (err) {
        hideProgress();
        console.error(err);
      });
    }

    function showProgress(title){
      if(window.device){
        cordova.plugin.pDialog.init({
            theme : 'HOLO_DARK',
            progressStyle : 'SPINNER',
            cancelable : false,
            title : title,
            message : 'Espere por favor...'
        });
      }
    }

    function hideProgress(){
      if(window.device){
        cordova.plugin.pDialog.dismiss();
      }
    }

    $scope.showToast = function(message) {
      $cordovaToast.show(message, 'long', 'bottom').then(function(success) {
        console.log("Se mostro toast");
      }, function (error) {
        console.log("Error al mostrar toast " + error);
      });
    }

    $scope.listarInspeccionesSCL();
    $scope.listarInspeccionesSCLHistorico();

    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
      if (toState.name == 'app.inspeccion-ssl') {
        console.log("ENTRO POR app.inspeccion-ssl");
        $scope.listarInspeccionesSCL();
        $scope.listarInspeccionesSCLHistorico();
      }
    });

  });



})
