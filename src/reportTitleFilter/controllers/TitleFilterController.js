import moment from 'moment'
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
	$timeout(() => {
		$scope.dates = {
			start: new Date(moment().startOf('month')),
			end: new Date(moment().endOf('month'))
		}
	})
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

		if ($scope.dates && $scope.dates.start && $scope.dates.end) {
			filters.vars = [
				{ key: 'startDate', value: moment($scope.dates.start || new Date('2000-01-01 00:00:00')).hours(0).minutes(0).seconds(0).format('YYYY-MM-DD HH:mm:ss') },
				{ key: 'endDate', value: moment($scope.dates.end).hours(23).minutes(59).seconds(59).format('YYYY-MM-DD HH:mm:ss') }
			]
		}

		if ($scope.selecionados && $scope.selecionados.length > 0) {
			filters.vars.push({ key: 'individuals', value: `obj.individual_id IN (${stringResult()}) AND` });
		} else {
			filters.vars.push({ key: 'individuals', value: `obj.individual_id != 0 AND ` });
		}

		return filters;
	};

	function stringResult() {
		$scope.filterSelected = $scope.selecionados.map((item) => item.id);
		return $scope.filterSelected.toString();
	}
}
module.exports = TitleFilterController;
