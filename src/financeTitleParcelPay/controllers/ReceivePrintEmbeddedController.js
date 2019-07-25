ReceivePrintEmbeddedController.$inject = ['$scope', '$uibModalInstance', 'items', '$filter'];

function ReceivePrintEmbeddedController($scope, $uibModalInstance, items, $filter) {
    $scope.ok = function (obj) {
        $uibModalInstance.close(obj);
    };

    $scope.user = JSON.parse(window.localStorage.getItem('user'));
    $scope.recibo = items;
    $scope.receiptValue = $filter('gumgaNumberInWords')($scope.recibo.value.toString().replace('.', ','), true);

    $scope.print = function () {
        window.print();
    };

    $scope.cancel = function () {
        $uibModalInstance.close();
    };
}

module.exports = ReceivePrintEmbeddedController;

