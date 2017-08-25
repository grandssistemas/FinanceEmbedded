ReceivePrintEmbeddedController.$inject = ['$scope', '$uibModalInstance', 'items'];

function ReceivePrintEmbeddedController($scope, $uibModalInstance, items) {
    $scope.ok = function (obj) {
        $uibModalInstance.close(obj);
    };

    $scope.user = JSON.parse(window.sessionStorage.getItem('user'));
    $scope.recibo = items;

    $scope.print = function () {
        window.print();
    };

    $scope.cancel = function () {
        $uibModalInstance.close();
    };
}

module.exports = ReceivePrintEmbeddedController;