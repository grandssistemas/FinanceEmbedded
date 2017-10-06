let receiptPrint = require('./../views/paymentPrint.html');

TitleParcelPayListEmbeddedController.$inject = [
    '$uibModal',
    '$scope',
    'TitleParcelPayService',
    'gumgaController',
    '$timeout',
    'IndividualEmbeddedService'];

function TitleParcelPayListEmbeddedController(
    $uibModal,
    $scope,
    TitleParcelPayService,
    gumgaController,
    $timeout,
    IndividualEmbeddedService) {

    gumgaController.createRestMethods($scope, TitleParcelPayService, 'titleparcelPay');
    gumgaController.createRestMethods($scope, IndividualEmbeddedService, 'individual');

    TitleParcelPayService.resetDefaultState();
    IndividualEmbeddedService.resetDefaultState();

    $scope.endDate = new Date();
    $scope.paidOut = false;
    $scope.containsFullPaid = false;
    $scope.lastClicked = null;
    $scope.aqFilterSelected = null;

    $scope.getParcels = function (date, page) {
        TitleParcelPayService.findOpenByMaxDate(date, 'PAY', page, $scope.individualSearch, $scope.paidOut, $scope.aqFilterSelected)
            .then(function (data) {
                $scope.selectedValues = [];
                $scope.titleparcelPay.data = data.data.values;
                $scope.titleparcelPay.pageSize = data.data.pageSize;
                $scope.titleparcelPay.count = data.data.count;
            });

    };

    $scope.cleanFilter = function () {
        $scope.lastClicked = null;
        $scope.aqFilterSelected = null;
        delete $scope.filters;
        delete $scope.individualSearch;
        $scope.selectedSubType = '';
    };

    $scope.$watch('individualSearch', function (individual) {
        $scope.cleanFilter();
        $scope.individualSearch = individual;
        $scope.getParcels(null, 1);
    });

    $scope.filter = function (whichFilter) {
        $scope.lastClicked = whichFilter;
        var aq = "obj.title.titleType='PAY'";
        switch (whichFilter) {
            case 'thisWeek':
                aq = aq.concat(" AND obj.expiration >='" + moment().startOf('isoWeek').subtract(1, 'days').format('YYYY-MM-DD') + "' AND obj.expiration <='" + moment().endOf('isoWeek').subtract(1, 'days').format('YYYY-MM-DD') + "'");
                break;
            case 'thisMonth':
                aq = aq.concat(" AND obj.expiration >='" + moment().startOf('month').format('YYYY-MM-DD') + "' AND obj.expiration <='" + moment().endOf('month').format('YYYY-MM-DD') + "'");
                break;
            case 'thisYear':
                aq = aq.concat(" AND obj.expiration >='" + moment().startOf('year').format('YYYY-MM-DD') + "' AND obj.expiration <='" + moment().endOf('year').format('YYYY-MM-DD') + "'");
                break;
            case 'today':
                aq = aq.concat(" AND obj.expiration >='" + moment().format('YYYY-MM-DD') + " 00:00:00" + "' AND obj.expiration <='" + moment().format('YYYY-MM-DD') + " 23:59:59" + "' " );
                break;
            case 'custom':
                aq = aq.concat(" AND obj.expiration >='" + moment($scope.endDate).format('YYYY-MM-DD') + " 00:00:00" + "' AND obj.expiration <='" + moment($scope.endDate).format('YYYY-MM-DD') + " 23:59:59" + "' " );
                break;
        }

        if ($scope.individualSearch && $scope.individualSearch.id) {
            aq = aq.concat(" AND obj.individual.name='" + $scope.individualSearch.name + "'")
        }

        if ($scope.paidOut) {
            aq = aq.concat(" AND obj.title.titleType='PAY' AND obj.fullPaid = true");
        } else {
            aq = aq.concat(" AND obj.title.titleType='PAY' AND (obj.fullPaid = false OR obj.fullPaid is null)");
        }
        $scope.aqFilterSelected = aq;
        $scope.titleparcelPay.methods.advancedSearch(aq);
        $scope.changeSubTypeButton(whichFilter);
    };

    $scope.paid = function (page) {
        $scope.lastClicked = null;
        $scope.aqFilterSelected = null;
        $scope.paidOut = true;
        $scope.selectedSubType = '';
        delete $scope.filters;

        TitleParcelPayService.findOpenByMaxDate(null, 'PAY', page, $scope.individualSearch, $scope.paidOut, $scope.aqFilterSelected)
            .then(function (data) {
                $scope.selectedValues = [];
                $scope.titleparcelPay.data = data.data.values;
                $scope.titleparcelPay.pageSize = data.data.pageSize;
                $scope.titleparcelPay.count = data.data.count;
                $scope.changeTypeButton('paid');
            });
    };

    $scope.pays = function (page) {
        $scope.lastClicked = null;
        $scope.aqFilterSelected = null;
        $scope.paidOut = false;
        $scope.selectedSubType = '';
        delete $scope.filters;

        TitleParcelPayService.findOpenByMaxDate(null, 'PAY', page, $scope.individualSearch, $scope.paidOut, $scope.aqFilterSelected)
            .then(function (data) {
                $scope.selectedValues = [];
                $scope.titleparcelPay.data = data.data.values;
                $scope.titleparcelPay.pageSize = data.data.pageSize;
                $scope.titleparcelPay.count = data.data.count;
                $scope.changeTypeButton('pays');
            });
    };

    $scope.totalize = function () {
        $timeout(function () {
            var total = 0;
            var increase = 0;
            $scope.containsFullPaid = false;
            angular.forEach($scope.selectedValues, function (o) {
                total += o.remaining;
                increase += o.calculedInterest + o.calculedPenalty;
                if (o.fullPaid) {
                    $scope.containsFullPaid = true;
                }
            });
            $scope.increase = increase;
            $scope.total = total;
        });
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


    $scope.individualCheckAndPay = function (parcels, $containsFullPaid) {
        if ($containsFullPaid) {
            var totalValue = 0;
            $scope.selectedValues.forEach(function (data) {
                totalValue += data.totalpayed;
            });
            $scope.recibo = {value: totalValue};
            $scope.recibo.parcels = $scope.selectedValues;
            $scope.printPaid($scope.recibo);
        } else {
            var len = parcels.length;
            var individualDefault;
            var sameIndividual = true;
            for (var x = 0; x < len; x++) {
                var parcel = parcels[x];
                x === 0 ? individualDefault = parcel.individual.name :
                    individualDefault !== parcel.individual.name
                        ? sameIndividual = false : angular.noop;
            }
            if (sameIndividual) {
                TitleParcelPayService.setInstallmentsPayable(parcels);
                $scope.$ctrl.onSameIndividual();
            } else {
                $scope.errorMessage = 'Foram selecionadas parcelas de fornecedores diferentes, altere sua seleção.';
                $timeout(function () {
                    delete $scope.errorMessage;
                }, 5000);
            }
        }
    };

    $scope.tableConfig = {
        columns: 'documentNumber, parcel, individual, expiration, amount, calculedInterest, calculedPenalty, valuePay, value, status',
        checkbox: true,
        selection: 'multi',
        // sortDefault: 'expiration',
        materialTheme: true,
        itemsPerPage: [5, 10, 25, 50, 100],
        title:'Listagem de Pagar Títulos',
        columnsConfig: [
            {
                name: 'documentNumber',
                title: '<span>Nº Doc</span>',
                content: '{{$value.titleData.documentNumber}}',
                sortField: 'number'
            },
            {
                name: 'parcel',
                title: '<span>Parcelas</span>',
                content: '{{$value.number}} / {{$value.titleData.parcelsCount}}',
                sortField: 'number'
            },
            {
                name: 'individual',
                title: '<span>Pessoa</span>',
                content: '{{$value.individual.name}}',
                sortField: 'individual.name'
            },
            {
                name: 'expiration',
                title: '<span>Vencimento</span>',
                content: '{{$value.expiration | date: "dd/MM/yyyy"}}',
                sortField: 'expiration'
            },
            {
                name: 'amount',
                title: '<span>Valor</span>',
                content: '{{$value.value | currency: "R$"}}',
                sortField: 'value'
            },
            {
                name: 'calculedPenalty',
                title: '<span>Multa</span>',
                content: '{{$value.calculedPenalty | currency: "R$ "}} '
            },
            {
                name: 'calculedInterest',
                title: '<span>Juros</span>',
                content: '{{$value.calculedInterest | currency: "R$ "}} '
            },
            {
                name: 'valuePay',
                title: '<span>Pago</span>',
                content: '{{($value.totalpayed) | currency: "R$"}}'
            },
            {
                name: 'value',
                title: '<span>A pagar</span>',
                content: '{{$value.remaining | currency: "R$"}}'
            },
            {
                name: 'status',
                title: '<span>Status</span>',
                content: '<span ng-if="$value.totalpayed == 0" class="label label-info">Aberta</span>' +
                '<span ng-if="$value.fullPaid" class="label label-danger">Pago</span>' +
                '<span ng-if="($value.totalpayed > 0) && !$value.fullPaid" class="label label-warning">Amortizado</span>'
            }
        ]
    }

    $scope.selectedType = 'pays';
    $scope.buttonTypeClass = function (parameter) {
        return $scope.selectedType === parameter ? 'btn btn-danger' : 'btn btn-primary';
    };

    $scope.changeTypeButton = function (newType) {
        $scope.selectedType = newType;
    };

    $scope.buttonSubTypeClass = function (parameter) {
        return $scope.selectedSubType === parameter ? 'btn btn-danger' : 'btn btn-info';
    };

    $scope.changeSubTypeButton = function (newType) {
        $scope.selectedSubType = newType;
    };

    $scope.configData = {
        change : function (data) {
            $scope.filter('custom');
        }
    }

}

module.exports = TitleParcelPayListEmbeddedController;
