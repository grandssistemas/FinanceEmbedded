const receiptPrint = require('./../views/paymentPrint.html');

PayEmbeddedController.$inject = [
	'FinanceConfigurationService',
	'$scope',
	'$timeout',
	'TitleParcelPayService',
	'FinanceUnitService',
	'CheckingAccountService',
	'ThirdPartyChequeService',
	'gumgaController',
	'PaymentService',
	'$uibModal',
	'LocalCashService',
	'ChequePortfolioService',
	'$filter',
	'IndividualCreditService',
	'MoneyUtilsService',
	'PercentageFinanceUtilsService',
	'CreditCardAccountService'];

function PayEmbeddedController(
	FinanceConfigurationService,
	$scope,
	$timeout,
	TitleParcelPayService,
	FinanceUnitService,
	CheckingAccountService,
	ThirdPartyChequeService,
	gumgaController,
	PaymentService,
	$uibModal,
	LocalCashService,
	ChequePortfolioService,
	$filter,
	IndividualCreditService,
	MoneyUtilsService,
	PercentageFinanceUtilsService,
	CreditCardAccountService
) {
	$scope.configuration = {};
	gumgaController.createRestMethods($scope, FinanceConfigurationService, 'financeConfiguration');
	$scope.financeConfiguration.execute('get').on('getSuccess', (data) => {
		$scope.configuration = data.values[0];
	});
	$scope.showMenuPersonalCredit = false;

	gumgaController.createRestMethods($scope, LocalCashService, 'localcash');
	$scope.localcash.methods.search('name', '');

	gumgaController.createRestMethods($scope, ChequePortfolioService, 'chequeportfolio');
	$scope.chequeportfolio.methods.search('name', '');

	gumgaController.createRestMethods($scope, CreditCardAccountService, 'creditcard');
	$scope.creditcard.methods.search('name', '');

	gumgaController.createRestMethods($scope, ThirdPartyChequeService, 'thirdpartycheque');
	$scope.thirdpartycheque.methods.search('name', '');

	gumgaController.createRestMethods($scope, IndividualCreditService, 'individualCredit');

	gumgaController.createRestMethods($scope, FinanceUnitService, 'financeunit');

	$scope.getPersonalCredits = function (params) {
		return IndividualCreditService.getSearch('name', params).then((data) => {
			if (!$scope.configuration.displayPersonalCredit) {
				var toReturn = data.data.values;
			} else {
				var toReturn = data.data.values.filter((elem) => {
					return elem.individual.id === $scope.parcels[0].individual.id
				});
			}
			$scope.showMenuPersonalCredit = (toReturn.length > 0);
			return toReturn;
		});
	};

	$timeout(() => {
		$scope.getPersonalCredits('');
	});

	gumgaController.createRestMethods($scope, CheckingAccountService, 'checkingaccount');
	CheckingAccountService.resetDefaultState();

	$scope.parcels = TitleParcelPayService.getInstallmentsPayable();
	$scope.payment = {};
	$scope.payment.receipt = {
		name: ''
	};
	$scope.payment.parcels = $scope.parcels;
	$scope.payment.methodPayment = $scope.payment.methodPayment || [];
	$scope.payment.numberPayment = $scope.payment.numberPayment || 0;
	$scope.payment.companyCheck = $scope.payment.companyCheck || [];
	$scope.payment.companyCheck.availableIn = $scope.payment.companyCheck.availableIn || new Date();
	$scope.payment.momment = new Date();
	$scope.itemsSelected = [];
	$scope.cheques = {};
	$scope.cheques.data = [];
	$scope.filtered = [];
	$scope.chequeList = [];

	$scope.listCheques = (id, param) => {
		id = id || 0;

		param = param || '';
		return ThirdPartyChequeService.getAdvancedSearch(`lower(obj.issuer.name) like lower('%${param}%') and obj.portfolio.id = ${id} and obj.status = 'AVAILABLE'`)
			.then((data) => {
				$scope.chequeList = data.data.values;
			});
	};

	$scope.changeCheques = function () {
		$scope.payment.cheques = $scope.selectedValues;
	};
	$scope.uploadStart = function () {
	};
	$scope.uploadComplete = function (e) {
	};
	$scope.uploadAbort = function (e) {
	};
	$scope.uploadError = function (e) {
	};

	// Cacula o total das parcelas
	$scope.totalize = function () {
		let total = 0;
		for (let i = 0; i < $scope.payment.parcels.length; i++) {
			total += $scope.payment.parcels[i].value;
		}
		return total;
	};


	function getInterestValue(value, expiredDays) {
		const interest = value.interest.value;
		if (expiredDays) {
			return MoneyUtilsService.divideMoney(MoneyUtilsService.multiplyMoney(PercentageFinanceUtilsService.multiply6(interest, value.value), expiredDays), 30);
		}
		return 0;
	}

	function getPenaltyValue(value, expiredDays) {
		const penalty = value.penalty.value;
		if (expiredDays) {
			return MoneyUtilsService.roundMoney(PercentageFinanceUtilsService.multiply6(penalty, value.value));
		}
		return 0;
	}

	function getDiscountValue(value) {
		const discount = value.discount.value;
		return MoneyUtilsService.roundMoney(PercentageFinanceUtilsService.multiply6(discount, value.value));
	}

	$scope.getRemainingValue = (row) => {
		const expiredDays = getExpiredDays(row.expiration);
		const interestValue = getInterestValue(row, expiredDays);
		const penaltyValue = getPenaltyValue(row, expiredDays);
		const discountValue = getDiscountValue(row);

		const value = MoneyUtilsService.sumMoney(
			row.value,
			MoneyUtilsService.sumMoney(
				interestValue,
				MoneyUtilsService.sumMoney(penaltyValue, -discountValue)
			)
		);
		return MoneyUtilsService.sumMoney(value, -row.totalpayed);
	};

	// Calcula o total restante para o pagamento
	$scope.totalizeRemaining = function () {
		return $scope.payment.parcels.reduce((sum, current) => sum + $scope.getRemainingValue(current), 0);
		// var total = 0;
		// for (var i = 0; i < $scope.parcels.length; i++) {
		//     total += ($scope.parcels[i].remaining + $scope.parcels[i].calculedInterest + $scope.parcels[i].calculedPenalty);
		// }
		// return total;
	};
	$scope.total = $scope.totalizeRemaining();

	// Adicionar pagamento de dinheiro
	$scope.addPaymentMoney = function (payment) {
		$scope.focusValue = '';
		const methodPayment = {
			historic: 'Dinheiro',
			method: 'money',
			value: payment.value,
			destination: payment.money.financeUnit.name,
			financeUnit: payment.money.financeUnit
		};
		$scope.addPayment(methodPayment, 'money');
	};
	// Adicionar pagamento de cheque terceiro
	$scope.addPaymentCheck = function (payment) {
		$scope.focusValue = '';
		const methodPayment = {
			historic: 'Cheque Terceiro',
			method: 'check',
			selectedChecks: payment.check.checks,
			destination: payment.check.financeUnit.name,
			value: payment.value,
			financeUnit: payment.check.financeUnit
		};
		$scope.addPayment(methodPayment, 'check');
		$scope.focusValue = '';
		$scope.chequeList = [];
		$scope.cheques.data = [];
		$scope.payment.check = {};
		$scope.payment.check.checks = [];
	};


	// Adicionar pagamento de cheque empresa
	$scope.addPaymentCompanyCheck = function (payment) {
		$scope.focusValue = '';
		const methodPayment = {
			historic: 'Cheque Empresa',
			method: 'checkCompany',
			destination: `${payment.companyCheck.financeUnit.name}Nº Cheque: ${payment.companyCheck.numberCheck}`,
			chequeNumber: payment.companyCheck.numberCheck,
			value: payment.value,
			availableIn: payment.companyCheck.availableIn,
			financeUnit: payment.companyCheck.financeUnit
		};
		$scope.addPayment(methodPayment, 'checkCompany');
	};

	// Adicionar pagamento de Banco - TED / DOC
	$scope.addPaymentBank = function (payment) {
		$scope.focusValue = '';
		const methodPayment = {
			historic: `Banco - op: ${$scope.payment.type}`,
			type: $scope.payment.type,
			operationNumber: payment.docTed.operation,
			method: 'bank',
			value: payment.value,
			destination: `Conta Crédito: ${payment.docTed.financeUnit.name}`,
			financeUnit: payment.docTed.financeUnit
		};
		$scope.payment.type = null;
		$scope.addPayment(methodPayment, 'docTed');
	};

	// Adicionar pagamento de cartão
	$scope.addPaymentCard = function (payment) {
		$scope.focusValue = '';
		const methodPayment = {
			historic: 'Cartão',
			method: 'card',
			value: payment.value,
			destination: `Conta Corrente: ${payment.card.financeUnit.name}`,
			financeUnit: payment.card.financeUnit
		};
		$scope.addPayment(methodPayment, 'docTed');
	};

	// Adicionar pagamento de crédito
	$scope.addPaymentCredit = function (payment) {
		$scope.focusValue = '';
		const methodPayment = {
			historic: 'Crédito',
			method: 'credit',
			value: payment.value,
			destination: payment.credit.financeUnit.name,
			financeUnit: payment.credit.financeUnit
		};
		$scope.addPayment(methodPayment, 'credit');
	};

	// Adicionar os pagamento a lista
	$scope.addPayment = function (methodPayment, operation) {
		$scope.payment.numberPayment++;
		switch (operation) {
			case 'money':
				$scope.payment.money = null;
				break;
			case 'check':
				$scope.payment.check = null;
				break;
			case 'docTed':
				$scope.payment.docTed = null;
				break;
			case 'checkCompany':
				$scope.payment.companyCheck = null;
				break;
			case 'credit':
				$scope.payment.credit = null;
		}

		$scope.payment.value = null;
		$scope.payment.method = null;

		if ($scope.payment.numberPayment === 1) {
			$scope.payment.methodPayment[0] = methodPayment;
		} else {
			$scope.payment.methodPayment.push(methodPayment);
		}
		$scope.lastPayment = ($scope.totalizeRemaining() - $scope.totalPayment());
		$scope.payment.value = $scope.lastPayment;
	};

	// Total pago
	$scope.totalPayment = function () {
		let total = 0;
		angular.forEach($scope.payment.methodPayment, (list) => {
			total += list.value;
		});
		return total;
	};

	// Remover item da lista de metodo de pagamento
	$scope.removeLeaf = function (method, index) {
		method.splice(index, 1);
		$scope.lastPayment = ($scope.totalizeRemaining() - $scope.totalPayment());
		if (!$scope.payment.check) {
			$scope.payment.check = {};
			$scope.payment.check.checks = [];
			$scope.cheques.data = [];
			$scope.calcCheques();
		}
	};

	// Função para buscar os cheques da carteira
	$scope.$watch('payment.check.financeUnit', (checkFinanceUnit) => {
		if (angular.isObject(checkFinanceUnit) && checkFinanceUnit.type === 'ChequePortfolio') {
			search = 'obj.portfolio.id=' + checkFinanceUnit.id + "AND obj.status = 'AVAILABLE'";
			$scope.thirdpartycheque.methods.advancedSearch(search).on('advancedSearchSuccess', (data) => {
				$scope.cheques.data = data.values.filter(function (elem) {
					if ($scope.itemsSelected.length > 0) {
						for (var index = 0; index < $scope.itemsSelected.length; index++) {
							if (elem.id === $scope.itemsSelected[index].id) {
								return false;
							}
						}
					}
					return true;
				})
			});
		}
	});


	// Pega o total pago
	$scope.totalSelecionado = 0;
	$scope.selecionados = function (selecionado) {
		$scope.totalSelecionado = $scope.payment.check.checks.map((a) => a.value).reduce((a, b) => a + b, 0);
		$scope.payment.value = $scope.totalSelecionado;
		$scope.itemsSelected = $scope.payment.check.checks;
	};

	// Chamar o template para impressão do recibo
	$scope.printReceipt = function () {
		let value = $scope.totalPayment().toString();
		value = value.replace('.', ',');
		$scope.payment.numberInWords = $filter('gumgaNumberInWords')(value, true);
		$scope.payment.value = $scope.totalPayment().toFixed(2);
		$scope.printPaid($scope.payment);
	};

	$scope.printPaid = function (items) {
		const uibModalInstance = $uibModal.open({
			templateUrl: receiptPrint,
			controller: 'ReceivePrintEmbeddedController',
			size: 'lg',
			resolve: {
				items() {
					return items;
				}
			}
		});
		uibModalInstance.result.then(() => {

		});
	};

	// Configuração da tabela que mostra as parcelas selecionadas
	$scope.parcelsConfig = {
		columns: 'expiration, value,remaining,interest, penalty, discount, individual',
		materialTheme: true,
		columnsConfig: [{
			name: 'expiration',
			title: '<span>Vencimento</span>',
			content: '{{$value.expiration | date: "dd/MM/yyyy"}}'
		}, {
			name: 'value',
			title: '<span>Valor</span>',
			content: '{{$value.value | currency: "R$"}}'
		}, {
			name: 'interest',
			editable: true,
			title: '<span>Juros</span>',
			content: '<input type="text" ui-money-mask ' +
				'class="input-in-list" ' +
				'ng-change="$parent.$parent.updateTotal($value,interestValue,penaltyValue,discountValue)" ' +
				'ng-disabled="!$parent.$parent.isExpired($value.expiration)" ' +
				'ng-init="interestValue = $parent.$parent.calcInterestValue($value)" ' +
				'ng-model="interestValue">'
		}, {
			name: 'penalty',
			editable: true,
			title: '<span>Multa</span>',
			content: '<input type="text" ui-money-mask ' +
				'class="input-in-list" ' +
				'ng-change="$parent.$parent.updateTotal($value,interestValue,penaltyValue,discountValue)" ' +
				'ng-disabled="!$parent.$parent.isExpired($value.expiration)" ' +
				'ng-init="penaltyValue = $parent.$parent.calcPenaltyValue($value)" ' +
				'ng-model="penaltyValue">'
		}, {
			name: 'discount',
			editable: true,
			title: '<span>Desconto</span>',
			content: '<input type="text" ui-money-mask ' +
				'class="input-in-list" ' +
				'ng-change="$parent.$parent.updateTotal($value,interestValue,penaltyValue,discountValue)" ' +
				'ng-init="discountValue = $parent.$parent.calcDiscountValue($value)" ' +
				'ng-model="discountValue">'
		}, {
			name: 'remaining',
			title: '<span>Saldo</span>',
			content: '{{$parent.$parent.getRemainingValue($value) | currency: "R$"}}'
		}, {
			name: 'individual',
			title: '<span>Pessoa</span>',
			content: '{{$value.individual.name}}'
		}]
	};

	$scope.chequesConfig = {
		columns: 'chequeNumber, bank, branch, account, issuer, accountable, value',
		checkbox: true,
		selection: 'multi',
		columnsConfig: [
			{
				name: 'chequeNumber',
				title: '<span>Número do cheque</span>',
				content: '{{$value.chequeNumber}}'
			},
			{
				name: 'bank',
				title: '<span>Banco</span>',
				content: '{{$value.bank.name}}'
			},
			{
				name: 'branch',
				title: '<span>Agência</span>',
				content: '{{$value.branch}}'
			},
			{
				name: 'account',
				title: '<span>Conta</span>',
				content: '{{$value.account}}'
			},
			{
				name: 'issuer',
				title: '<span>Emitente</span>',
				content: '{{$value.issuer.name}}'
			},
			{
				name: 'accountable',
				title: '<span>Responsável</span>',
				content: '{{$value.accountable.name}}'
			},
			{
				name: 'value',
				title: '<span>Valor</span>',
				content: '{{$value.value | currency: "R$"}}'
			}
		]
	};

	// Calcula os cheque selecionado
	$scope.calcCheques = function (id) {
		if ($scope.payment.numberPayment >= 1) {
			$scope.payment.value = $scope.lastPayment;
		} else {
			let total = 0;
			angular.forEach($scope.selectedValues, (o) => {
				total += o.value;
			});
			if (total !== 0) {
				$scope.payment.value = total;
			} else {
				$scope.payment.value = $scope.total;
			}
		}
		document.getElementById(id).select();
	};


	$scope.makePayment = function (payment) {
		payment.momment = new Date();

		PaymentService.pay(payment)
			.then(() => {
				$scope.$ctrl.onBackClick();
			});

		if ($scope.itemsSelected.length > 0) {
			$scope.itemsSelected.forEach((data) => {
				data.status = 'PASSED_ALONG';
				$scope.thirdpartycheque.methods.put(data);
			});
		}
	};

	$scope.setarfocusPayment = function (value) {
		$scope.focusValue = value;
		switch (value) {
			case 'money':
				angular.element(document.getElementById('paymentMoneyFinanceunit'))
					.find('input')[1].focus();
				break;
			case 'check':
				angular.element(document.getElementById('paymentCheckFinanceunit'))
					.find('input')[1].focus();
				break;
			case 'ted':
				document.getElementById('paymentBankFinanceunit').focus();
				break;
			case 'companyCheck':
				angular.element(document.getElementById('paymentBank2Financeunit'))
					.find('input')[1].focus();
				break;
			case 'card':
				angular.element(document.getElementById('paymentCardFinanceunit'))
					.find('input')[1].focus();
				break;
			case 'credit':
				angular.element(document.getElementById('paymentCreditFinanceunit'))
					.find('input')[1].focus();
				break;
		}
	};

	$scope.selectAllText = function (id) {
		document.getElementById(id).focus();
		document.getElementById(id).select();
	};

	$scope.back = function () {
		$scope.$ctrl.onBackClick();
	};


	/**
	 * Nova tela de pagamento
	 */

	$scope.calcDiscountValue = ($value) => {
		if ($value.discount && $value.discount.value) {
			return MoneyUtilsService.multiplyMoney($value.discount.value, $value.value);
		}
		return 0;
	};
	$scope.calcPenaltyValue = ($value) => {
		const days = getExpiredDays($value.expiration);
		if (days && $value.penalty && $value.penalty.value) {
			return MoneyUtilsService.multiplyMoney($value.penalty.value, $value.value);
		}
		return 0;
	};
	$scope.calcInterestValue = ($value) => {
		const days = getExpiredDays($value.expiration);
		if (days && $value.interest && $value.interest.value) {
			return MoneyUtilsService.divideMoney(MoneyUtilsService.multiplyMoney(MoneyUtilsService.multiplyMoney($value.interest.value, $value.value), days), 30);
		}
		return 0;
	};

	$scope.totalReceive = function () {
		return $scope.payment.methodPayment.reduce((sum, current) => sum + current.value, 0);
	};

	$scope.updateTotal = (value, interrest, penalty, discount) => {
		const expiredDays = getExpiredDays(value.expiration);
		value.interest.value = getInterestPerc(value, interrest, expiredDays);
		value.penalty.value = getPenaltyPerc(value, penalty, expiredDays);
		value.discount.value = getDiscountPerc(value, discount);

		$scope.total = $scope.totalizeRemaining();
		$scope.lastPayment = ($scope.totalizeRemaining() - $scope.totalReceive());
	};


	function getExpiredDays(value) {
		const diff = moment(value).diff(moment(), 'days');
		return diff < 0 ? -diff : 0;
	}

	$scope.isExpired = getExpiredDays;

	function getInterestPerc(value, interrest, expiredDays) {
		if (expiredDays) {
			return PercentageFinanceUtilsService.multiply6(30, PercentageFinanceUtilsService.divide6(PercentageFinanceUtilsService.divide6(interrest, expiredDays), value.value));
		}
		return 0;
	}


	function getPenaltyPerc(value, penalty, expiredDays) {
		if (expiredDays) {
			return PercentageFinanceUtilsService.divide6(penalty, value.value);
		}
		return 0;
	}

	function getDiscountPerc(value, discount) {
		return PercentageFinanceUtilsService.divide6(discount, value.value);
	}

	$scope.getFinanceUnits = (param, name) => FinanceUnitService.findByOpenUnitGroup(name).then((data) => {
		$scope.financeunit.data = data.data.values;
		return data.data.values;
	});
}

module.exports = PayEmbeddedController;
