import templateConfirmCashCheckout from '../views/confirm-cashcheckout-modal.html';
const viewModal = require('../../financereport/views/viewermodal.html');

CashCheckoutEmbeddedFormController.$inject = ['$scope',
	'CashCheckinEmbeddedService',
	'GenericReportService',
	'CompanyService',
	'FinanceUnitService',
	'FinanceReportService',
	'SweetAlert',
	'MoneyUtilsService',
	'$filter',
	'$timeout',
	'$uibModal',
	'MbgPageLoader'
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
	$timeout,
	$uibModal,
	MbgPageLoader
) {
	$scope.$ctrl.$onInit = function () {
		$scope.entity = angular.copy($scope.$ctrl.entity);

		const pdv = JSON.parse(localStorage.getItem('pdv')).pdv
		$scope.type = pdv.enableValue && pdv.enableValue.value ? 'NORMAL' : 'BLIND';

		$scope.noCheckin = !$scope.entity;

		$scope.beforeCashCheckout = (entity) => {
			const modalInstance = $uibModal.open({
				animation: true,
				templateUrl: templateConfirmCashCheckout,
				controller: 'ConfirmCashCheckoutModal',
				openedClass: 'modal-center',
				backdrop: 'static',
				size: 'md',
				resolve: {
					entity: () => entity,
					change: () => $scope.change,
				}
			});
			return modalInstance.result;
		}

		$scope.getTotalRemaining = () => {
			if (!$scope.entity || !$scope.entity.values) { return 0; }
			let remaining = 0;
			$scope.entity.values.forEach((account) => {
				remaining += ((account.informedValue - account.movementedValue) * -1);
			});
			return remaining;
		}

		$scope.getTotalMoney = () => {
			if (!$scope.entity || !$scope.entity.values) { return 0; }
			return $scope.entity.values
				.filter((account) => account.financeUnit.isRealMoneyAccount)
				.reduce((v, account) => {
					return v + account.movementedValue
				}, 0)
		}

		$scope.openModalConfirmClose = function (entity) {
			$scope.change = $scope.getTotalMoney();
			if ($scope.change == 0) {
				if (!$scope.noCheckin) {
					(entity.values).forEach((value, i) => {
						entity.values[i].informedValue = entity.values[i].movementedValue;
					})
					$scope.close(entity);
				}
				return
			}
			$scope.defaultTransfer = entity.destinyChange.defaultTransfer;
			$scope.beforeCashCheckout(entity).then((response) => {
				if (response && response.closeCashCheckout) {
					$scope.change = response.change;
					if (!$scope.noCheckin) {
						(entity.values).forEach((value, i) => {
							entity.values[i].informedValue = entity.values[i].movementedValue;
						})
						$scope.close(entity);
					}
				}
			}, () => {
				delete $scope.change;
			});
		};

		$scope.close = (entity) => {
			// entity.cashCheckouts = entity.cashCheckouts || [];
			// entity.cashCheckouts.push({
			// 	date: new Date(),
			// 	status: 'NORMAL',
			// 	change: $scope.change,
			// });
			CashCheckinEmbeddedService.close(entity.id, $scope.change).then((resp) => {
				const cashier = resp.data.data;
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
							$timeout(() => {
								const variables = [];
								GenericReportService.getDefault('CASHCHECKOUT').then((response) => {
									if (response.data) {
										CompanyService.variablesReport().then((vari) => {
											const variables = vari;
											const filters = '';
											variables.push(FinanceReportService.mountVariable('', 'idpdv', entity.group.id));
											variables.push(FinanceReportService.mountVariable('', 'idcheckin', entity.id));
											const modalInstance = $uibModal.open({
												animation: $scope.animationsEnabled,
												templateUrl: viewModal,
												controller: 'ViewerController',
												type: 'RELATORIOS',
												windowClass: 'full-modal',
												backdrop: 'static',
												size: 'lg',
												resolve: {
													type: () => `RELATORIOS`,
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
							})

						}
					}
				);

				$scope.$ctrl.onGoHome();
			});
		}

		$scope.showWithoutMovement = false;

		$scope.showAccountsWithoutMovement = function (cashAccount) {
			if (cashAccount.movementedValue === null) {
				return false;
			}
			return !$scope.showWithoutMovement ? cashAccount.movementedValue !== 0 : true;
		};

		function calcMovement() {
			if ($scope.entity && $scope.entity.date) {
                CashCheckinEmbeddedService.getByCurrentCashCheckin($scope.entity.date, pdv.idFinanceUnitGroup)
					.then((data) => {
						$scope.entity.values = $scope.entity.group.financeUnits.map((financeUnit) => {
							const movementedValue = data.data.filter((entry) => financeUnit.id === entry.financeUnit.id).reduce((a, b) => MoneyUtilsService.sumMoney(a, b.value), 0);
							const hasMovements = data.data.filter((entry) => financeUnit.id === entry.financeUnit.id).length > 0
							return { financeUnit, movementedValue, informedValue: 0, hasMovements };
						});

						$scope.entity.values.sort((a, b) => Math.abs(b.movementedValue) - Math.abs(a.movementedValue));
					});
			}
		}

		calcMovement();

		// function validateDiference(entity) {
		// 	for (let i = 0; i < entity.values.length; i++) {
		// 		if (!isComparationCorrect(entity.values[i], entity.destinyChange)) {
		// 			SweetAlert.swal('Diferença de Valores!', `A conta ${entity.values[i].financeUnit.name
		// 				} esta com diferença de valores, realize movimentações de caixa para corrigir antes de fechar.`, 'error');
		// 			return false;
		// 		}
		// 	}
		// 	return true;
		// }

		function isComparationCorrect(value, destiny) {
			let change = 0;
			if (destiny && destiny.id === value.financeUnit.id) {
				change = $scope.change || 0;
			}
			return value.movementedValue === MoneyUtilsService.sumMoney(value.informedValue, change);
		}

		$scope.stopClickPropagation = (evt) => evt.stopPropagation();

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

		$scope.getHoursIgnoreDate = (dateValue) => {
			const mommentInstance = moment(dateValue);
			return mommentInstance.hours() + ':' + mommentInstance.utc().minutes();
		}

		$scope.openDetailsAccount = (account, index) => {
			if (account.openDetails) {
				$scope.entity.values[index].openDetails = false;
				return;
			}
			const acordionDetails = () => {
				$scope.entity.values.forEach((value, i) => {
					$scope.entity.values[i].openDetails = false;
				});
				$scope.entity.values[index].openDetails = true;
			};
			if (account.moviments) {
				acordionDetails();
			} else {
				account.verified = false;
				const promisse = FinanceUnitService.getEntriesByFinanceUnitAndCheckin(account.financeUnit.id, $scope.entity.id);
				MbgPageLoader.open(promisse).finally(() => { });
				promisse.then((response) => {
					$scope.entity.values[index].moviments = response.data.values;
					$scope.entity.values[index].moviments.forEach((moviment) => {
						moviment.verified = false;
					})
					acordionDetails();
				});
			}
		};

		$scope.stopPropagation = (evt) => {
			evt.stopPropagation();
		}

		$scope.getTotalValue = () => {
			if (!$scope.entity || !$scope.entity.values) { return 0; }
			return $scope.entity.values.reduce((value, account) => {
				return value + account.movementedValue;
			}, 0);
		}

		$scope.handlingAccountVerified = (newValue, account) => {
			if ($scope.type == 'NORMAL') {
				$timeout(() => {
					(account.moviments || []).forEach((moviment) => {
						moviment.verified = newValue;
					});
				});
			}
			if ($scope.type == 'BLIND') {
				$timeout(() => {
					if (account.verifiedValue == account.movementedValue) {
						(account.moviments || []).forEach((moviment, i) => {
							account.moviments[i].verifiedValue = moviment.value;
						})
					}
				});
			}
		}

		$scope.checkVerifiedAccount = (account) => {
			if ($scope.type == 'NORMAL') {
				$timeout(() => {
					account.verified = (account.moviments || []).filter((moviment) => {
						return moviment.verified == false;
					}).length == 0;
				});
			}
			if ($scope.type == 'BLIND') {
				$timeout(() => {
					account.verifiedValue = (account.moviments || []).reduce((value, moviment) => {
						return value + moviment.verifiedValue;
					}, 0);
				});
			}
		}

		$scope.allAccountsVerified = () => {
			if ($scope.type == 'NORMAL') {
				return $scope.entity.values.filter((account) => {
					return (account.movementedValue < 0 || account.movementedValue > 0) && !account.verified;
				}).length == 0;
			}
			if ($scope.type == 'BLIND') {
				return $scope.entity.values.filter((account) => {
					return (account.movementedValue < 0 || account.movementedValue > 0) && account.verifiedValue != account.movementedValue;
				}).length == 0;
			}
		}

	};
}

module.exports = CashCheckoutEmbeddedFormController;
