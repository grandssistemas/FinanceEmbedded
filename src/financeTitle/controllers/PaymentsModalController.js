PaymentsModalController.$inject = ['$scope',
    '$uibModalInstance',
    'PaymentService',
    'gumgaController',
    'parcelPayments'
];

function PaymentsModalController($scope,
                                 $uibModalInstance,
                                 PaymentService,
                                 gumgaController,
                                 parcelPayments) {

    gumgaController.createRestMethods($scope, PaymentService, 'payment');

    $scope.parcelPayments = angular.copy(parcelPayments);

    const getPayments = () => {
        const arr = [];
        $scope.parcelPayments.forEach((parcelPayment) => {
            var gQuery = new GQuery(new Criteria('pp.id', ComparisonOperator.EQUAL, parcelPayment.id))
                .join(new Join('obj.parcelPayments as pp', JoinType.INNER));
            arr.push($scope.payment.methods.asyncSearchWithGQuery(gQuery));
        });
        return Promise.all(arr).then((response) => {
            let toReturn = [];
            response.forEach((data) => data.forEach((payment) => {
                if (toReturn.filter((d) => angular.equals(d, payment)).length == 0) {
                    toReturn.push(payment);
                }
            }));
            return toReturn;
        })
    }

    const initialize = () => {
        $scope.messageLoading = 'Buscando pagamentos...';
        getPayments().then((payments) => {
            $scope.payments = payments;
            delete $scope.messageLoading;
        });
    }

    initialize();

    $scope.searchEntrys = (payment) => {
        PaymentService.getById(payment.id).then((paymentResponse) => {
            $scope.paymentDetails = paymentResponse.data;

            var newArr = [];
            $scope.parcelsPayment = [{}];
            angular.forEach($scope.paymentDetails.parcelPayments, function (value, key) {
                var exists = false;
                angular.forEach(newArr, function (val2, key) {
                    if (angular.equals(value.parcel.number, val2.parcel.number)) { exists = true };
                });
                if (exists == false && value.parcel.number != "") { newArr.push(value); }
            });
            newArr = newArr.reverse();
            $scope.parcelsPayment = newArr.map((data) => {
                return {
                    number: data.parcel.number
                }
            });

        });
    }

    $scope.back = () => {
        delete $scope.paymentDetails;
    }

    $scope.tableEntryConfig = {
        columns: 'name, value',
        selection: 'single',
        materialTheme: true,
        columnsConfig: [
            {
                name: 'name',
                size: 'col-md-2',
                title: '<strong >Unidade Financeira</strong>',
                content: '{{$value.financeUnit.name}}'
            },
            {
                name: 'value',
                size: 'col-md-2',
                title: '<strong>Valor</strong>',
                content: '<span>{{$value.value | currency}}</span>'
            }
        ]
    }

    $scope.tableConfig = {
        columns: 'date,value',
        selection: 'single',
        materialTheme: true,
        columnsConfig: [
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