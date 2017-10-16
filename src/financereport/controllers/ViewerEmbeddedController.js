ViewerEmbeddedController.$inject = [
    '$scope',
    '$window',
    'FinanceReportService'];

function ViewerEmbeddedController($scope,
                                  $window,
                                  FinanceReportService) {
    let variableVar, filtersVar;
    if ($scope.$resolve) {
        variableVar = angular.copy($scope.$resolve.variable);
        filtersVar = angular.copy($scope.$resolve.filters);
        $scope.entity = angular.copy($scope.$resolve.entity);
    } else {
        $scope.entity = angular.copy($scope.$ctrl.entity);
        variableVar = angular.copy($scope.$ctrl.variable);
        filtersVar = angular.copy($scope.$ctrl.filters);
        init();
    }

    $scope.back = function () {
        $scope.$ctrl.backState({$type: $scope.entity.reportType});
    };

    function init() {
        StiOptions.WebServer.url = FinanceReportService.connectionLocal;
        var viewer = new $window.Stimulsoft.Viewer.StiViewer(null, 'StiViewer', false);
        var report = new $window.Stimulsoft.Report.StiReport();
        var jsonReport = $scope.entity.report.definition;
        if ($scope.entity.id) {
            report.load(jsonReport);
        }
        report.dictionary.variable = variableVar;
        variableVar.forEach((vars) => {
            report.dictionary.variables.list.forEach((item) => {
                if (item.name == vars.name) {
                    item.val = vars.val;
                    item.value = vars.value;
                    item.valueObject = vars.valueObject;
                }
            });
        });
        viewer.report = report;
        viewer.renderHtml('viewer');


        viewer.onBeginProcessData = function (event) {
            var queryBegin = '',
                queryEnd = '',
                index;
            if (!Array.isArray(filtersVar)) {

                var where = '';
                if (!event.queryString.match(/where/i)) {
                    where = ' where 1=1 ';
                }

                if (event.queryString.match(/group by/i)) {
                    index = event.queryString.match(/group by/i).index;
                    queryBegin = event.queryString.substring(0, index - 1);
                    queryEnd = event.queryString.substring(index, event.queryString.length);
                } else if (event.queryString.match(/order by/i)) {
                    index = event.queryString.match(/order by/i).index;
                    queryBegin = event.queryString.substring(0, index - 1);
                    queryEnd = event.queryString.substring(index, event.queryString.length);
                } else {
                    index = event.queryString.length;
                    queryBegin = event.queryString.substring(0, index);
                }

                event.queryString = ' ' + queryBegin + ' ' + where + ' ' + filtersVar + ' ' + queryEnd + ' ';
            }
            if (Array.isArray(filtersVar)) {
                var query = angular.copy(event.queryString);
                var queryMod = ' ';
                if (filtersVar.length) {

                    filtersVar.forEach(function (data) {
                        for (var i = 1; i <= data.count; i++) {
                            if (queryMod) {
                                queryMod = queryMod + ' UNION ALL ' + query + ' WHERE obj.id = ' + data.id + ' ';
                            } else {
                                queryMod = query + ' WHERE obj.id = ' + data.id + ' ';
                            }
                        }
                    });
                } else {
                    queryMod = query;
                }
                event.queryString = queryMod;
            }
        };


        $scope.close = () => {
            $scope.$dismiss();
        };
    }

    $scope.init = init;

}

module.exports = ViewerEmbeddedController;