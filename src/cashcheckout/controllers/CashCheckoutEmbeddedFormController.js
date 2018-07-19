CashCheckoutEmbeddedFormController.$inject = ['$scope',
	'CashCheckinEmbeddedService',
	'GenericReportService',
	'CompanyService',
	'FinanceUnitService',
	'FinanceReportService',
	'SweetAlert',
	'MoneyUtilsService',
	'$filter',
	'$uibModal'
];

function CashCheckoutEmbeddedFormController(
	$scope,
	CashCheckinEmbeddedService,
	GenericReportService,
	CompanyService,
	FinanceUnitService,
	FinanceReportService,
	SweetAlert,
	MoneyUtilsService,
	$filter,
	$uibModal
) {
	$scope.$ctrl.$onInit = function () {
		$scope.entity = angular.copy($scope.$ctrl.entity);


		$scope.noCheckin = !$scope.entity;
		$scope.close = function (entity) {
			if (validateDiference(entity) && !$scope.noCheckin) {
				SweetAlert.swal(
					{
						title: 'Deseja realmente fechar o Caixa?',
						type: 'warning',
						showCancelButton: true,
						confirmButtonColor: '#DD6B55',
						confirmButtonText: 'Sim!',
						cancelButtonText: 'Não',
						closeOnConfirm: true,
						closeOnCancel: true
					},
					(isConfirm) => {
						if (isConfirm) {
							entity.cashCheckouts = entity.cashCheckouts || [];
							entity.cashCheckouts.push({
								date: new Date(),
								status: 'NORMAL',
								change: $scope.change,
								defaultTransfer: $scope.defaultTransfer
							});
							CashCheckinEmbeddedService.update(entity).then((resp) => {
								const cashier = resp.data.data;
								const baseState = '';
								SweetAlert.swal(
									{
										title: 'Confirmação',
										text: 'Deseja imprimir o relatório deste fechamento de caixa?',
										type: 'warning',
										showCancelButton: true,
										confirmButtonColor: '#DD6B55',
										confirmButtonText: 'Sim',
										cancelButtonText: 'Não',
										closeOnConfirm: true,
										closeOnCancel: true
									},
									(isConfirm) => {
										if (isConfirm) {
											const variables = [];
											GenericReportService.getDefault('CASHCHECKOUT').then((response) => {
												if (response.data) {
													CompanyService.variablesReport().then((vari) => {
														const variables = vari;
														const filters = '';
														variables.push(FinanceReportService.mountVariable('', 'idpdv', cashier.group.id));
														variables.push(FinanceReportService.mountVariable('', 'idcheckin', cashier.id));
														const modalInstance = $uibModal.open({
															animation: $scope.animationsEnabled,
															templateUrl: '/modules/stimulsoftreport/views/viewermodal.html',
															controller: 'ViewerController',
															backdrop: 'static',
															size: 'lg',
															resolve: {
																entity() {
																	return response.data;
																},
																filters() {
																	return filters;
																},
																variable() {
																	return variables;
																},
																backState() {
																	return '';
																}
															}
														});
													});
												} else {
													SweetAlert.swal('Falta de Relatório de Fechamento de Caixa', 'Você esta sem o relatório de fechamento de caixa, contate o suporte.', 'warning');
												}
											});
										}
									}
								);
								$scope.$ctrl.onGoHome();
							});
						}
					}
				);
			}
		};

		$scope.showWithoutMovement = false;

		$scope.showAccountsWithoutMovement = function (cashAccount) {
			if (cashAccount.movementedValue === null) {
				return false;
			}
			return !$scope.showWithoutMovement ? cashAccount.movementedValue !== 0 : true;
		};

		function calcMovement() {
			if ($scope.entity && $scope.entity.date) {
				CashCheckinEmbeddedService.getByCurrentCashCheckin($scope.entity.date)
					.then((data) => {
						$scope.entity.values = $scope.entity.group.financeUnits.map((financeUnit) => {
							const movementedValue = data.data.filter((entry) => financeUnit.id === entry.financeUnit.id).reduce((a, b) => MoneyUtilsService.sumMoney(a, b.value), 0);
							return { financeUnit, movementedValue, informedValue: 0 };
						});

						$scope.entity.values.sort((a, b) => Math.abs(b.movementedValue) - Math.abs(a.movementedValue));
					});
			}
		}

		calcMovement();

		function validateDiference(entity) {
			for (let i = 0; i < entity.values.length; i++) {
				if (!isComparationCorrect(entity.values[i], entity.destinyChange)) {
					SweetAlert.swal('Diferença de Valores!', `A conta ${entity.values[i].financeUnit.name
						} esta com diferença de valores, realize movimentações de caixa para corrigir antes de fechar.`, 'error');
					return false;
				}
			}
			return true;
		}

		function isComparationCorrect(value, destiny) {
			let change = 0;
			if (destiny && destiny.id === value.financeUnit.id) {
				change = $scope.change || 0;
			}
			return value.movementedValue === MoneyUtilsService.sumMoney(value.informedValue, change);
		}

		$scope.formatDate = function (date) {
			return $filter('date')(new Date(date), 'dd/MM/yyyy HH:mm:ss');
		};

		$scope.getDefaultTransfer = function (param) {
			param = param || '';
			let array = [];
			const hql = `${'(SELECT count(gUnit) ' +
				'FROM FinanceUnitGroup groups inner join groups.financeUnits gUnit ' +
				'WHERE groups.id = '}${$scope.entity.group.id} AND gUnit = obj) = 0 AND ` +
				`lower(obj.name) like '%${param}%'`;
			return FinanceUnitService.getAdvancedSearch(hql).then((data) => array = data.data.values.filter((item) => item.type !== 'IndividualCredit'));
		};

		$scope.disabledCloseCash = function () {
			return $scope.noCheckin || !transferAccountCorrect($scope.entity);
		};

		function transferAccountCorrect(entity) {
			return (entity.values && entity.values.reduce((a, b) => a && (b.financeUnit.defaultTransfer || !b.movementedValue), true)) || !!$scope.defaultTransfer;
		}

		$scope.showMovements = (financeUnit) => {
			$uibModal.open({
				animation: true,
				templateUrl: '/cashcheckout/views/BalanceModal.html',
				controller: 'BalanceModalController',
				backdrop: 'static',
				size: 'larger',
				resolve: {
					entries() {
						return FinanceUnitService.getEntriesByFinanceUnitAndCheckin(financeUnit.id, $scope.entity.id);
					},
					config() {
						return {
							title: `Listagem de movimentações da conta ${financeUnit.name}`,
							type: 'FINANCEUNIT'
						};
					}
				}
			});
		};

		$scope.showAllMovements = () => {
			$uibModal.open({
				animation: true,
				templateUrl: '/cashcheckout/views/BalanceModal.html',
				controller: 'BalanceModalController',
				backdrop: 'static',
				size: 'larger',
				resolve: {
					entries() {
						return FinanceUnitService.getEntriesByCheckin($scope.entity.id);
					},
					config() {
						return {
							title: 'Listagem de movimentações nesta abertura',
							type: 'ALL'
						};
					}
				}
			});
		};
	};
}

module.exports = CashCheckoutEmbeddedFormController;
