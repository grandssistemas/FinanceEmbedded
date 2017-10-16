/**
 * Created by gelatti on 25/05/17.
 */
var templateModal = require('../views/reporttypemodal.html');
DesignerEmbeddedController.$inject = [
    '$scope',
    '$window',
    'FinanceReportService',
    '$uibModal'
];

function DesignerEmbeddedController($scope,
                                    $window,
                                    FinanceReportService,
                                    $uibModal) {

    $scope.entity = angular.copy($scope.$ctrl.entity);
    $scope.variable = angular.copy($scope.$ctrl.variable);

    $scope.back = function () {
        $scope.$ctrl.backState({$type: $scope.entity.reportType})
    };

    $scope.init = function () {
        configureOptions();
        var options = new $window.Stimulsoft.Designer.StiDesignerOptions();
        options.appearance.fullScreenMode = false;
        options.height = "940px";
        var designer = new $window.Stimulsoft.Designer.StiDesigner(options, 'StiDesigner', false);
        var report = new $window.Stimulsoft.Report.StiReport();

        if ($scope.entity.id) {
            report.load($scope.entity.report.definition);
        } else {
            report.dictionary.databases.clear();
            var connStr = "url = jdbc:postgresql://%address/%db?currentSchema=%schema; user = %user; password = %pass;";
            report.dictionary.databases.clear();
            report.dictionary.databases.add(new Stimulsoft.Report.Dictionary.StiPostgreSQLDatabase("PostgreSQL", "PostgreSQL", connStr));
            report.dictionary.synchronize();
        }

        report.dictionary.variable = $scope.variable;
        changeSaveReport(designer);
        designer.report = report;
        designer.renderHtml('designer');
    };

    function saveReportType(entity) {
        var modal = $uibModal.open({
            templateUrl: templateModal,
            controller: 'ReportTypeModalEmbeddedController',
            backdrop: 'static',
            size: 'sm',
            resolve: {
                entity: entity
            }
        });
        modal.result.then(function (result) {
            FinanceReportService.update(result).then(function (data) {
                $scope.entity = data.data.data;
            });
        });
    }

    function configureOptions() {
        StiOptions.WebServer.url = FinanceReportService.connectionLocal;
        StiOptions.Services._databases = [];
        StiOptions.Services._databases.add(new Stimulsoft.Report.Dictionary.StiPostgreSQLDatabase());
    }

    function changeSaveReport(designer) {
        designer.onSaveReport = function (event) {
            event.report.reportName = event.fileName;
            event.report.reportAlias = event.fileName;
            var jsonStr = event.report.saveToJsonString();
            $scope.entity.report = $scope.entity.report || {};
            $scope.entity.report.name = event.fileName;
            $scope.entity.report.definition = jsonStr;
            saveReportType($scope.entity);
        };
    }



















}

module.exports = DesignerEmbeddedController;