ConfirmCashCheckoutModal.$inject = [
    '$scope',
    '$timeout',
    '$uibModalInstance',
    'entity',
    'change',
];

function ConfirmCashCheckoutModal($scope,
    $timeout,
    $uibModalInstance,
    entity,
    change) {

    $scope.entity = entity;

    if (change) {
        $scope.change = change;
    }

    $timeout(() => $scope.step = 1, 350);
    
    $scope.previousStep = () => {
        $scope.step--;
    }

    $scope.nextStep = () => {
        $scope.step++;
    }

    $scope.dismiss = () => {
        $uibModalInstance.close({
            closeCashCheckout: false
        });
    }

    $scope.closeModal = () => {
        $uibModalInstance.close({
            change: $scope.change || 0,
            closeCashCheckout: true
        });
    }

    $scope.getHoursIgnoreDate = (dateValue) => {
        const mommentInstance = moment(dateValue);
        return mommentInstance.utc().hours() + ':' + mommentInstance.utc().minutes();
    }

}

module.exports = ConfirmCashCheckoutModal;
