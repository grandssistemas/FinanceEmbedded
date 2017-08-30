ModalParticipationController.$inject = [
    '$scope',
    '$modalInstance',
    'entity',
    '$modal'];

function ModalParticipationController(
    $scope,
    $modalInstance,
    entity,
    $modal) {

    entity = entity || {};
    $scope.entity = angular.copy(entity);
    $scope.ok = function (obj) {
        $modalInstance.close(obj);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

}

module.exports = ModalParticipationController;