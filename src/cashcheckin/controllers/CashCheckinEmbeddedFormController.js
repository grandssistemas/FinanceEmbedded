CashCheckinEmbeddedFormController.$inject = [
	'$scope',
	'CashCheckinEmbeddedService',
	'FinanceUnitGroupService',
	'FinanceUnitService',
	'$filter',
	'$timeout'
];

function CashCheckinEmbeddedFormController(
	$scope,
	CashCheckinEmbeddedService,
	FinanceUnitGroupService,
	FinanceUnitService,
	$filter,
	$timeout
) {
	this.$onInit = function () {
		$scope.changeOriginTooltip = 'Informe a conta de onde o valor do troco será retirado.';
		$scope.changeDestinyTooltip = 'Informe a conta onde o valor do troco será incluído.';
		$scope.entity = {};
		$scope.isFinance = () => window.APILocation.apiLocation.indexOf('finance-api') !== -1;

		$timeout(() => {
			if ($scope.groupUnit) {
				$scope.entity.change = 0;
				angular.element('#changeId input')[0].focus();
			}
		}, 100);


		$scope.entity.employee = angular.copy($scope.$ctrl.employee);
		$scope.entity.date = new Date();
		$scope.entity.dateFormatted = moment(new Date()).format('DD/MM/YYYY HH:mm:ss')
		$scope.disableOpening = $scope.$ctrl.disableOpening;
		$scope.disableChange = true;
		$scope.getGroups = function (param) {
			return FinanceUnitGroupService.getGQueryV2(param || '').then((data) => {
				return $scope.groups = data.data.values;
			});
			// return FinanceUnitGroupService.getSearch('name', param || '').then((data) => {
			// 	return $scope.groups = data.data.values;
			// });
		};

		CashCheckinEmbeddedService.getCurrentCheckin().then((data) => {
			$scope.entity.group = data.data.group;
		});


		$scope.open = function (entity) {
			entity.status = 'NORMAL';
			entity.group = $scope.groupUnit;
			CashCheckinEmbeddedService.update(entity).then((data) => {
				$scope.$ctrl.onGoHome({
					data
				});
			});
		};

		$scope.formatDate = function (date) {
			return $filter('date')(new Date(date), 'dd/MM/yyyy HH:mm:ss');
		};

		$scope.onSelectGroup = (value) => {

			$scope.disableChange = value.caixaAberto

			FinanceUnitGroupService.getById(value.id).then((data) => {
				$scope.financeUnits = data.data.financeUnits;
			});

			if (!value.id) {
				$scope.financeUnits = null;
			}
			$scope.entity.originChange = undefined;
			$scope.entity.destinyChange = undefined;

			CashCheckinEmbeddedService.getLastCheckout(value.integrationValue.integrationId).then((data) => {
				if (data.data && data.data.change && data.data.change > 0) {
					$scope.entity.change = data.data.change;
					$scope.disableChange = true;
				} else {
					$scope.entity.change = 0;
					$scope.disableChange = false;
					
					angular.element('#changeId input')[0].focus()
				}
			});
		};

		$scope.descSelectGroup = () => {
			$timeout(() => {
				$scope.entity.change = 0;
				$scope.disableChange = true;
				$scope.financeUnits = null;
				$scope.entity.originChange = undefined;
				$scope.entity.destinyChange = undefined;
				angular.element('#changeId input')[0].focus();
			}, 100);

		}

		// $scope.getChangeOrigin = function (param) {

		// if (!$scope.entity.originChange && !$scope.entity.destinyChange) {
		//     return FinanceUnitService.getSearch('name', param)
		//         .then(function (data) {
		//             return data.data.values;
		//         });
		// }
		// if (!$scope.entity.originChange && $scope.entity.destinyChange) {
		//     return FinanceUnitService.getSearch('name').then(function (data) {
		//         return data.data.values.filter((data) => {
		//             return data.id != $scope.entity.destinyChange.id;
		//         });
		//     });
		// }
		// if ($scope.entity.originChange && !$scope.entity.destinyChange) {
		//     return FinanceUnitService.getSearch('name').then(function (data) {
		//         return data.data.values.filter((data) => {
		//             return data.id != $scope.entity.originChange.id;
		//         });
		//     });
		// }
		// if ($scope.entity.originChange && $scope.entity.destinyChange) {
		//     return FinanceUnitService.getSearch('name').then(function (data) {
		//         return data.data.values.filter((data) => {
		//             return data.id != $scope.entity.originChange.id && data.id != $scope.entity.destinyChange.id;
		//         });
		//     });
		// }
		// if (!$scope.entity.originChange && !$scope.entity.destinyChange) {
		//     return FinanceUnitService.getSearch('name', param)
		//         .then(function (data) {
		//             return data.data.values;
		//         });
		// }
		// if ($scope.entity.originChange) {
		// }


		// };

		// $scope.onSelectOrigin = function () {
		//     isUnitsValids('originChange');
		// };
		// $scope.onSelectDestiny = function () {
		//     isUnitsValids('destinyChange')
		// };

		// function isUnitsValids(attribute) {
		//     $timeout(function () {
		//         if (!!$scope.entity.originChange && !!$scope.entity.destinyChange &&
		//             $scope.entity.originChange.id === $scope.entity.destinyChange.id) {
		//             $scope.entity[attribute] = null;
		//         }
		//     })
		// }

		// $scope.disabledOpenCash = function (entity) {
		//     return $scope.disableOpening || entity.employee == null || (entity.group == null || entity.group.id == null) ||
		//         (entity.change && (entity.originChange == null || entity.destinyChange == null))
		// }
	};
}

module.exports = CashCheckinEmbeddedFormController;
