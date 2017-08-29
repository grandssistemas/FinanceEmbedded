let template = require('./../views/receiptPrint.html');

PayReceiveEmbeddedController.$inject = [
    'FinanceConfigurationService',
    '$scope',
    '$timeout',
    'IndividualCreditService',
    'TitleParcelPayService',
    'IndividualService',
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
    'CreditCardAccountService'];

function PayReceiveEmbeddedController(
    FinanceConfigurationService,
    $scope,
    $timeout,
    IndividualCreditService,
    TitleParcelPayService,
    IndividualService,
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
    CreditCardAccountService) {

    gumgaController.createRestMethods($scope, FinanceConfigurationService, 'financeConfiguration');
    gumgaController.createRestMethods($scope, CheckingAccountService, 'checkingaccount');
    gumgaController.createRestMethods($scope, ChequePortfolioService, 'chequeportfolio');
    gumgaController.createRestMethods($scope, LocalCashService, 'localcash');
    gumgaController.createRestMethods($scope, ThirdPartyChequeService, 'thirdpartycheque');
    gumgaController.createRestMethods($scope, DocTedService, 'docted');
    gumgaController.createRestMethods($scope, TitleParcelPayService, 'titleParcel');
    gumgaController.createRestMethods($scope, IndividualService, 'individual');
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
        var total = 0;
        for (var i = 0; i < $scope.payment.parcels.length; i++) {
            total += $scope.payment.parcels[i].value;
        }
        return total;
    };

    $scope.totalizeRemaining = function () {
        var total = 0;
        for (var i = 0; i < $scope.parcels.length; i++) {
            total += $scope.parcels[i].remaining;
        }
        return total;
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

    $scope.tableConfig = {
        columns: 'expiration, value,remaining, individual',
        materialTheme: true,
        columnsConfig: [{
            name: 'expiration',
            title: '<span>Expiração</span>',
            content: '{{$value.expiration | date: "dd/MM/yyyy"}}'
        }, {
            name: 'value',
            title: '<span>Valor</span>',
            content: '{{$value.value | currency: "R$"}}'
        }, {
            name: 'remaining',
            title: '<span>Saldo</span>',
            content: '{{$value.remaining | currency: "R$"}}'
        }, {
            name: 'individual',
            title: '<span>Pessoa</span>',
            content: '{{$value.individual.name}}'
        }
        ]
    };

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


    $scope.calcCheques = function () {
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
    };

    function post(data, isTed) {
        data.momment = new Date(data.momment);
        var save = DocTedService.save(data),
            promise = isTed ? save.ted() : save.doc();

        promise.then(function () {
            $scope.$ctrl.onPost();
        })
    }

    $scope.totalReceive = function () {
        var total = 0;
        angular.forEach($scope.payment.methodReceive, function (list) {
            total += list.value
        });
        return total
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
}

module.exports = PayReceiveEmbeddedController;