angular.module('starter').factory('CategoriaSqlite', function ($http, myConfig, $cordovaSQLite) {

    var categoriaSqlite = {}

    categoriaSqlite.insert = function (data, callback) {
      var db = $cordovaSQLite.openDB({ name: "sigeslub.db", iosDatabaseLocation:'default'});
      var query = "INSERT INTO categorias (id, nombre) VALUES (?,?)";
      $cordovaSQLite.execute(db, query, [data.id, data.nombre]).then(function(res) {
          console.log("INSERT ID -> " + res);
          db.close();
          callback({"result": "registro-exitoso"});
      }, function (err) {
          console.error(err);
          db.close();
          callback({"result": "registro-fallido"});
      });
    }

    categoriaSqlite.select = function(callback) {
      var db = $cordovaSQLite.openDB({ name: "sigeslub.db", iosDatabaseLocation:'default'});
      var query = "SELECT id, nombre FROM categorias";
      $cordovaSQLite.execute(db, query, []).then(function(res) {
        console.log(res);
        db.close();
        callback(res);
      }, function (err) {
        console.error(err);
        db.close();
        callback({"data": "Errorrr"});
      });
    }
    return categoriaSqlite;
});
