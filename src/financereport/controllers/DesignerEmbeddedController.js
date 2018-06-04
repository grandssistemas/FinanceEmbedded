/**
 * Created by gelatti on 25/05/17.
 */
import templateModal from '../views/reporttypemodal.html';

function DesignerEmbeddedController(
	$scope,
	$window,
	FinanceReportService,
	$uibModal
) {
	$scope.entity = angular.copy($scope.$ctrl.entity);
	$scope.variable = angular.copy($scope.$ctrl.variable);

	$scope.back = function () {
		$scope.$ctrl.backState({ $type: $scope.entity.reportType });
	};

	$scope.init = function () {
		configureOptions();
		const options = new $window.Stimulsoft.Designer.StiDesignerOptions();
		options.appearance.fullScreenMode = false;
		options.height = '940px';
		const designer = new $window.Stimulsoft.Designer.StiDesigner(options, 'StiDesigner', false);
		const report = new $window.Stimulsoft.Report.StiReport();

		if ($scope.entity && $scope.entity.id) {
			report.load($scope.entity.report.definition);
		} else {
			report.dictionary.databases.clear();
			const connStr = 'url = jdbc:postgresql://%address/%db?currentSchema=%schema; user = %user; password = %pass;';
			report.dictionary.databases.clear();
			report.dictionary.databases.add(new Stimulsoft.Report.Dictionary.StiPostgreSQLDatabase('PostgreSQL', 'PostgreSQL', connStr));
			report.dictionary.synchronize();
		}

		report.dictionary.variable = $scope.variable;
		changeSaveReport(designer);
		designer.report = report;
		designer.renderHtml('designer');
	};

	function saveReportType(entity) {
		const modal = $uibModal.open({
			template: templateModal,
			controller: 'ReportTypeModalEmbeddedController',
			backdrop: 'static',
			size: 'sm',
			resolve: {
				entity
			}
		});
		modal.result.then((result) => {
			result.isDefault = result.isDefault || false;
			FinanceReportService.update(result).then((data) => {
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
			const jsonStr = event.report.saveToJsonString();
			$scope.entity.report = $scope.entity.report || {};
			$scope.entity.report.name = event.fileName;
			$scope.entity.report.definition = jsonStr;
			saveReportType($scope.entity);
		};
	}
}

DesignerEmbeddedController.$inject = [
	'$scope',
	'$window',
	'FinanceReportService',
	'$uibModal'
];

export default DesignerEmbeddedController;
