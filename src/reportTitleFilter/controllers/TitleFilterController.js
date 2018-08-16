/**
 * Created by kolecha on 13/08/18.
 */
TitleFilterController.$inject = [
	'$scope',
	'$timeout',
	'IndividualEmbeddedService',
	'gumgaController'];

function TitleFilterController(
	$scope,
	$timeout,
	IndividualEmbeddedService,
	gumgaController
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
		const filters = {};

		if ($scope.selecionados) {
			filters.vars = [
				{ key: 'individuals', value: `obj.individual_id IN (${stringResult()})` }
			];
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
