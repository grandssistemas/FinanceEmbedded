/**
 * Created by kolecha on 13/08/18.
 */
TitleFilterController.$inject = [
	'$scope',
	'$timeout',
	'IndividualEmbeddedService',
	'gumgaController',
	'$filter'];

function TitleFilterController(
	$scope,
	$timeout,
	IndividualEmbeddedService,
	gumgaController,
	$filter
) {
	gumgaController.createRestMethods($scope, IndividualEmbeddedService, 'individual');

	$scope.individual.methods.createQuery()
		.pageSize(1000)
		.page()
		.send()
		.then((resp) => {
			$scope.individualList = resp.data.values;
		});

	$scope.$parent.$parent.mountFilterMyAccounts = function () {
		const filters = {
			vars: []
		};
		const beginDate = $scope.beginDate || new Date('2000-01-01 00:00:00');
		const endDate = $filter('date')($scope.endDate, 'yyyy-MM-dd HH:mm:ss') || $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
		if ($scope.selecionados) {
			filters.vars.push({ key: 'individuals', value: `obj.individual_id IN (${stringResult()})` });
		}

		if (beginDate) {
			filters.vars.push({ key: 'beginDate', value: $filter('date')(beginDate, 'yyyy-MM-dd HH:mm:ss') });
		}

		if (endDate) {
			filters.vars.push({ key: 'endDate', value: endDate.replace("00:00:00", "23:59:59") });
		}
		return filters;
	};

	function stringResult() {
		$scope.filterSelected = $scope.selecionados.map((item) => {
			return item.id;
		});
		return $scope.filterSelected.toString();
	}
}
module.exports = TitleFilterController;
