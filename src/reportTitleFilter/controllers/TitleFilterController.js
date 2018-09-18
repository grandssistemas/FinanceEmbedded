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
				{ name: 'Á Pagar', key: 'NOT IN' },
				{ name: 'Pagas', key: 'IN' }
			];
		} else {
			$scope.variationTypes = [
				{ name: 'Á Receber', key: 'NOT IN' },
				{ name: 'Recebidas', key: 'IN' }
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
			$scope.individualList = resp.data.values;
		});

	$scope.$parent.$parent.mountFilterMyAccounts = function () {
		const filters = {
			vars: []
		};

		if (!$scope.titleType || !$scope.variationType) {
			return;
		}
		const beginDate = $scope.beginDate || new Date('2000-01-01 00:00:00');
		const endDate = $filter('date')($scope.endDate, 'yyyy-MM-dd HH:mm:ss') || $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');

		filters.vars.push({ key: 'type', value: $scope.titleType.key });
		filters.vars.push({ key: 'payReceive', value: $scope.variationType.key });

		if ($scope.selecionados) {
			filters.vars.push({ key: 'individuals', value: `obj.individual_id IN (${stringResult()})` });
		}
		if (beginDate) {
			filters.vars.push({ key: 'beginDate', value: $filter('date')(beginDate, 'yyyy-MM-dd HH:mm:ss') });
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
