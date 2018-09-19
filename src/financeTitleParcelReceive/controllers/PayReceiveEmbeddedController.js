const template = require('./../views/receiptPrint.html');

PayReceiveEmbeddedController.$inject = [
	'PersonService',
	'SweetAlert',
	'FinanceConfigurationService',
	'$scope',
	'$timeout',
	'IndividualCreditService',
	'TitleParcelPayService',
	'IndividualEmbeddedService',
	'DocTedService',
	'BankService',
	'CheckingAccountService',
	'LocalCashService',
	'ChequePortfolioService',
	'ThirdPartyChequeService',
	'gumgaController',
	'PaymentService',
	'$filter',
	'$uibModal',
	'CreditCardAccountService',
	'FinanceUnitService',
	'MoneyUtilsService',
	'PercentageFinanceUtilsService',
	'FinanceReportService'];

function PayReceiveEmbeddedController(
	PersonService,
	SweetAlert,
	FinanceConfigurationService,
	$scope,
	$timeout,
	IndividualCreditService,
	TitleParcelPayService,
	IndividualEmbeddedService,
	DocTedService,
	BankService,
	CheckingAccountService,
	LocalCashService,
	ChequePortfolioService,
	ThirdPartyChequeService,
	gumgaController,
	PaymentService,
	$filter,
	$uibModal,
	CreditCardAccountService,
	FinanceUnitService,
	MoneyUtilsService,
	PercentageFinanceUtilsService,
	FinanceReportService
) {
	gumgaController.createRestMethods($scope, FinanceConfigurationService, 'financeConfiguration');
	gumgaController.createRestMethods($scope, CheckingAccountService, 'checkingaccount');
	gumgaController.createRestMethods($scope, ChequePortfolioService, 'chequeportfolio');
	gumgaController.createRestMethods($scope, LocalCashService, 'localcash');
	gumgaController.createRestMethods($scope, ThirdPartyChequeService, 'thirdpartycheque');
	gumgaController.createRestMethods($scope, DocTedService, 'docted');
	gumgaController.createRestMethods($scope, TitleParcelPayService, 'titleParcel');
	gumgaController.createRestMethods($scope, IndividualEmbeddedService, 'individual');
	gumgaController.createRestMethods($scope, CreditCardAccountService, 'creditcardaccount');
	gumgaController.createRestMethods($scope, BankService, 'bank');
	gumgaController.createRestMethods($scope, PersonService, 'person');

	$scope.existsFinalConsumer = false;
	$scope.configuration = {};
	$scope.checkingaccount.methods.search('name', '');
	$scope.chequeportfolio.methods.search('name', '');
	$scope.localcash.methods.search('name', '');
	$scope.individual.methods.search('name', '');
	$scope.creditcardaccount.methods.search('name', '');
	$scope.bank.methods.search('name', '');

	$scope.hasLimit = (creditValue, payment) => ((creditValue * -1) >= payment.value);

	FinanceConfigurationService.get().then((response) => {
		$scope.configuration = response.data.values[0];
	});

	$scope.showMenuPersonalCredit = true;

	$scope.getPersonalCredits = function (params) {
		if (!$scope || !$scope.parcels || $scope.parcels.length == 0) return;
		const aq = `obj.name like '%${params || ''}%' and obj.individual.id = ${$scope.parcels[0].individual.id}`;
		return IndividualCreditService.getAdvancedSearch(aq, 10, 0).then((data) => {
			if (!$scope.configuration.displayPersonalCredit) {
				var toReturn = data.data.values;
			} else {
				var toReturn = data.data.values.filter((elem) => elem.individual.id === $scope.parcels[0].individual.id);
			}
			return toReturn;
		});
	};

	$timeout(() => {
		$scope.getPersonalCredits('');
	});

	$scope.valueThirdPartyChequeStatus = [
		{ value: 'AVAILABLE', label: 'Em Carteira - Disponível' },
		{ value: 'UNAVAILABLE', label: 'Em Carteira - Indisponível' },
		{ value: 'CASHED', label: 'Compensado' },
		{ value: 'RETURNED', label: 'Devolvido' },
		{ value: 'PASSED_ALONG', label: 'Repassado' }
	];

	$scope.parcels = TitleParcelPayService.getInstallmentsPayable();
	$scope.payment = {};
	$scope.payment.methodReceive = $scope.payment.methodReceive || [];
	$scope.payment.numberReceive = $scope.payment.numberReceive || 0;
	$scope.payment.parcels = $scope.parcels;
	$scope.payment.momment = new Date();
	$scope.isTed = true;
	$scope.receive = 0;

	$scope.person.methods.createQuery()
		.pageSize()
		.page()
		.send()
		.then(
			(resp) => {
				resp.data.values.forEach((value) => {
					if (value.id === $scope.parcels[0].individual.integrationValue.integrationId) {
						if (value.finalConsumer === true) {
							$scope.isFinalConsumer = true;
						}
					}
				});
			},
			(err) => {
				console.log(err);
			}
		);

	$scope.openMomment = function () {
		$scope.isDatePickerOpenMomment = !$scope.isDatePickerOpenMomment;
	};

	$scope.changeCheques = function () {
		$scope.payment.cheques = $scope.selectedValues;
	};

	$scope.open = function () {
		$scope.isDatePickerOpen = !$scope.isDatePickerOpen;
	};

	$scope.totalize = function () {
		return $scope.payment.parcels.reduce((sum, current) => sum + current.value, 0);
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

	$scope.totalizeRemaining = function () {
		return $scope.payment.parcels.reduce((sum, current) => sum + $scope.getRemainingValue(current), 0);
	};

	$scope.total = $scope.totalizeRemaining();

	$scope.makePayment = function (payment) {
		PaymentService.receive(payment)
			.then(() => {
				$scope.$ctrl.onMakePayment();
			});
	};

	$scope.open = function () {
		$scope.openedInsertMoment = !$scope.openedInsertMoment;
	};

	$scope.rowEdit = (row) => {
		const fields = ['interest', 'penalty', 'discount'];
		fields.forEach((field) => {
			if (typeof row[field] === 'string') {
				const newObj = {
					valueModifierOperation: (field === 'discount' ? 'DECREASE' : 'INCREASE'),
					valueModifierType: 'ABSOLUTE',
					value: parseFloat(row[field])
				};
				row[field] = newObj;
			}
		});
	};

	$scope.tableConfig = {
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


	$scope.isExpired = getExpiredDays;

	$scope.updateTotal = (value, interrest, penalty, discount) => {
		const expiredDays = getExpiredDays(value.expiration);
		value.interest.value = getInterestPerc(value, interrest, expiredDays);
		value.penalty.value = getPenaltyPerc(value, penalty, expiredDays);
		value.discount.value = getDiscountPerc(value, discount);

		$scope.total = $scope.totalizeRemaining();
		$scope.lastReceive = ($scope.totalizeRemaining() - $scope.totalReceive());
		// $scope.totalize();
	};

	function getExpiredDays(value) {
		const diff = moment(value).diff(moment(), 'days');
		return diff < 0 ? -diff : 0;
	}

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


	$scope.tableConfigCard = {
		columns: 'name',
		columnsConfig: [{
			name: 'name',
			title: '<span>Cartão</span>',
			content: '{{$value.name}}'
		}]
	};

	$scope.addReceiveMoney = function (receive) {
		$scope.focusValue = '';
		const methodReceive = {
			historic: 'Dinheiro',
			method: 'money',
			value: receive.value,
			destination: receive.money.financeUnit.name,
			financeUnit: receive.money.financeUnit
		};
		$scope.addReceive(methodReceive, 'money');
	};

	$scope.addReceiveCheck = function (receive) {
		$scope.focusValue = '';
		const methodReceive = {
			historic: 'Cheque',
			method: 'check',
			value: receive.value,
			destination: `Banco: ${receive.check.bank} Agência: ${receive.check.branch} Conta: ${receive.check.account}`,
			financeUnit: receive.check.portfolio,
			bank: receive.check.bank,
			availableIn: receive.check.validUntil,
			branch: receive.check.branch,
			account: receive.check.account,
			chequeNumber: receive.check.chequeNumber,
			issuerName: receive.check.issuer.name,
			issuerDocument: receive.check.issuer.document
		};
		$scope.addReceive(methodReceive, 'check');
	};

	$scope.addReceiveBank = function (receive) {
		$scope.focusValue = '';
		const methodReceive = {
			historic: $scope.isTed ? 'Banco - op: TED' : 'Banco - op: DOC',
			type: $scope.isTed ? 'TED' : 'DOC',
			method: 'bank',
			value: receive.value,
			destination: `Conta Crédito: ${receive.docTed.financeUnit.name}`,
			financeUnit: receive.docTed.financeUnit
		};
		$scope.addReceive(methodReceive, 'docTed');
	};

	$scope.addReceiveCard = function (receive) {
		$scope.focusValue = '';
		const methodReceive = {
			historic: 'Cartão',
			method: 'card',
			value: receive.value,
			destination: `Conta destino: ${receive.card.financeUnit.name}`,
			financeUnit: receive.card.financeUnit
		};
		$scope.addReceive(methodReceive, 'card');
	};

	$scope.addReceive = function (methodReceive, operation) {
		$scope.focusValue = '';
		$scope.payment.numberReceive++;
		switch (operation) {
			case 'docTed':
				$scope.payment.docTed = null;
			case 'money':
				$scope.payment.money = null;
			case 'check':
				$scope.payment.check = null;
			case 'card':
				$scope.payment.card = null;
		}
		$scope.payment.value = null;
		$scope.payment.method = null;

		if ($scope.payment.numberReceive === 1) {
			$scope.payment.methodReceive[0] = methodReceive;
		} else {
			$scope.payment.methodReceive.push(methodReceive);
		}
		$scope.lastReceive = ($scope.totalizeRemaining() - $scope.totalReceive());
		$scope.payment.value = $scope.lastPayment;
	};

	// Adicionar pagamento de crédito
	$scope.addReceiveCredit = function (payment) {
		$scope.focusValue = '';
		const methodPayment = {
			historic: 'Crédito',
			method: 'credit',
			value: payment.value,
			destination: payment.credit.financeUnit.name,
			financeUnit: payment.credit.financeUnit
		};
		$scope.addReceive(methodPayment, 'credit');
	};


	$scope.calcCheques = function (id) {
		$scope.payment.value = angular.copy($scope.total);
		document.getElementById(id).select();
	};

	$scope.totalReceive = function () {
		return $scope.payment.methodReceive.reduce((sum, current) => sum + current.value, 0);
	};

	$scope.removeLeaf = function (method, index) {
		method.splice(index, 1);
		$scope.lastReceive = ($scope.totalizeRemaining() - $scope.totalReceive());
	};

	$scope.printReceipt = function () {
		let value = $scope.totalReceive().toString();
		value = value.replace('.', ',');
		$scope.payment.numberInWords = $filter('gumgaNumberInWords')(value, true);
		$scope.payment.value = $scope.totalReceive().toFixed(2);
		$scope.printPaid($scope.payment);
	};

	$scope.printPaid = function (items) {
		const variables = [];
		variables.push('', 'parcelIds', items.map((item) => item.id));
		variables.push('', 'orgName', JSON.parse(window.sessionStorage.getItem('user')).organization);
		FinanceReportService.openModalViewer('RECEIPT', '', variables, () => {
			SweetAlert.swal('Falta de Recibos', 'Você esta sem o recibo configurado contate o suporte.', 'warning');
		});
	};

	$scope.makePayment = function (payment) {
		$scope.post = payment;
		const paymentDTO = angular.copy(payment);
		paymentDTO.momment = new Date();
		paymentDTO.parcels.forEach((parcel, index) => {
			paymentDTO.parcels[index].discount.value = paymentDTO.parcels[index].discount.value * 100;
			paymentDTO.parcels[index].interest.value = paymentDTO.parcels[index].interest.value * 100;
			paymentDTO.parcels[index].penalty.value = paymentDTO.parcels[index].penalty.value * 100;
		});

		PaymentService.receive(paymentDTO)
			.then((resp) => {
				const baseState = 'titleparcelreceive.list';
				SweetAlert.swal(
					{
						title: 'Confirmação',
						text: 'Deseja imprimir o recibo deste título?',
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
							variables.push(FinanceReportService.mountVariable('', 'idPayment', resp.data.id));

							FinanceReportService.openModalViewer('RECEIPTTITLE', [], variables, () => true, baseState);
						}
					}
				);
				$scope.$ctrl.onMakePayment();
			});
	};

	function emptyCheck() {
		$scope.payment.check.bank = '';
		$scope.payment.check.branch = '';
		$scope.payment.check.account = '';
		$scope.payment.check.chequeNumber = '';
		$scope.payment.check.issuer = { document: '', name: '' };
		$scope.payment.check.validUntil = '';
		$scope.payment.value = '';
	}

	$scope.setarfocusPayment = function (value) {
		$scope.focusValue = value;
		switch (value) {
			case 'money':
				angular.element(document.getElementById('paymentMoneyFinanceunit'))
					.find('input')[1].focus();
				break;
			case 'check':
				document.getElementById('paymentCheckFinanceunit').focus();
				emptyCheck();
				break;
			case 'bank':
				angular.element(document.getElementById('paymentBankFinanceunit'))
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

	$scope.balanceFinanceUnit = 0;
	$scope.onSelectPaymentCredit = function (financeUnit) {
		FinanceUnitService.getFinanceUnitBalance(financeUnit.id).then((data) => {
			$scope.balanceFinanceUnit = data.data > 0 ? 0 : data.data;
		});
	};

	$scope.onDeselectPaymentCredit = function (financeUnit) {
		$scope.balanceFinanceUnit = 0;
	};

	$scope.back = function () {
		$scope.$ctrl.onMakePayment();
	};

	$scope.getFinanceUnits = (param, name) => FinanceUnitService.findByOpenUnitGroup(name).then((data) => {
		$scope.financeunit.data = data.data.values;
		return data.data.values;
	});


	$scope.validadeCheck = (payment) => {
		if (payment && payment.check && (!payment.check.bank ||
			!payment.check.branch ||
			!payment.check.account ||
			!payment.check.chequeNumber ||
			!payment.check.portfolio ||
			!payment.check.validUntil ||
			!payment.value)) {
			return true;
		}
		if (payment && payment.check && payment.check.issuer && (
			!payment.check.issuer.document ||
			!payment.check.issuer.name)
		) {
			return true;
		}
		if (payment && payment.check && !payment.check.validUntil) return false;
		if (payment && payment.check && payment.check.validUntil) {
			const dateToCompare = payment.check.validUntil instanceof Date ? payment.check.validUntil : new Date(payment.check.validUntil);
			return (dateToCompare && moment(payment.check.validUntil).isBefore(new Date(), 'day'));
		}
	};
}

module.exports = PayReceiveEmbeddedController;
