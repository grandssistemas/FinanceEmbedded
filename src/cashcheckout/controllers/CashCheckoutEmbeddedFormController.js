CashCheckoutEmbeddedFormController.$inject = ['$scope',
    'CashCheckinEmbeddedService',
    'FinanceUnitService',
    'SweetAlert',
    '$filter',
    '$uibModal'
];

function CashCheckoutEmbeddedFormController($scope,
                                            CashCheckinEmbeddedService,
                                            FinanceUnitService,
                                            SweetAlert,
                                            $filter,
                                            $uibModal) {
    $scope.entity = angular.copy($scope.$ctrl.entity);
    $scope.noCheckin = !$scope.entity;
    $scope.close = function (entity) {
        if (validateDiference(entity) && !$scope.noCheckin) {
            SweetAlert.swal({
                    title: "Deseja realmente fechar o Caixa?",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55", confirmButtonText: "Sim!",
                    cancelButtonText: "Não",
                    closeOnConfirm: true,
                    closeOnCancel: true
                },
                function (isConfirm) {
                    if (isConfirm) {
                        entity.cashCheckouts = entity.cashCheckouts || [];
                        entity.cashCheckouts.push({
                            date: new Date(),
                            status: 'NORMAL',
                            change: $scope.change,
                            defaultTransfer: $scope.defaultTransfer
                        });
                        CashCheckinEmbeddedService.update(entity).then(function () {
                            $scope.$ctrl.onGoHome();
                        })
                    }
                });
        }
    };

    $scope.showWithoutMovement = false;

    $scope.showAccountsWithoutMovement = function (cashAccount) {
        if (cashAccount.movementedValue === null) {
            return false;
        }
        return !$scope.showWithoutMovement ? cashAccount.movementedValue !== 0 : true;
    };

    function calcMovement() {
        if ($scope.entity && $scope.entity.date) {
            CashCheckinEmbeddedService.getByCurrentCashCheckin($scope.entity.date)
                .then(function (data) {
                    $scope.entity.values = $scope.entity.group.financeUnits.map(function (financeUnit) {
                        let movementedValue = data.data.filter(function (entry) {
                            return financeUnit.id === entry.financeUnit.id;
                        }).reduce(function (a, b) {
                            return a + b.value;
                        }, 0);
                        return {financeUnit: financeUnit, movementedValue: movementedValue, informedValue: 0}
                    });

                    $scope.entity.values.sort(function (a, b) {
                        return Math.abs(b.movementedValue) - Math.abs(a.movementedValue);
                    });
                });
        }
    }

    calcMovement();

    function validateDiference(entity) {
        for (let i = 0; i < entity.values.length; i++) {
            if (!isComparationCorrect(entity.values[i], entity.destinyChange)) {
                SweetAlert.swal("Diferença de Valores!", "A conta " + entity.values[i].financeUnit.name +
                    " esta com diferença de valores, realize movimentações de caixa para corrigir antes de fechar.", "error");
                return false;
            }
        }
        return true;
    }

    function isComparationCorrect(value, destiny) {
        var change = 0;
        if (destiny && destiny.id === value.financeUnit.id) {
            change = $scope.change || 0;
        }
        return value.movementedValue === (value.informedValue + change);
    }

    $scope.formatDate = function (date) {
        return $filter('date')(new Date(date), 'dd/MM/yyyy HH:mm:ss');
    };

    $scope.getDefaultTransfer = function (param) {
        param = param || '';
        var hql = "(SELECT count(gUnit) " +
            "FROM FinanceUnitGroup groups inner join groups.financeUnits gUnit " +
            "WHERE groups.id = " + $scope.entity.group.id + " AND gUnit = obj) = 0 AND " +
            "lower(obj.name) like '%" + param + "%'";
        return FinanceUnitService.getAdvancedSearch(hql).then(function (data) {
            return data.data.values;
        })
    };

    $scope.disabledCloseCash = function () {
        return $scope.noCheckin || !transferAccountCorrect($scope.entity);
    };

    function transferAccountCorrect(entity) {
        return (entity.values && entity.values.reduce(function (a, b) {
            return a && (b.financeUnit.defaultTransfer || !b.movementedValue);
        }, true)) || !!$scope.defaultTransfer;
    }

    $scope.showMovements = (financeUnit) => {
        $uibModal.open({
            animation: true,
            templateUrl: '/cashcheckout/views/BalanceModal.html',
            controller: 'BalanceModalController',
            backdrop: 'static',
            size: 'larger',
            resolve: {
                entries: function () {
                    return FinanceUnitService.getEntriesByFinanceUnitAndCheckin(financeUnit.id, $scope.entity.id);
                },
                config: function () {
                    return {
                        title: `Listagem de movimentações da conta ${financeUnit.name}`,
                        type: 'FINANCEUNIT'
                    }
                },
            }
        });
    }

    $scope.showAllMovements = () => {
        $uibModal.open({
            animation: true,
            templateUrl: '/cashcheckout/views/BalanceModal.html',
            controller: 'BalanceModalController',
            backdrop: 'static',
            size: 'larger',
            resolve: {
                entries: function () {
                    return FinanceUnitService.getEntriesByCheckin($scope.entity.id);
                }, config: function () {
                    return {
                        title: `Listagem de movimentações nesta abertura`,
                        type: 'ALL'
                    }
                },
            }
        });
    }
}

module.exports = CashCheckoutEmbeddedFormController;