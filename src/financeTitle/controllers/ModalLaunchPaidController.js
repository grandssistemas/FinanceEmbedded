ModalLaunchPaidController.$inject = ['$scope', 'gumgaController', '$uibModalInstance', 'FinanceUnitService', 'items'];

function ModalLaunchPaidController($scope, gumgaController, $uibModalInstance, FinanceUnitService, items) {

    gumgaController.createRestMethods($scope, FinanceUnitService, 'financeunit');
    $scope.financeunit.methods.search('name', '');
    $scope.title = [];

    $scope.ok = function (obj) {
        obj.registerAsPayed = true;
        $uibModalInstance.close(obj);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

}

module.exports = ModalLaunchPaidController;
