starter.controller('MainCtrl', function($scope, $window, $ionicHistory, $state, $ionicModal, $timeout, $http,
  myConfig, localStorageService, $auth, $cordovaDialogs, $cordovaSQLite) {

  $scope.usuario = {
      "nombres": localStorageService.get("nombres"),
      "correo": localStorageService.get("correo")
  }

  console.log("Datos del usuario", JSON.stringify($scope.usuario));

  $scope.cerrarSesion = function(){
    $cordovaDialogs.confirm('¿Seguro que deseas cerrar sesión?', 'MENSAJE', ['Cancelar','Aceptar'])
      .then(function(buttonIndex) {
      switch (buttonIndex) {
        case 2:
          //ACEPTA CERRAR SESION
          $window.localStorage.clear();
          $ionicHistory.clearCache();
          $ionicHistory.clearHistory();

          $auth.logout();
          $auth.removeToken();

          var queryIns = "DELETE FROM inspecciones";

          $cordovaSQLite.execute(db, "DELETE FROM categorias");
          $cordovaSQLite.execute(db, "DELETE FROM modelos");
          $cordovaSQLite.execute(db, "DELETE FROM minas");
          $cordovaSQLite.execute(db, "DELETE FROM superintendencias");
          $cordovaSQLite.execute(db, "DELETE FROM equipos");
          $cordovaSQLite.execute(db, "DELETE FROM furs");
          $cordovaSQLite.execute(db, queryIns, []).then(function(res) {
            console.log("Query" + JSON.stringify(res));
          }, function (err) {
            console.error("Error" + JSON.stringify(res));
          });

          $ionicHistory.nextViewOptions({
              disableBack: true
          });

          $state.go('login-usuario', {}, { reload: true, location: 'replace'});

          $window.location.reload();

          break;
        default:
      }

      var btnIndex = buttonIndex;
      console.log("indice boton : ", buttonIndex);

    });

    $cordovaDialogs.beep(1);

  }
})
