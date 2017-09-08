BalanceModalController.$inject = ['$scope',
    '$uibModalInstance',
    'entries',
    'config'
];

function BalanceModalController($scope,
                                $uibModalInstance,
                                entries,
                                config) {

    $scope.entries = angular.copy(entries.data.values);
    $scope.title = angular.copy(config.title);

    let columns = 'date, historic, financeunit, value, balance';
    config.type === 'FINANCEUNIT' ? columns = columns.replace('financeunit\,', '') : angular.noop();

    $scope.tableConfig = {
        columns,
        materialTheme: true,
        ordination: false,
        resizable: false,
        selection: false,
        columnsConfig: [
            {
                name: 'date',
                size: 'col-md-2',
                title: '<div>Data</div>',
                content: '<div>{{$value.momment | date:"dd/MM/yyyy HH:mm:ss"}}</div>'
            },{
                name: 'historic',
                size: 'col-md-4',
                title: '<div>Histórico</div>',
                content: '<div class="table-ellipsis">{{$value.historic }}</div>'
            },{
                name: 'financeunit',
                size: 'col-md-2',
                title: '<div>Unidade Financeira</div>',
                content: '<div><span>{{$value.financeUnitName }}</span></div>'
            },{
                name: 'value',
                size: 'col-md-2',
                title: '<div>Valor</div>',
                content: '<div><span ng-class="$value.value < 0 ? \'color-red\' : \'\'">{{$value.value | currency }}</span></div>'
            },{
                name: 'balance',
                size: 'col-md-2',
                title: '<div>Saldo</div>',
                content: '<div><span ng-class="$value.balance < 0 ? \'color-red\' : \'\'">{{$value.balance | currency }}</span></div>'
            }
        ]

    }
    $scope.close = () => {
        $uibModalInstance.close();
    }

}

module.exports = BalanceModalController;