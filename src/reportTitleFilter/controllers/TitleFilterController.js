/**
 * Created by kolecha on 13/08/18.
 */
TitleFilterController.$inject = [
	'$scope',
	'$timeout',
	'IndividualEmbeddedService',
	'gumgaController',
	'$filter',
	'$q'];

function TitleFilterController(
	$scope,
	$timeout,
	IndividualEmbeddedService,
	gumgaController,
	$filter,
	$q
) {
	gumgaController.createRestMethods($scope, IndividualEmbeddedService, 'individual');
	$scope.titleTypes = [
		{ name: 'Pagar', key: 'PAY' },
		{ name: 'Receber', key: 'RECEIVE' }
	];
	$scope.selectType = (param) => {
		if (param.key === 'PAY') {
			$scope.variationTypes = [
				{ name: 'Á Pagar', key: 'false' },
				{ name: 'Pagas', key: 'true' }
			];
		} else {
			$scope.variationTypes = [
				{ name: 'Á Receber', key: 'false' },
				{ name: 'Recebidas', key: 'true' }
			];
		}
	};
	$scope.clearVariationTypes = () => {
		delete $scope.variationType;
		delete $scope.variationTypes;
	};
	$scope.getSearchTypes = function (param) {
		return $q((resolve) => {
			const arr = $scope.types.filter((type) => type.name.indexOf(param) !== -1);
			resolve(arr);
		});
	};
	$scope.getSearchVariationTypes = function (param) {
		return $q((resolve) => {
			const arr = $scope.variationTypes.filter((type) => type.name.indexOf(param) !== -1);
			resolve(arr);
		});
	};

	$scope.individual.methods.createQuery()
		.pageSize(1000)
		.page()
		.send()
		.then((resp) => {
			$scope.individualList = resp.data.values.filter((client) => client.name);
		});

	$scope.$parent.$parent.mountFilterMyAccounts = function () {
		const filters = {
			vars: []
		};
		const startDate = $scope.startDate || new Date('2000-01-01 00:00:00');
		const endDate = $filter('date')($scope.endDate, 'yyyy-MM-dd HH:mm:ss') || $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');

		if ($scope.selecionados && $scope.selecionados.length > 0) {
			filters.vars.push({ key: 'individuals', value: `obj.individual_id IN (${stringResult()}) AND` });
		} else {
			filters.vars.push({ key: 'individuals', value: `obj.individual_id != 0 AND ` });
		}
		if (startDate) {
			filters.vars.push({ key: 'startDate', value: $filter('date')(startDate, 'yyyy-MM-dd HH:mm:ss') });
		}
		if (endDate) {
			filters.vars.push({ key: 'endDate', value: endDate.replace('00:00:00', '23:59:59') });
		}
		return filters;
	};

	function stringResult() {
		$scope.filterSelected = $scope.selecionados.map((item) => item.id);
		return $scope.filterSelected.toString();
	}
}
module.exports = TitleFilterController;
