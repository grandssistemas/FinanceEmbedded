PaymentsModalController.$inject = ['$scope',
    '$uibModalInstance',
    'payments'
];

function PaymentsModalController($scope,
                                 $uibModalInstance,
                                 payments) {

    $scope.payments = angular.copy(payments);

    $scope.payments.forEach(payment => {
        if (payment.value < 0){
            payment.value = payment.value * -1;
        }
    });


    $scope.tableConfig = {
        columns: 'name,date,value',
        selection: 'single',
        materialTheme: true,
        columnsConfig: [
            {
                name: 'name',
                size: 'col-md-4',
                title: '<strong >Unidade Financeira</strong>',
                content: '{{$value.financeUnit.name}}'
            },
            {
                name: 'date',
                size: 'col-md-2',
                title: '<strong >Data de Pagamento</strong>',
                content: '{{$value.momment | date:\'dd/MM/yyyy\'}}'
            },
            {
                name: 'value',
                size: 'col-md-2',
                title: '<strong>Valor</strong>',
                content: '<span>{{$value.value | currency}}</span>'
            }
        ]
    }


    $scope.close = () => {
        $uibModalInstance.close();
    }

}

module.exports = PaymentsModalController;