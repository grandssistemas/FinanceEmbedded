let template = require('./../views/receiptPrint.html');

PayReceiveEmbeddedController.$inject = [
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
    'FinanceUnitService'];

function PayReceiveEmbeddedController(FinanceConfigurationService,
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
                                      FinanceUnitService) {

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

    $scope.configuration = {};
    $scope.checkingaccount.methods.search('name', '');
    $scope.chequeportfolio.methods.search('name', '');
    $scope.localcash.methods.search('name', '');
    $scope.individual.methods.search('name', '');
    $scope.creditcardaccount.methods.search('name', '');
    $scope.bank.methods.search('name', '');


    FinanceConfigurationService.get().then(function (response) {
        $scope.configuration = response.data.values[0];
    });

    $scope.showMenuPersonalCredit = true;


    $scope.getPersonalCredits = function (params) {
        return IndividualCreditService.getSearch('name', params).then(function (data) {
            if (!$scope.configuration.displayPersonalCredit) {
                var toReturn = data.data.values;
            } else {
                var toReturn = data.data.values.filter(function (elem) {
                    return elem.individual.id === $scope.parcels[0].individual.id
                })
            }
            $scope.showMenuPersonalCredit = (toReturn.length > 0);
            return toReturn
        })
    };

    $timeout(function () {
        $scope.getPersonalCredits('')
    });

    $scope.valueThirdPartyChequeStatus = [
        {value: "AVAILABLE", label: "Em Carteira - Disponível"},
        {value: "UNAVAILABLE", label: "Em Carteira - Indisponível"},
        {value: "CASHED", label: "Compensado"},
        {value: "RETURNED", label: "Devolvido"},
        {value: "PASSED_ALONG", label: "Repassado"}
    ];

    $scope.parcels = TitleParcelPayService.getInstallmentsPayable();
    $scope.payment = {};
    $scope.payment.methodReceive = $scope.payment.methodReceive || [];
    $scope.payment.numberReceive = $scope.payment.numberReceive || 0;
    $scope.payment.parcels = $scope.parcels;
    $scope.payment.momment = new Date();
    $scope.isTed = true;
    $scope.receive = 0;

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
        return $scope.payment.parcels.reduce((sum, current) => {
            return sum + current.value;
        }, 0);
    };

    $scope.getRemainingValue = (row) => {
        return row.remaining + row.interest.value + row.penalty.value - row.discount.value
    }

    $scope.totalizeRemaining = function () {
        return $scope.payment.parcels.reduce((sum, current) => {
            return sum + $scope.getRemainingValue(current);
        }, 0);
    };

    $scope.total = $scope.totalizeRemaining();

    $scope.makePayment = function (payment) {
        PaymentService.receive(payment)
            .then(function () {
                $scope.$ctrl.onMakePayment();
            });
    };

    $scope.open = function () {
        $scope.openedInsertMoment = !$scope.openedInsertMoment;
    };

    $scope.rowEdit = (row) => {
        const fields = ['interest', 'penalty', 'discount'];
        fields.forEach(field => {
            if (typeof row[field] === 'string') {
                const newObj = {
                    valueModifierOperation: (field === 'discount' ? 'DECREASE' : 'INCREASE'),
                    valueModifierType: 'ABSOLUTE',
                    value: parseFloat(row[field])
                }

                row[field] = newObj;
            }

        })


    }

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
            content: '<input type="text" ui-money-mask ng-change="$parent.$parent.updateTotal()" ng-model="$value.interest.value">'
        }, {
            name: 'penalty',
            editable: true,
            title: '<span>Multa</span>',
            content: '<input type="text" ui-money-mask ng-change="$parent.$parent.updateTotal()" ng-model="$value.penalty.value">'
        }, {
            name: 'discount',
            editable: true,
            title: '<span>Desconto</span>',
            content: '<input type="text" ui-money-mask ng-change="$parent.$parent.updateTotal()" ng-model="$value.discount.value">'
        }, {
            name: 'remaining',
            title: '<span>Saldo</span>',
            content: '{{$parent.$parent.getRemainingValue($value) | currency: "R$"}}'
        }, {
            name: 'individual',
            title: '<span>Pessoa</span>',
            content: '{{$value.individual.name}}'
        }
        ]
    };


    $scope.updateTotal = () =>{
        console.log('total');
        $scope.total = $scope.totalizeRemaining();
        $scope.lastReceive = ($scope.totalizeRemaining() - $scope.totalReceive());
        $scope.totalize();
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
        var methodReceive = {
            historic: "Dinheiro",
            method: "money",
            value: receive.value,
            destination: receive.money.financeUnit.name,
            financeUnit: receive.money.financeUnit
        };
        $scope.addReceive(methodReceive, "money")
    };

    $scope.addReceiveCheck = function (receive) {
        var methodReceive = {
            historic: "Cheque",
            method: "check",
            value: receive.value,
            destination: "Banco: " + receive.check.bank + " Agência: " + receive.check.branch + " Conta: " + receive.check.account,
            financeUnit: receive.check.portfolio,
            bank: receive.check.bank,
            availableIn: receive.check.validUntil,
            branch: receive.check.branch,
            account: receive.check.account,
            chequeNumber: receive.check.chequeNumber,
            issuerName: receive.check.issuer.name,
            issuerDocument: receive.check.issuer.document
        };
        $scope.addReceive(methodReceive, "check")
    };

    $scope.addReceiveBank = function (receive) {
        var methodReceive = {
            historic: $scope.isTed ? "Banco - op: TED" : "Banco - op: DOC",
            type: $scope.isTed ? "TED" : "DOC",
            method: "bank",
            value: receive.value,
            destination: "Conta Crédito: " + receive.docTed.financeUnit.name,
            financeUnit: receive.docTed.financeUnit
        };
        $scope.addReceive(methodReceive, "docTed")
    };

    $scope.addReceiveCard = function (receive) {
        var methodReceive = {
            historic: "Cartão",
            method: "card",
            value: receive.value,
            destination: "Conta destino: " + receive.card.financeUnit.name,
            financeUnit: receive.card.financeUnit
        };
        $scope.addReceive(methodReceive, "card")
    };

    $scope.addReceive = function (methodReceive, operation) {
        $scope.payment.numberReceive++;
        switch (operation) {
            case "docTed":
                $scope.payment.docTed = null;
            case "money":
                $scope.payment.money = null;
            case "check":
                $scope.payment.check = null;
            case "card":
                $scope.payment.card = null
        }
        $scope.payment.value = null;
        $scope.payment.method = null;

        if ($scope.payment.numberReceive === 1) {
            $scope.payment.methodReceive[0] = methodReceive
        } else {
            $scope.payment.methodReceive.push(methodReceive)
        }
        $scope.lastReceive = ($scope.totalizeRemaining() - $scope.totalReceive());
        $scope.payment.value = $scope.lastPayment
    };

    // Adicionar pagamento de crédito
    $scope.addReceiveCredit = function (payment) {
        var methodPayment = {
            historic: "Crédito",
            method: "credit",
            value: payment.value,
            destination: payment.credit.financeUnit.name,
            financeUnit: payment.credit.financeUnit
        };
        $scope.addReceive(methodPayment, "credit")
    };


    $scope.calcCheques = function (id) {
        if ($scope.payment.numberReceive >= 1) {
            $scope.payment.value = $scope.lastReceive
        } else {
            var total = 0;
            angular.forEach($scope.selectedValues, function (o) {
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

    $scope.totalReceive = function () {
        return $scope.payment.methodReceive.reduce((sum, current) => {
            return sum + current.value;
        }, 0);
    };

    $scope.removeLeaf = function (method, index) {
        method.splice(index, 1);
        $scope.lastReceive = ($scope.totalizeRemaining() - $scope.totalReceive())
    };

    $scope.printReceipt = function () {
        var value = $scope.totalReceive().toString();
        value = value.replace('.', ',');
        $scope.payment.numberInWords = $filter('gumgaNumberInWords')(value, true);
        $scope.payment.value = $scope.totalReceive().toFixed(2);
        $scope.printPaid($scope.payment);
    };

    $scope.printPaid = function (items) {
        var uibModalInstance = $uibModal.open({
            templateUrl: template,
            controller: 'ReceivePrintEmbeddedController',
            size: "lg",
            resolve: {
                items: function () {
                    return items;
                }
            }
        });
        uibModalInstance.result.then(function () {

        });
    };

    $scope.makePayment = function (payment) {
        $scope.post = payment;
        PaymentService.receive(payment)
            .then(function () {
                $scope.$ctrl.onMakePayment();
            })
    }

    $scope.setarfocusPayment = function (value) {
        switch (value) {
            case 'money':
                angular.element(document.getElementById("paymentMoneyFinanceunit"))
                    .find('input')[1].focus();
                break
            case 'check':
                document.getElementById("paymentCheckFinanceunit").focus();
                break
            case 'bank':
                angular.element(document.getElementById("paymentBankFinanceunit"))
                    .find('input')[1].focus();
                break
            case 'card':
                angular.element(document.getElementById("paymentCardFinanceunit"))
                    .find('input')[1].focus();
                break
            case 'credit':
                angular.element(document.getElementById("paymentCreditFinanceunit"))
                    .find('input')[1].focus();
                break
        }
        ;
    };

    $scope.selectAllText = function (id) {
        document.getElementById(id).focus();
        document.getElementById(id).select();
    };

    $scope.balanceFinanceUnit = 0;
    $scope.onSelectPaymentCredit = function (financeUnit) {
        FinanceUnitService.getFinanceUnitBalance(financeUnit.id).then(function (data) {
            $scope.balanceFinanceUnit = data.data > 0 ? 0 : data.data;
        });
    };

    $scope.onDeselectPaymentCredit = function (financeUnit) {
        $scope.balanceFinanceUnit = 0;
    };

    $scope.back = function () {
        $scope.$ctrl.onMakePayment();
    };

}

module.exports = PayReceiveEmbeddedController;