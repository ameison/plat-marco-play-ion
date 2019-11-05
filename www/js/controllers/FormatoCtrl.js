starter.controller('FormatoCtrl', function($scope, $rootScope, $http, myConfig, $ionicSlideBoxDelegate,
  $cordovaSQLite, $stateParams, $ionicHistory, $cordovaToast, $ionicPlatform, $ionicScrollDelegate, $state, $cordovaCamera, $cordovaDialogs, $ionicModal, $ionicLoading, $interval, $ionicActionSheet) {

  $ionicPlatform.ready(function () {
    $scope.formato = undefined;

    $scope.undo = function(){
      console.log($scope.version);
      $scope.version--;
      console.log($scope.version);
    };

    if (myConfig.prioridadInspeccion != null) {
      $scope.prioridades = myConfig.prioridadInspeccion;
    }

    $scope.show = function() {
      $ionicLoading.show({
        template: 'Generando formato, espere por favor...'
      });
    };

    $scope.hide = function(){
      $ionicLoading.hide();
    };

    /*$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
      if (toState.name == 'app.formato') {
        $scope.show();
      }
    });*/

    //console.log($stateParams.inspeccionId);

    $scope.obtenerFormato = function(){

      //console.log("INSPECCION ID ::: ", $stateParams.inspeccionId);
      $scope.show();

      var query = "SELECT id, estado, equipo_id, tipo, superintendencia_id, modelo_id, contenido, prioridad, resumen_actividad, orden_trabajo, horometro, compartido, servidor_id, observaciones FROM inspecciones WHERE id = ? ";
      $cordovaSQLite.execute(db, query, [$stateParams.inspeccionId]).then(function(res) {
        for (var i = 0; i < res.rows.length; i++) {
          $scope.formato = {
            "id": res.rows.item(i).id,
            "contenido": JSON.parse(res.rows.item(i).contenido),
            "equipo": res.rows.item(i).equipo_id == null ? 0: res.rows.item(i).equipo_id,
            "tipo": res.rows.item(i).tipo,
            "superintendencia": res.rows.item(i).superintendencia_id,
            "modelo": res.rows.item(i).modelo_id,
            "prioridad": res.rows.item(i).prioridad,
            "resumen_actividad": res.rows.item(i).resumen_actividad,
            "orden_trabajo": res.rows.item(i).orden_trabajo,
            "horometro": res.rows.item(i).horometro,
            "compartido": res.rows.item(i).compartido == 1 ? true : false,
            "servidor_id": res.rows.item(i).servidor_id,
            "observaciones": res.rows.item(i).observaciones,
            "estado": res.rows.item(i).estado
          }

          $scope.listarEquipos($scope.formato.superintendencia, $scope.formato.modelo, $scope.formato.equipo);
          $ionicSlideBoxDelegate.slide(0);
          $ionicSlideBoxDelegate.enableSlide(false);
          $ionicSlideBoxDelegate.update();

          break;
        }
        $scope.hide();
        /*if ($scope.formato == undefined){
          console.log("No se encontro un formato!!!");
          $scope.hide();
        }*/
      }, function (err) {
        console.error(JSON.stringify(err));
      });
    }

    $scope.eliminarInspeccion = function(inspeccion){
      if (inspeccion.servidor_id == 0){
        $cordovaDialogs.confirm('¿Seguro que deseas eliminar esta inspección?', 'MENSAJE', ['Cancelar','Aceptar'])
          .then(function(buttonIndex) {
          switch (buttonIndex) {
            case 2:
              var query = "DELETE FROM inspecciones WHERE id = ?";
              $cordovaSQLite.execute(db, query, [inspeccion.id]).then(function(res) {
                console.log("FORMATO ACTUALIZADO : " + JSON.stringify(res));
                $scope.showToast("Inspección eliminada correctamente.");
                $ionicHistory.goBack();
              }, function (err) {
                console.error(JSON.stringify(err));
                $scope.showToast("No se pudo eliminar esta inspección");
              });
              break;
          }
        });
        $cordovaDialogs.beep(1);
      }else{
        $scope.showToast("No se puede eliminar una inspección sincronizada.");
      }
    }

    $scope.listarEquipos = function(superintendenciaId, modeloId, equipoId){
      var query = "SELECT id, nombre FROM equipos WHERE superintendencia_id = ? and modelo_id = ?";
      $scope.equipos = [];
      $cordovaSQLite.execute(db, query, [superintendenciaId, modeloId]).then(function(res) {
        for (var i = 0; i < res.rows.length; i++) {
          var equipo = {
            "id": res.rows.item(i).id,
            "nombre": res.rows.item(i).nombre
          }
          $scope.equipos.push(equipo);
        }
        console.log("Equipos", JSON.stringify($scope.equipos));
        if (equipoId == 0) {
          $scope.formato.equipo = $scope.equipos[0].id;
        }
      }, function (err) {
        console.error(JSON.stringify(err));
      });
    }

    $scope.obtenerFormato();

    $scope.actualizarInspeccion = function(){
      var query = "UPDATE inspecciones set contenido = ?, equipo_id = ?, prioridad = ?, resumen_actividad = ?, orden_trabajo = ?, horometro = ?, sincronizado = ?, compartido = ?, observaciones = ? WHERE id = ?";
      var contenido = JSON.stringify(JSON.parse(angular.toJson($scope.formato.contenido)));
      var compartido = $scope.formato.compartido ? 1 : 0;
      $cordovaSQLite.execute(db, query, [contenido, $scope.formato.equipo, $scope.formato.prioridad,
        $scope.formato.resumen_actividad, $scope.formato.orden_trabajo, parseInt($scope.formato.horometro), 0, compartido, $scope.formato.observaciones, $scope.formato.id]).then(function(res) {
        console.log("FORMATO ACTUALIZADO : " + JSON.stringify(res));
      }, function (err) {
          console.error(err);
      });
    }

    $scope.slideHasChanged = function(pos){
      console.log("Cambiando de pagina");
    }

    $scope.numPagina = 0;
    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
      $scope.numPagina = 0;
    });

    $scope.next = function(){
      console.log("AVANZANDO PAGINA");
      if ($scope.formato.equipo != undefined && $scope.formato.prioridad != undefined
        && $scope.numPagina < $scope.formato.contenido.length && $scope.formato.orden_trabajo != undefined
        && $scope.formato.orden_trabajo != '' && $scope.formato.resumen_actividad != undefined
        && $scope.formato.resumen_actividad != ''){
          $scope.numPagina = $scope.numPagina + 1;
          var indice = $ionicSlideBoxDelegate.currentIndex();
          $scope.actualizarInspeccion();
          $ionicSlideBoxDelegate.next();
          $scope.showToast("Inspección actualizada");
      }else{
        $scope.showToast("Faltan llenar campos o estas en la ultima página de la inspección");
      }
    }

    $scope.previous = function(){
      console.log("RETROCEDIENDO PAGINA");
      if ($scope.numPagina > 0){
        $scope.numPagina = $scope.numPagina - 1;
        $scope.actualizarInspeccion();
        $ionicSlideBoxDelegate.previous();
        $scope.showToast("Inspección actualizada");
      }else{
        $scope.showToast("Estas en la primera pagína");
      }
    }

    $scope.finalizar = function(){
      $cordovaDialogs.confirm('¿Seguro que deseas finalizar la inspección?', 'MENSAJE', ['Cancelar','Aceptar'])
        .then(function(index){
          switch (index) {
            case 2:
              $scope.actualizarInspeccion();
              $ionicSlideBoxDelegate.slide(0);
              $scope.showToast("Inspección actualizada");
              $ionicHistory.goBack();
              break;
            default:
          }
        })
    }

    $scope.mostrarAcciones = function(index) {
      $ionicActionSheet.show({
        titleText: 'Elegir una acción',
        buttons: [
          { text: '<i class="icon ion-ios-camera"></i> Tomar foto' },
          { text: '<i class="icon ion-images"></i> Seleccionar imagen de galería' }
        ],
        buttonClicked: function(idx) {
          idx === 0 ? $scope.takePicture(index) : $scope.imagenGaleria(index);
          return true;
        }
      });
    };

    /*TOMA DE FOTOS*/
    $scope.takePicture = function(index) {
      console.log("Indice de seccion", index);
      var options = {
          quality : 100,
          destinationType : Camera.DestinationType.DATA_URL,
          sourceType : Camera.PictureSourceType.CAMERA,
          allowEdit : false,
          encodingType: Camera.EncodingType.JPEG,
          targetWidth: 630,
          targetHeight: 434,
          popoverOptions: CameraPopoverOptions,
          saveToPhotoAlbum: false
      };

      $cordovaCamera.getPicture(options).then(function(imageData) {
          var data = {
            "src": "data:image/jpeg;base64," + imageData,
            "sub": ""
          }
          $scope.formato.contenido[index].contenido.data.pictures.push(data);
          $scope.showToast("Imagen agregada");
      }, function(err) {
        console.log(err);
      });

    }

    $scope.imagenGaleria = function(index) {
      var options = {
        quality: 100,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
        allowEdit: false,
        encodingType: Camera.EncodingType.JPEG,
        targetWidth: 630,
        targetHeight: 434,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false
      };

      $cordovaCamera.getPicture(options).then(function(imageData) {
        var data = {
          "src": "data:image/jpeg;base64," + imageData,
          "sub": ""
        }
        $scope.formato.contenido[index].contenido.data.pictures.push(data);
        $scope.showToast("Imagen agregada");
      }, function(err) {
        // error
        console.log('error ' + err);
      });
    };

    $scope.scrollTop = function () {
      $ionicScrollDelegate.scrollTop();
    }

    var canvas;
    $scope.showImages = function(img, parent, index) {
      canvas = undefined;
      $scope.prt = parent;
      $scope.idx = index;
      $scope.img = img;
      $scope.showModal('templates/dialog-imagen-captura.html');
      $interval( function(){
        $scope.load();
      }, 500, true);
    };


    $scope.showModal = function(templateUrl) {
      $ionicModal.fromTemplateUrl(templateUrl, {
        scope: $scope,
        animation: 'slide-in-up',
        backdropClickToClose: false,
        hardwareBackButtonClose: false
      }).then(function(modal) {
        $scope.modal = modal;
        $scope.modal.show();
      });
    }

    $scope.closeModal = function() {
      $scope.modal.hide();
      $scope.modal.remove()
    };

    $scope.verImagenAyuda = function(index){
      $scope.imagenAyuda = $scope.formato.contenido[index - 1].imagenAyuda;
      $scope.showModal('templates/dialog-imagen-ayuda.html');
      //$scope.modal.show();
    }

    // $ionicModal.fromTemplateUrl('templates/dialog-imagen-ayuda.html', {
    //   scope: $scope
    // }).then(function(modal) {
    //   $scope.modal = modal;
    // });

    $scope.eliminarFoto = function(seccionIndex, fotoIndex){
      $cordovaDialogs.confirm('¿Seguro que deseas eliminar la foto?', 'MENSAJE', ['Cancelar','Aceptar'])
        .then(function(index){
          switch (index) {
            case 2:
              $scope.formato.contenido[seccionIndex].contenido.data.pictures.splice(fotoIndex, 1)
              $scope.showToast("Imagen eliminada");
              break;
            default:
          }
        })
    }

    $scope.showToast = function(message) {
      $cordovaToast.show(message, 'long', 'bottom').then(function(success) {
        console.log("Se mostro toast");
      }, function (error) {
        console.log("Error al mostrar toast " + error);
      });
    }

    // the last coordinates before the current move
    var canv;
    var ctx
    var lastX;
    var lastY;
    var currentX;
    var currentY;
    var img;

    $scope.load = function () {
      canv = document.getElementById('index' + $scope.idx);

      img = new Image();
      img.src = $scope.img.src;
      img.onload = function(){
        // Img
        //ctx.drawImage(img, 0, 0, 702, 487);
        ctx.drawImage(img, 0, 0, 630, 434);
      }

      ctx = canv.getContext("2d");
      //canv.width = 702;
    	//canv.height = 487;
      canv.width = 630;
    	canv.height = 434;
    }

    $scope.gestureEvent = function(event)  {
      // variable that decides if something should be drawn on mousemove

      if(event.type == 'touch'){
        // Evento para hacer los puntos
        //lastX = event.gesture.center.pageX - 150;
        //lastY = event.gesture.center.pageY - 30;
        lastX = event.gesture.center.pageX - 150;
        lastY = event.gesture.center.pageY - 95;

        dibujar(lastX, lastY, lastX - 5, lastY - 2);
      }

      if(event.type == 'drag'){
        // Evento para hacer el dibujo
        //currentX = event.gesture.center.pageX - 150;
        //currentY = event.gesture.center.pageY - 30;
        currentX = event.gesture.center.pageX - 150;
        currentY = event.gesture.center.pageY - 95;

        dibujar(lastX, lastY, currentX, currentY);
        // set current coordinates to last one
        lastX = currentX;
        lastY = currentY;
      }
    }


    function dibujar(lX, lY, cX, cY){
      // Comienzo
      ctx.beginPath();
      // line from
      ctx.moveTo(lX,lY);
      // to
      ctx.lineTo(cX,cY);
      // Join
      ctx.lineJoin = "round";
      // color
      ctx.strokeStyle = "#ff0000";
      // width
      ctx.lineWidth = 4;
      // draw it
      ctx.stroke();
      // Fin
      ctx.closePath();
    }

    // canvas reset
    $scope.limpiar = function(){
      canv.width = canv.width;
      canv.height = canv.height;
      $scope.load();
    }

    $scope.guardar = function(parent, index, img){
      $scope.formato.contenido[parent].contenido.data.pictures[index].src = canv.toDataURL("image/png");
      $scope.formato.contenido[parent].contenido.data.pictures[index].sub = img.sub;
      $scope.closeModal();
      $scope.showToast("Imagen modificada");
    }
  })

}).directive('drawing', function($ionicGesture) {
  return {
    restrict :  'A',

    link : function(scope, elem, attrs) {

      $ionicGesture.on('touch', scope.gestureEvent, elem);

      $ionicGesture.on('drag', scope.gestureEvent, elem);

      $ionicGesture.on('release', scope.gestureEvent, elem);

    }
  }
})
