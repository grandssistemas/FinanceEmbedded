let template = require('./../views/receiptPrint.html');

TitleParcelReceiveListEmbeddedController.$inject = [
    'TitleService',
    'FinanceConfigurationService',
    '$uibModal',
    '$scope',
    'TitleParcelPayService',
    'gumgaController',
    '$timeout',
    'IndividualService'];

function TitleParcelReceiveListEmbeddedController(
    TitleService,
    FinanceConfigurationService,
    $uibModal,
    $scope,
    TitleParcelPayService,
    gumgaController,
    $timeout,
    IndividualService) {

    gumgaController.createRestMethods($scope, TitleParcelPayService, 'titleparcel');
    gumgaController.createRestMethods($scope, IndividualService, 'individual');
    gumgaController.createRestMethods($scope, FinanceConfigurationService, 'financeConfiguration');
    gumgaController.createRestMethods($scope, TitleService, 'title');

    $scope.isRenegotiate = false;
    $scope.financeConfiguration.execute('get').on('getSuccess', function (data) {
        $scope.isRenegotiate = data.values[0].isRenegotiate
    });
    TitleParcelPayService.resetDefaultState();
    IndividualService.resetDefaultState();

    $scope.endDate = null;
    $scope.containsReplaced = false;
    $scope.containsFullPaid = false;
    $scope.paidOut = false;
    $scope.lastClicked = null;
    $scope.aqFilterSelected = null;

    $scope.hideOthers = true;

    $scope.getParcels = function (date, page) {
        TitleParcelPayService.findOpenByMaxDate(date, 'RECEIVE', page, $scope.individualSearch, $scope.paidOut, $scope.aqFilterSelected)
            .then(function (data) {
                $scope.selectedValues = [];
                $scope.titleparcel.data = data.values;
                $scope.titleparcel.pageSize = data.pageSize;
                $scope.titleparcel.count = data.count;
            });
    };

    $scope.cleanFilter = function () {
        $scope.lastClicked = null;
        $scope.aqFilterSelected = null;
        delete $scope.filters;
        delete $scope.individualSearch;
        var aq = "obj.title.titleType='RECEIVE' AND (obj.fullPaid = false OR obj.fullPaid is null)";
        $scope.titleparcel.methods.advancedSearch(aq)
    };

    $scope.getParcels(null, 1);

    $scope.$watch('individualSearch', function (individual) {
        $scope.cleanFilter();
        $scope.individualSearch = individual;
        $scope.getParcels($scope.endDate, 1);
    });

    $scope.filter = function (whichFilter) {
        $scope.lastClicked = whichFilter;
        var aq = "obj.title.titleType='RECEIVE'";
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
            default:
            case 'today':
                aq = aq.concat(" AND obj.expiration='" + moment().format('YYYY-MM-DD') + "'");
                break
        }

        if ($scope.individualSearch && $scope.individualSearch.id) {
            aq = aq.concat(" AND obj.individual.name='" + $scope.individualSearch.name + "'")
        }

        if ($scope.paidOut) {
            aq = aq.concat("AND obj.title.titleType='RECEIVE' AND obj.fullPaid = true");
        } else {
            aq = aq.concat("AND obj.title.titleType='RECEIVE' AND (obj.fullPaid = false OR obj.fullPaid is null)");
        }
        $scope.aqFilterSelected = aq;

        $scope.titleparcel.methods.advancedSearch(aq)
    };

    $scope.searchByIndividual = function (individual) {
        $scope.getParcels($scope.endDate, 1);
    };

    $scope.receive = function (page) {
        $scope.lastClicked = null;
        $scope.aqFilterSelected = null;
        $scope.paidOut = true;

        TitleParcelPayService.findOpenByMaxDate(null, 'RECEIVE', page, $scope.individualSearch, $scope.paidOut, $scope.aqFilterSelected)
            .then(function (data) {
                $scope.selectedValues = [];
                $scope.titleparcel.data = data.values;
                $scope.titleparcel.pageSize = data.pageSize;
                $scope.titleparcel.count = data.count;
            });
    };

    $scope.toReceive = function (page) {
        $scope.lastClicked = null;
        $scope.aqFilterSelected = null;
        $scope.paidOut = false;

        TitleParcelPayService.findOpenByMaxDate(null, 'RECEIVE', page, $scope.individualSearch, $scope.paidOut, $scope.aqFilterSelected)
            .then(function (data) {
                $scope.selectedValues = [];
                $scope.titleparcel.data = data.values;
                $scope.titleparcel.pageSize = data.pageSize;
                $scope.titleparcel.count = data.count;
            });
    };

    $scope.totalize = function () {
        $timeout(function () {
            var total = 0;
            var increase = 0;
            angular.forEach($scope.selectedValues, function (o) {
                total += o.remaining;
                increase += o.calculedInterest + o.calculedPenalty;
            });

            var qtd = 0;
            var qtdPaid = 0;
            $scope.selectedValues.forEach(function (e) {
                if (e.isReplaced) {
                    qtd++
                }
                if (e.fullPaid) {
                    qtdPaid++
                }
            });

            $scope.containsReplaced = qtd > 0;

            $scope.containsFullPaid = qtdPaid > 0;

            $scope.increase = increase;
            $scope.total = total;
        });
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

    $scope.renegotiation = function (values) {
        TitleService.setRenegociationParcels(values);
        $scope.$ctrl.onRenegotiation();
    };

    $scope.tableConfig = {
        columns: 'documentNumber, parcel, individual, expiration, amount, calculedInterest, calculedPenalty, valuePay, value, status',
        checkbox: true,
        // sortDefault: 'expiration',
        selection: 'multi',
        materialTheme: true,
        itemsPerPage: [5, 10, 25, 50, 100],
        title:'Listagem de Receber Títulos',
        columnsConfig: [
            {
                name: 'documentNumber',
                title: '<span>Nº Doc.</span>',
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
                title: '<span>Valor Total</span>',
                content: '{{$value.value | currency: "R$"}}',
                sortField: 'value'
            },
            {
                name: 'calculedPenalty',
                title: '<span>Multa</span>',
                content: '{{$value.calculedPenalty | currency: "R$ "}} ',
                sortField: 'value'
            },
            {
                name: 'calculedInterest',
                title: '<span>Juros</span>',
                content: '{{$value.calculedInterest | currency: "R$ "}} ',
                sortField: 'value'
            },
            {
                name: 'valuePay',
                title: '<span>R$ Recebido</span>',
                content: '{{$value.totalpayed | currency: "R$"}}',
                sortField: 'value'
            },
            {
                name: 'value',
                title: '<span>R$ a receber</span>',
                content: '{{$value.remaining | currency: "R$"}}',
                sortField: 'value'
            },
            {
                name: 'status',
                title: '<span>Status</span>',
                content: '<span ng-if="$value.totalpayed == 0 && !$value.isReplaced" class="label label-info">Aberta</span>' +
                '<span ng-if="$value.fullPaid" class="label label-danger">Recebido</span>' +
                '<span ng-if="$value.isReplaced" class="label label-warning">Renegociada</span>' +
                '<span ng-if="($value.totalpayed > 0) && !$value.fullPaid" class="label label-warning">Amortizado</span>'
            }
        ]
    }

}

module.exports = TitleParcelReceiveListEmbeddedController;