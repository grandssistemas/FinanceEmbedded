/**
 * Created by gelatti on 25/05/17.
 */

FinanceReportListEmbeddedController.$inject = [
    '$scope',
    'FinanceReportService',
    'gumgaController',
    '$state',
    '$q',
    'SweetAlert',
    '$rootScope'];

function FinanceReportListEmbeddedController($scope, FinanceReportService, gumgaController, $state, $q, SweetAlert, $rootScope) {
    gumgaController.createRestMethods($scope, FinanceReportService, 'financeReport');
    var filters = '',
        variables = [];

    $scope.financeReport.methods.get = function (page) {
        FinanceReportService.getByType(page, $scope.type).then(function (data) {
            $scope.financeReport.data = data.data.values;
            $scope.financeReport.pageSize = data.data.pageSize;
            $scope.financeReport.count = data.data.count;
            $scope.financeReport.page = page || 1;
        });
    };

    $scope.financeReport.execute('reset');
    $scope.financeReport.execute('get');

    FinanceReportService.getReportType().then(function (data) {
        $scope.reportType = data.data;
    });

    $scope.delete = function (entity) {
        if (entity.oi) {
            SweetAlert.swal({
                    title: 'Deseja relamente apagar este relatório?',
                    text: 'Esta ação não pode ser desfeita.',
                    type: 'warning',
                    confirmButtonColor: "#1ab394",
                    showCancelButton: true,
                    cancelButtonText: "Não",
                    confirmButtonText: "Sim"
                }, confirmReversal
            );

            function confirmReversal(isConfirm) {
                if (isConfirm) {
                    FinanceReportService.delete(entity).then(function () {
                        $scope.financeReport.execute('get');
                    });
                }
            }
        } else {
            SweetAlert.swal('Este relatório não pode ser apagado', 'Este relatório não pode ser apagado pois é de ' +
                'dominio publico.', 'warning');
        }
    };

    $scope.insertReport = function () {
        variables = [];
        // variables = CompanyService.variablesReport;
        // $state.go('financereport.insert', {variable: variables, backState: 'financereport.list'});
        $scope.$ctrl.insertReport();
    };

    $scope.editReport = function (entity) {
        variables = [];
        $scope.$ctrl.editReport({$value: entity});
    };

    $scope.viewReport = function (entity) {
        $scope.$ctrl.viewReport({$value: entity, variables: variables});
    };

    $scope.copyReport = function (entity) {
        var newEntity = angular.copy(entity);
        var oi = {value: JSON.parse(window.sessionStorage.getItem('user')).organizationHierarchyCode};
        delete newEntity.id;
        delete newEntity.report.id;
        newEntity.oi = oi;
        newEntity.report.oi = oi;
        FinanceReportService.update(newEntity).then(function () {
            $scope.financeReport.execute('get');
        });
    };

    $scope.conf = {
        columns: 'id, name,isdefault, buttons',
        selection: 'single',
        materialTheme: true,
        itemsPerPage: [5, 10, 25, 50, 100],
        title: 'Lista de Relatórios',
        columnsConfig: [
            {
                name: 'id',
                size: 'col-md-1',
                title: '<strong>Id</strong>',
                content: '<div>{{$value.id}}</div>'
            },
            {
                name: 'name',
                size: 'col-md-9',
                title: '<strong>Nome</strong>',
                content: '<div>{{$value.report.name}}</div>'
            },
            {
                name: 'isdefault',
                size: 'col-md-1',
                title: '<strong>Padrão</strong>',
                content: '<div class="checkbox" style="margin-top: 0%;margin-bottom: 0%;margin-left: 40%;"><label ng-click="$parent.$parent.changeDefault($value)"><input type="checkbox" class="gmd" ng-disabled="!$value.oi || !$value.oi.value" data-ng-model="$value.isDefault"><span class="box"></span></label></div>'
            },
            {
                name: 'buttons',
                size: 'col-md-1',
                title: '  ',
                content: '<button style="display:inline-block" type="button" ng-click="$parent.$parent.editReport($value)" uib-tooltip="Editar" class="btn-link center-block text-primary"><i class="fa fa-pencil-square-o"></i></button>' +
                '<button style="display:inline-block" type="button" ng-click="$parent.$parent.viewReport($value)" uib-tooltip="Visualizar Relatório" class="btn-link btn-xs"><i class="fa fa-search"></i></button>' +
                '<button style="display:inline-block" type="button" ng-click="$parent.$parent.copyReport($value)" uib-tooltip="Copiar Relatório" class="btn-link btn-xs text-navy"><i class="fa fa-plus"></i></button>' +
                '<button style="display:inline-block" uib-tooltip="Relatório Público" type="button" class="btn-link btn-xs center-block " ng-show="!$value.oi || !$value.oi.value"><i class="fa fa-users"></i></button>'
            }
        ]
    };

    $scope.changeDefault = function (report) {
        if (report.oi && report.oi.value) {
            report.isDefault = !report.isDefault;
            $rootScope.$emit('hideNextMessage')
            FinanceReportService.save(report).then(() => {
                $scope.changeReports();
            })
        }
    };

    $scope.changeReports = function () {
        filters = '';
        $scope.financeReport.execute('reset');
        $scope.financeReport.execute('get');
    };

    function mountFilters() {
        var prom = $q.defer();
        return prom.promise;
    }
}

module.exports = FinanceReportListEmbeddedController;