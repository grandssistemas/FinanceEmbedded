/**
 * Created by gelatti on 25/05/17.
 */

ReportTypeModalEmbeddedController.$inject = [
    '$scope',
    'FinanceReportService',
    '$uibModalInstance',
    'entity'];

function ReportTypeModalEmbeddedController($scope,
                                   FinanceReportService,
                                   $uibModalInstance,
                                   entity) {

    $scope.entity = angular.copy(entity);

    FinanceReportService.getReportType().then(function (data) {
        $scope.reportType = data.data;
    });

    $scope.continue = function () {
        $uibModalInstance.close($scope.entity);
    };
}

module.exports = ReportTypeModalEmbeddedController;