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
                controller: 'UpdateCustomerCtrl',
                templateUrl: 'customer.html'
            })
            .when('/transaction/new/:customerID', {
                controller: 'CreateTransactionCtrl',
                templateUrl: 'newTransaction.html'
            })
            .when('/transaction/view/:customerID/:transactionID', {
                controller: 'UpdateTransactionCtrl',
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

    .controller('CreateTransactionCtrl', function($scope, $location, $routeParams, ExchangeCMS) {
        var self = this;

        $scope.addNewItem = function() {
            var newItemNo = $scope.exchange_cms.transactions[$scope.transactionID].items.length;
            $scope.exchange_cms.transactions[$scope.transactionID].items.push({
                'id': newItemNo,
                "description": "",
                "info": "",
                "size": 0,
                "price": 0,
                "sold": 0,
                "sold_date": null,
                "claimed": false
            });
        };

        ExchangeCMS.get({
            a: $routeParams.customerID
        }, function(exchange_cms) {
            self.original = exchange_cms;
            $scope.exchange_cms = new ExchangeCMS(self.original);

            $scope.transactionID = $scope.exchange_cms.transactions.length;

            $scope.exchange_cms.transactions[$scope.transactionID] = {
                'transaction': $scope.transactionID,
                "items": []
            };
            $scope.addNewItem();
        });

        $scope.removeItem = function(index) {
            var newItemNo = $scope.exchange_cms.transactions[$scope.transactionID].items.length;
            $scope.exchange_cms.transactions[$scope.transactionID].items.splice(index, 1);

            for (i in $scope.exchange_cms.transactions[$scope.transactionID].items) {
                $scope.exchange_cms.transactions[$scope.transactionID].items[i].transaction = i;
            }
        };

        $scope.save = function() {
            $scope.exchange_cms.transactions[$scope.transactionID].timestamp = new Date();
            $scope.exchange_cms.update(function() {
                $location.path('/customer/view/' + $scope.exchange_cms._id);
            });
        };
    })

    .controller('UpdateTransactionCtrl', function($scope, $location, $routeParams, ExchangeCMS) {
        var self = this;

        $scope.transactionID = $routeParams.transactionID;

        ExchangeCMS.get({
            a: $routeParams.customerID
        }, function(exchange_cms) {
            self.original = exchange_cms;
            $scope.exchange_cms = new ExchangeCMS(self.original);
        });

        $scope.addNewItem = function() {
            var newItemNo = $scope.exchange_cms.transactions[$scope.transactionID].items.length + 1;
            $scope.exchange_cms.transactions[$scope.transactionID].items.push({
                'id': newItemNo,
                "description": "",
                "info": "",
                "size": 0,
                "price": 0,
                "sold": 0,
                "sold_date": null,
                "claimed": false
            });
        };

        $scope.soldItem = function(index) {
            if ($scope.exchange_cms.transactions[$scope.transactionID].items[index].sold > 0) {
                $scope.exchange_cms.transactions[$scope.transactionID].items[index].sold_date = new Date();
            }
        };

        $scope.save = function() {
            $scope.exchange_cms.update(function() {
                $location.path('/customer/view/' + $scope.exchange_cms._id);
            });
        };
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

    .controller('UpdateCustomerCtrl', function($scope, $location, $routeParams, ExchangeCMS) {
        $scope.moneyOwed = ExchangeCMS.get({
            a: '_design',
            b: 'customers',
            c: '_view',
            d: 'moneyOwed',
            key: "\"" + $routeParams.customerID + "\""
        });

        $scope.itemsSold = ExchangeCMS.get({
            a: '_design',
            b: 'customers',
            c: '_view',
            d: 'itemsSold',
            key: "\"" + $routeParams.customerID + "\""
        });

        var self = this;

        ExchangeCMS.get({
            a: $routeParams.customerID
        }, function(exchange_cms) {
            self.original = exchange_cms;
            $scope.exchange_cms = new ExchangeCMS(self.original);
        });

        $scope.save = function() {
            $scope.exchange_cms.update(function() {
                $location.path('/customer/view/' + $scope.exchange_cms._id);
            });
        };
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
