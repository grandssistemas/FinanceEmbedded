let receiptPrint = require('./../views/paymentPrint.html');

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
    CreditCardAccountService) {

    $scope.configuration = {};
    gumgaController.createRestMethods($scope, FinanceConfigurationService, 'financeConfiguration');
    $scope.financeConfiguration.execute('get').on('getSuccess', function (data) {
        $scope.configuration = data.values[0]
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
    FinanceUnitService.resetDefaultState();


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

    $scope.listCheques = function (name, param) {
        // thirdpartycheque.methods.asyncSearch('name', param)
        $scope.cheques.data = []
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
        var total = 0;
        for (var i = 0; i < $scope.payment.parcels.length; i++) {
            total += $scope.payment.parcels[i].value;
        }
        return total;
    };
    // Calcula o total restante para o pagamento
    $scope.totalizeRemaining = function () {
        var total = 0;
        for (var i = 0; i < $scope.parcels.length; i++) {
            total += ($scope.parcels[i].remaining + $scope.parcels[i].calculedInterest + $scope.parcels[i].calculedPenalty);
        }
        return total;
    };
    $scope.total = $scope.totalizeRemaining();

    // Adicionar pagamento de dinheiro
    $scope.addPaymentMoney = function (payment) {
        var methodPayment = {
            historic: "Dinheiro",
            method: "money",
            value: payment.value,
            destination: payment.money.financeUnit.name,
            financeUnit: payment.money.financeUnit
        };
        $scope.addPayment(methodPayment, "money")
    };
    // Adicionar pagamento de cheque terceiro
    $scope.addPaymentCheck = function (payment) {
        var methodPayment = {
            historic: "Cheque Terceiro",
            method: "check",
            selectedChecks: payment.check.checks,
            destination: payment.check.financeUnit.name,
            value: payment.value,
            financeUnit: payment.check.financeUnit
        };
        $scope.addPayment(methodPayment, "check");
        $scope.cheques.data = [];
        $scope.payment.check = {};
        $scope.payment.check.checks = []
    };


    // Adicionar pagamento de cheque empresa
    $scope.addPaymentCompanyCheck = function (payment) {
        var methodPayment = {
            historic: "Cheque Empresa",
            method: "checkCompany",
            destination: payment.companyCheck.financeUnit.name + "Nº Cheque: " + payment.companyCheck.numberCheck,
            chequeNumber: payment.companyCheck.numberCheck,
            value: payment.value,
            availableIn: payment.companyCheck.availableIn,
            financeUnit: payment.companyCheck.financeUnit
        };
        $scope.addPayment(methodPayment, "checkCompany")
    };

    // Adicionar pagamento de Banco - TED / DOC
    $scope.addPaymentBank = function (payment) {
        var methodPayment = {
            historic: "Banco - op: " + $scope.payment.type,
            type: $scope.payment.type,
            operationNumber: payment.docTed.operation,
            method: "bank",
            value: payment.value,
            destination: "Conta Crédito: " + payment.docTed.financeUnit.name,
            financeUnit: payment.docTed.financeUnit
        };
        $scope.payment.type = null;
        $scope.addPayment(methodPayment, "docTed")
    };

    // Adicionar pagamento de cartão
    $scope.addPaymentCard = function (payment) {
        var methodPayment = {
            historic: "Cartão",
            method: "card",
            value: payment.value,
            destination: "Conta Corrente: " + payment.card.financeUnit.name,
            financeUnit: payment.card.financeUnit
        };
        $scope.addPayment(methodPayment, "docTed")
    };

    // Adicionar pagamento de crédito
    $scope.addPaymentCredit = function (payment) {
        var methodPayment = {
            historic: "Crédito",
            method: "credit",
            value: payment.value,
            destination: payment.credit.financeUnit.name,
            financeUnit: payment.credit.financeUnit
        };
        $scope.addPayment(methodPayment, "credit")
    };

    // Adicionar os pagamento a lista
    $scope.addPayment = function (methodPayment, operation) {
        $scope.payment.numberPayment++;
        switch (operation) {
            case "money":
                $scope.payment.money = null;
                break;
            case "check":
                $scope.payment.check = null;
                break;
            case "docTed":
                $scope.payment.docTed = null;
                break;
            case "checkCompany":
                $scope.payment.companyCheck = null;
                break;
            case "credit":
                $scope.payment.credit = null;
        }

        $scope.payment.value = null;
        $scope.payment.method = null;

        if ($scope.payment.numberPayment === 1) {
            $scope.payment.methodPayment[0] = methodPayment
        } else {
            $scope.payment.methodPayment.push(methodPayment)
        }
        $scope.lastPayment = ($scope.totalizeRemaining() - $scope.totalPayment());
        $scope.payment.value = $scope.lastPayment
    };

    // Total pago
    $scope.totalPayment = function () {
        var total = 0;
        angular.forEach($scope.payment.methodPayment, function (list) {
            total += list.value
        });
        return total
    };

    // Remover item da lista de metodo de pagamento
    $scope.removeLeaf = function (method, index) {
        method.splice(index, 1);
        $scope.lastPayment = ($scope.totalizeRemaining() - $scope.totalPayment());
        if (!$scope.payment.check) {
            $scope.payment.check = {};
            $scope.payment.check.checks = [];
            $scope.cheques.data = [];
            $scope.calcCheques()
        }
    };

    //Função para buscar os cheques da carteira
    $scope.$watch('payment.check.financeUnit', function (checkFinanceUnit) {
        if (angular.isObject(checkFinanceUnit) && checkFinanceUnit.type === 'ChequePortfolio') {
            search = "obj.portfolio.id=" + checkFinanceUnit.id + "AND obj.status = 'AVAILABLE'";
            $scope.thirdpartycheque.methods.advancedSearch(search).on('advancedSearchSuccess', function (data) {
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
            })
        }
    });


    // Pega o total pago
    $scope.totalSelecionado = 0;
    $scope.selecionados = function (selecionado) {
        $scope.totalSelecionado += selecionado.value;
        $scope.payment.value = $scope.totalSelecionado;
        $scope.itemsSelected = $scope.payment.check.checks;
    };

    // Chamar o template para impressão do recibo
    $scope.printReceipt = function () {
        var value = $scope.totalPayment().toString();
        value = value.replace('.', ',');
        $scope.payment.numberInWords = $filter('gumgaNumberInWords')(value, true);
        $scope.payment.value = $scope.totalPayment().toFixed(2);
        $scope.printPaid($scope.payment);
    };

    $scope.printPaid = function (items) {
        var uibModalInstance = $uibModal.open({
            templateUrl: receiptPrint,
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

    // Configuração da tabela que mostra as parcelas selecionadas
    $scope.parcelsConfig = {
        columns: 'docNumber, parcels, remaining, expiration',
        materialTheme: true,
        columnsConfig: [
            {
                name: 'docNumber',
                title: '<span>Nº Doc</span>',
                content: '{{$value.titleData.documentNumber}}'
            },
            {
                name: 'parcels',
                title: '<span>Parcela</span>',
                content: '{{$value.number}} / {{$value.titleData.parcelsCount}}'
            },
            {
                name: 'remaining',
                title: '<span>A pagar</span>',
                content: '{{($value.remaining) | currency: "R$ "}}'
            },
            {
                name: 'expiration',
                title: '<span>Vencimento</span>',
                content: '{{$value.expiration | date: "dd/MM/yyyy"}}'
            }
        ]
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
    $scope.calcCheques = function () {
        if ($scope.payment.numberPayment >= 1) {
            $scope.payment.value = $scope.lastPayment
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


    $scope.makePayment = function (payment, generalDiscount) {
        for (var index = 0; index < payment.parcels.length; index++) {
            payment.parcels[index].discount.value = generalDiscount
        }
        $scope.printReceipt();
        PaymentService.pay(payment)
            .then(function () {
                // $state.go('titleparcel.list');
                $scope.$ctrl.onBackClick();
            });

        if ($scope.itemsSelected.length > 0) {
            $scope.itemsSelected.forEach(function (data) {
                data.status = "UNAVAILABLE";
                $scope.thirdpartycheque.methods.put(data)
            })
        }

    }

}

module.exports = PayEmbeddedController;
