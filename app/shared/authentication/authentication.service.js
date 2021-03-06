var loginTemplate = require('../../components/login/login.dialog.jade');

angular.module('mongochem.services')
    .factory('mongochem.girder.User', function($resource) {
        return $resource('api/v1/user/me');
    })
    .factory('mongochem.girder.Session', function($resource) {
        return $resource('api/v1/token/session');
    })
    .factory('mongochem.girder.Item', function($resource) {
        return $resource('api/v1/item');
    })
    .config(function($httpProvider) {
                 $httpProvider.interceptors.push(function ($timeout, $q, $injector) {
                    var authService, $http, $state;

                    // Prevent `Uncaught Error: [$injector:cdep] Circular dependency found`
                    $timeout(function () {
                        authService = $injector.get('mongochem.AuthenticationService');
                        $http = $injector.get('$http');
                        $state = $injector.get('$state');
                    });

                     return {
                         responseError: function (rejection) {

                             if (rejection.status === 401) {
                                 authService.authenticate($state.current.url);
                             }

                             return $q.reject(rejection);
                         }
                     };
                 });
        })
    .service('mongochem.AuthenticationService', ['$q', '$mdDialog', '$cookies',
                                                 '$log', 'mongochem.girder.User',
                                                 'mongochem.girder.Session',
        function($q, $mdDialog, $cookies, $log, user, session) {

        this.isAuthenticated = function() {
            var deferred = $q.defer();

            user.get({}).$promise.then(
                    function(result) {
                        if (Object.keys(result.toJSON()).length === 0) {
                            deferred.resolve(false);
                        }
                        else {
                            deferred.resolve(true);
                        }
                    },
                    function(error) {
                        deferred.reject(error);
                    });

            return deferred.promise;
        };

        this.hasToken = function() {
            return $cookies.get('girderToken');
        };

        this.authenticate = function(redirectUrl, evt) {
            $mdDialog.show({
                locals: {
                    redirectUrl: redirectUrl
                },
                controller: 'mongochem.LoginDialogController',
                templateUrl: loginTemplate,
                targetEvent: evt,
                clickOutsideToClose: true
            });
        };

        this.invalidateToken = function() {
            var deferred = $q.defer();

            session.delete().$promise.then(function() {
                delete $cookies.girderToken;
                deferred.resolve();

            },
            function(error) {
                $log.error(error);
                deferred.reject(error);
            });

            return deferred.promise;
        };
    }]);
