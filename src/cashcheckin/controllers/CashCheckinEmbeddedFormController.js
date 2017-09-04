CashCheckinEmbeddedFormController.$inject = ['$scope',
    'CashCheckinEmbeddedService',
    'FinanceUnitGroupService',
    'FinanceUnitService',
    '$filter',
    '$timeout'];

function CashCheckinEmbeddedFormController($scope,
                                           CashCheckinEmbeddedService,
                                           FinanceUnitGroupService,
                                           FinanceUnitService,
                                           $filter,
                                           $timeout){
    $scope.entity = {};
    $scope.entity.employee = angular.copy($scope.$ctrl.employee);
    $scope.entity.date = new Date();
    $scope.disableOpening = $scope.$ctrl.disableOpening;

    $scope.getGroups = function (param) {
        return FinanceUnitGroupService.getSearch('name', param || '').then(function (data) {
            return $scope.groups = data.data.values;
        })
    };

    $scope.open = function (entity) {
        entity.status = 'NORMAL';
        CashCheckinEmbeddedService.update(entity).then(function (data) {
            $scope.$ctrl.onGoHome({data});
        })
    };

    $scope.formatDate = function (date) {
        return $filter('date')(new Date(date), 'dd/MM/yyyy HH:mm:ss');
    };

    $scope.onSelectGroup = onSelectGroup;
    $scope.onDeselectGroup = function (value) {
        onSelectGroup(value);
    };

    function onSelectGroup(value) {
        if (value.id) {
            FinanceUnitGroupService.getById(value.id).then(function (data) {
                $scope.financeUnits = data.data.financeUnits;
            })
        } else {
            $scope.financeUnits = null;
        }
        $scope.entity.change = 0;
        $scope.entity.originChange = null;
        $scope.entity.destinyChange = null;
    }

    $scope.getChangeOrigin = function (param) {
        return FinanceUnitService.getSearch('name', param)
            .then(function (data) {
                return data.data.values;
            })
    };

    $scope.onSelectOrigin = function () {
        isUnitsValids('originChange')
    };
    $scope.onSelectDestiny = function () {
        isUnitsValids('destinyChange')
    };

    function isUnitsValids(attribute) {
        $timeout(function () {
            if (!!$scope.entity.originChange && !!$scope.entity.destinyChange &&
                $scope.entity.originChange.id === $scope.entity.destinyChange.id) {
                $scope.entity[attribute] = null;
            }
        })
    }

    $scope.disabledOpenCash = function(entity){
        return $scope.disableOpening || entity.employee == null || (entity.group == null || entity.group.id == null) ||
            (entity.change && (entity.originChange == null || entity.destinyChange == null))
    }
}

module.exports = CashCheckinEmbeddedFormController;