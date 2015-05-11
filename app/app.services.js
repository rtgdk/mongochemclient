require('angular-resource');
var mongochemServices = angular.module('mongochem.services', ['ngResource']);

mongochemServices.factory('mongochem.Molecule', ['$resource',
  function($resource){
    return $resource('api/v1/molecules/inchikey/:moleculeId', {}, {
      query: {method:'GET', params:{moleculeId:'molecules'}, isArray:true}
  });
}]);
