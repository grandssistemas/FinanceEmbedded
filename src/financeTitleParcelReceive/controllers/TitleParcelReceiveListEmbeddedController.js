let template = require('./../views/receiptPrint.html');

TitleParcelReceiveListEmbeddedController.$inject = [
    'TitleService',
    'FinanceConfigurationService',
    '$scope',
    'TitleParcelPayService',
    'gumgaController',
    '$timeout',
    'IndividualEmbeddedService','FinanceReportService'];

function TitleParcelReceiveListEmbeddedController(TitleService,
                                                  FinanceConfigurationService,
                                                  $scope,
                                                  TitleParcelPayService,
                                                  gumgaController,
                                                  $timeout,
                                                  IndividualEmbeddedService,FinanceReportService) {

    let dateStart = null;
    let dateEnd = new Date();

    gumgaController.createRestMethods($scope, TitleParcelPayService, 'titleparcel');
    gumgaController.createRestMethods($scope, IndividualEmbeddedService, 'individual');
    gumgaController.createRestMethods($scope, FinanceConfigurationService, 'financeConfiguration');
    gumgaController.createRestMethods($scope, TitleService, 'title');

    $scope.isRenegotiate = false;
    $scope.financeConfiguration.execute('get').on('getSuccess', function (data) {
        $scope.isRenegotiate = data.values[0].isRenegotiate
    });
    TitleParcelPayService.resetDefaultState();
    IndividualEmbeddedService.resetDefaultState();

    $scope.endDate = null;
    $scope.containsReplaced = false;
    $scope.containsFullPaid = false;
    $scope.paidOut = false;
    $scope.lastClicked = null;
    $scope.aqFilterSelected = null;

    $scope.hideOthers = true;

    $scope.sort = function(field, dir){
        TitleParcelPayService.sort(field,dir).then(function (data) {
            $scope.selectedValues = [];
            $scope.titleparcel.data = data.data.values;
            $scope.titleparcel.pageSize = data.data.pageSize;
            $scope.titleparcel.count = data.data.count;
        });
    };

    $scope.getParcels = function () {
        let hql = "obj.title.titleType = 'RECEIVE' AND (obj.fullPaid = " + $scope.paidOut + " OR obj.fullPaid is null)";

        if (dateStart) {
            hql += " AND obj.expiration >= '" + moment(dateStart).format('YYYY-MM-DD') + " 00:00:00'";
        }
        if (dateEnd) {
            hql += " AND obj.expiration <= '" + moment(dateEnd).format('YYYY-MM-DD') + " 23:59:59'";
        }
        if ($scope.individualSearch) {
            hql += " AND obj.individual.id = " + $scope.individualSearch.id;
        }

        TitleParcelPayService.getAdvancedSearch(hql).then(function (data) {
            $scope.selectedValues = [];
            $scope.titleparcel.data = data.data.values;
            $scope.titleparcel.pageSize = data.data.pageSize;
            $scope.titleparcel.count = data.data.count;
        });
    };


    function cleanFilter() {
        $scope.lastClicked = null;
        $scope.aqFilterSelected = null;
        $scope.hideOthers = true;
        dateEnd = null;
        dateStart = null;
        delete $scope.filters;
        delete $scope.individualSearch;
        $scope.selectedSubType = '';
    }

    $scope.getParcels(null, 1);

    $scope.$watch('individualSearch', function (individual) {
        cleanFilter();
        $scope.individualSearch = individual;
        $scope.getParcels(null, 1);
    });

    $scope.filter = function (whichFilter) {
        $scope.lastClicked = whichFilter;
        let startDate;
        let endDate;
        switch (whichFilter) {
            case 'thisWeek':
                startDate = moment().startOf('isoWeek').subtract(1, 'days');
                endDate = moment().endOf('isoWeek').subtract(1, 'days');
                break;
            case 'thisMonth':
                startDate = moment().startOf('month');
                endDate = moment().endOf('month');
                break;
            case 'thisYear':
                startDate = moment().startOf('year');
                endDate = moment().endOf('year');
                break;
            case 'today':
                startDate = moment();
                endDate = moment();
                break;
            case 'custom':
                startDate = moment($scope.endDate);
                endDate = moment($scope.endDate);
                break;
        }
        $scope.changeSubTypeButton(whichFilter);
        dateStart = startDate?startDate._d:null;
        dateEnd = endDate?endDate._d:null;

        $scope.getParcels();


    };

    $scope.searchByIndividual = function (individual) {
        $scope.getParcels($scope.endDate, 1);
    };

    $scope.receive = function (label) {
        cleanFilter();
        $scope.lastClicked = null;
        $scope.aqFilterSelected = null;
        $scope.paidOut = label === 'RECEIVE';
        $scope.selectedSubType = '';
        delete $scope.filters;
        $scope.hideOthers = true;
        $scope.changeTypeButton(label);

        $scope.getParcels();
    };

    $scope.toReceive = function (page) {
        $scope.lastClicked = null;
        $scope.aqFilterSelected = null;
        $scope.paidOut = false;
        $scope.selectedSubType = '';
        delete $scope.filters;
        $scope.hideOthers = true;

        TitleParcelPayService.findOpenByMaxDate(null, 'RECEIVE', page, $scope.individualSearch, $scope.paidOut, $scope.aqFilterSelected)
            .then(function (data) {
                $scope.selectedValues = [];
                $scope.titleparcel.data = data.data.values;
                $scope.titleparcel.pageSize = data.data.pageSize;
                $scope.titleparcel.count = data.data.count;
                $scope.changeTypeButton('TORECEIVE');
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
        const variables = [];
        const sql = ' in ('.concat(items.parcels.reduce((final, current) => {
            return `${final},${current.id}`
        },'')).concat(')').replace('\(\,','\(');
        variables.push(FinanceReportService.mountVariable('', 'parcelIds',sql));
        variables.push(FinanceReportService.mountVariable('', 'orgName',JSON.parse(window.sessionStorage.getItem('user')).organization))
        FinanceReportService.openModalViewer('RECEIPT','',variables,()=>{
            SweetAlert.swal("Falta de Recibos", "Você esta sem o recibo configurado contate o suporte.", "warning");
        })
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
            const individualDefault = parcels[0].individual.name;
            let sameIndividual = true;
            let hasReversed = false;
            parcels.forEach((parcel) => {
                sameIndividual = sameIndividual && (parcel.individual.name === individualDefault)
                hasReversed = hasReversed || parcel.titleData.reversed;
            });


            if (sameIndividual && !hasReversed) {
                TitleParcelPayService.setInstallmentsPayable(parcels);
                $scope.$ctrl.onSameIndividual();
            } else {
                $scope.errorMessage = hasReversed ? 'Foram selecionados títulos já estornados. Não é possível fazer a movimentação desses títulos.': 'Foram selecionadas parcelas de fornecedores diferentes, altere sua seleção.';
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
        columns: 'documentNumber, parcel, individual, expiration, amount, calculedInterest, calculedPenalty, value, status',
        checkbox: true,
        selection: 'multi',
        materialTheme: true,
        itemsPerPage: [5, 10, 25, 50, 100],
        title: 'Listagem de Receber Títulos',
        columnsConfig: [
            {
                name: 'documentNumber',
                title: '<span>Nº Doc.</span>',
                content: '{{$value.titleData.documentNumber}}'
            },
            {
                name: 'parcel',
                title: '<span>Parcelas</span>',
                content: '{{$value.number}} / {{$value.titleData.parcelsCount}}'
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
                content: '{{$value.calculedPenalty | currency: "R$ "}} '
            },
            {
                name: 'calculedInterest',
                title: '<span>Juros</span>',
                content: '{{$value.calculedInterest | currency: "R$ "}} '
            },
            {
                name: 'value',
                title: '<span>R$ a receber</span>',
                content: '{{$value.remaining | currency: "R$"}}'
            },
            {
                name: 'status',
                title: '<span>Status</span>',
                content: '<span ng-if="!$value.titleData.reversed && $value.totalpayed == 0 && !$value.isReplaced" class="label label-info">Aberta</span>' +
                '<span ng-if="!$value.titleData.reversed && $value.fullPaid" class="label label-danger">Recebido</span>' +
                '<span ng-if="$value.titleData.reversed" class="label label-danger">Estornado</span>' +
                '<span ng-if="!$value.titleData.reversed && $value.isReplaced" class="label label-warning">Renegociada</span>' +
                '<span ng-if="!$value.titleData.reversed && ($value.totalpayed > 0) && !$value.fullPaid" class="label label-warning">Amortizado</span>'
            }
        ]
    };

    $scope.selectedType = 'TORECEIVE';

    $scope.buttonTypeClass = function (parameter) {
        return $scope.selectedType === parameter ? 'btn btn-danger' : 'btn btn-primary';
    };

    $scope.buttonSubTypeClass = function (parameter) {
        return $scope.selectedSubType === parameter ? 'btn btn-danger' : 'btn btn-info';
    };

    $scope.changeTypeButton = function (newType) {
        $scope.selectedType = newType;
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

module.exports = TitleParcelReceiveListEmbeddedController;