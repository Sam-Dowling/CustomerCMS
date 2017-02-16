angular.module('exchange_cms', ['ngRoute', 'ngResource'])

    .factory('ExchangeCMS', function($resource) {
        var ExchangeCMS = $resource(':protocol//:server/:db/:a/:b/:c/:d', {
            protocol: 'http:',
            server: 'localhost:5984',
            db: 'exchange_cms'
        }, {
            update: {
                method: 'PUT'
            }
        });

        ExchangeCMS.prototype.update = function(cb) {
            return ExchangeCMS.update({
                a: this._id
            }, this, cb);
        };

        ExchangeCMS.prototype.destroy = function(cb) {
            return ExchangeCMS.remove({
                a: this._id,
                rev: this._rev
            }, cb);
        };

        return ExchangeCMS;
    })

    .config(function($routeProvider) {
        $routeProvider
            .when('/', {
                controller: 'ListCtrl',
                templateUrl: 'list.html'
            })
            .when('/customer/new', {
                controller: 'CreateCtrl',
                templateUrl: 'editCustomer.html'
            })
            .when('/customer/edit/:customerID', {
                controller: 'UpdateCtrl',
                templateUrl: 'editCustomer.html'
            })
            .when('/customer/view/:customerID', {
                controller: 'UpdateCtrl',
                templateUrl: 'customer.html'
            })
            .when('/transaction/new/:customerID', {
                controller: 'CreateTransactionCtrl',
                templateUrl: 'transaction.html'
            })
            .when('/transaction/view/:transactionID', {
                controller: 'UpdateCtrl',
                templateUrl: 'transaction.html'
            })
            .otherwise({
                redirectTo: '/'
            });
    })

    .config(['$locationProvider', function($locationProvider) {
        $locationProvider.hashPrefix('');
    }])

    .controller('ListCtrl', function($scope, ExchangeCMS) {
        $scope.exchange_cms = ExchangeCMS.get({
            a: '_design',
            b: 'customers',
            c: '_view',
            d: 'all',
            include_docs: 'true'
        });
    })

    .controller('CreateTransactionCtrl', function($scope, $location, ExchangeCMS) {
        $scope.inputs = [];
        $scope.addfield = function() {
            $scope.inputs.push({})
        }
        $scope.save = function() {
            $scope.exchange_cms.account_number = $scope.next_customer_id.rows[0].value + 1;
            $scope.exchange_cms.account_start = new Date();
            $scope.exchange_cms.transactions = [];
            ExchangeCMS.save($scope.exchange_cms, function(exchange_cms) {
                $location.path('/');
            });
        }
    })

    .controller('CreateCtrl', function($scope, $location, ExchangeCMS) {
        $scope.next_customer_id = ExchangeCMS.get({
            a: '_design',
            b: 'customers',
            c: '_view',
            d: 'nextCustomerID',
            reduce: 'true'
        });

        $scope.save = function() {
            $scope.exchange_cms.account_number = $scope.next_customer_id.rows[0].value + 1;
            $scope.exchange_cms.account_start = new Date();
            $scope.exchange_cms.transactions = [];
            ExchangeCMS.save($scope.exchange_cms, function(exchange_cms) {
                $location.path('/');
            });
        }
    })

    .controller('UpdateCtrl', function($scope, $location, $routeParams, ExchangeCMS) {
        var self = this;

        ExchangeCMS.get({
            a: $routeParams.customerID
        }, function(exchange_cms) {
            self.original = exchange_cms;
            $scope.exchange_cms = new ExchangeCMS(self.original);
        });

        $scope.destroy = function() {
            self.original.destroy(function() {
                $location.path('/');
            });
        };

        $scope.save = function() {
            $scope.exchange_cms.update(function() {
                $location.path('/customer/view/' + $scope.exchange_cms._id);
            });
        };
    });
