starter.controller('LoginCtrl', function($scope, $ionicModal, $auth, $timeout, $http, myConfig,
  localStorageService, $ionicHistory, $state, $cordovaToast) {


  if ($auth.isAuthenticated()) {
    console.log("Existe Autenticación, redirecciona a menu");
    $ionicHistory.nextViewOptions({
        disableBack: true
    });
    $state.go('app.inspeccion-ssl', {}, { reload: true, location: 'replace'});
  }

  $scope.loginData = {};

  $scope.doLogin = function() {
    if ($scope.loginData.usuario != undefined && $scope.loginData.usuario != "" && $scope.loginData.clave != undefined && $scope.loginData.clave != ""){
      mostrarDialogo();

      $http.post(myConfig.apiUrl+'/login-movil', $scope.loginData).then(function (resultado) {
         console.log(JSON.stringify(resultado.data));
         if (resultado.data.respuesta == "login-exitoso"){
           $auth.setToken(resultado.data.token);
           localStorageService.set('token', resultado.data.token);
           localStorageService.set('id', resultado.data.usuario_id);
           localStorageService.set('correo', resultado.data.usuario_correo);
           localStorageService.set('telefono', resultado.data.usuario_telefono);
           localStorageService.set('mina_id', resultado.data.mina_id);
           localStorageService.set('nombres', resultado.data.usuario_nombres + ' ' + resultado.data.usuario_apellidos);
           $ionicHistory.nextViewOptions({
             disableBack: true
           });
           $scope.showToast("Bienvenido(a) " + resultado.data.usuario_nombres + ' ' + resultado.data.usuario_apellidos);
           $state.go('app.inspeccion-ssl', {}, { reload: true, location: 'replace'});
         }else if (resultado.data.respuesta == "error-interno"){
           $scope.showToast("Error interno, comuniquese con el proveedor");
         }else if (resultado.data.respuesta == "pass-no-coincide"){
           $scope.showToast("La clave ingresada es incorrecta");
         }else if (resultado.data.respuesta == "pass-nulo"){
           $scope.showToast("No has ingresado la clave");
         }else if (resultado.data.respuesta == "usuario-nulo"){
           $scope.showToast("No has ingresado el usuario");
         }else if (resultado.data.respuesta == "usuario-no-existe"){
           $scope.showToast("El usuario no esta registrado");
         }
         ocultarDialogo();
      }, function(data) {
         console.log("Error", JSON.stringify(data));
         $scope.showToast("Error interno, comuniquese con el proveedor");
         ocultarDialogo()
      });
    }else{
      $scope.showToast("Usuario y/o clave son obligatorios");
    }
  };

  function mostrarDialogo(){
    if(window.device){
      cordova.plugin.pDialog.init({
          theme : 'HOLO_DARK',
          progressStyle : 'SPINNER',
          cancelable : false,
          title : 'Iniciando sesión...',
          message : 'Espere por favor...'
      });
    }
  }

  function ocultarDialogo(){
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

})
