ReceiveTitlePrintModalController.$inject = ['$scope',
    '$uibModalInstance',
    'id',
    'FinanceReportService',
    'SweetAlert'
];

function ReceiveTitlePrintModalController($scope,
                                $uibModalInstance,
                                id,
                                FinanceReportService,
                                SweetAlert) {

    $scope.options = [
        {value: 'Duplicata', key: 'DUPLICATE'},
        {value: 'Carnê', key: 'CARNET'},
        {value: 'Promissória', key: 'PROMISSORY'}
    ];

    $scope.print = function (type) {
        let variables = [];
        let title;
        let message;
        variables.add(FinanceReportService.mountVariable('Empresa', 'idTitle', id));

        switch (type) {
            case 'DUPLICATE':
                let user = JSON.parse(sessionStorage.getItem('user'));
                variables.add(FinanceReportService.mountVariable('Empresa', 'nameEmployee', user.name));
                title = "Falta de Relatorio de Duplicatas";
                message = "Você esta sem o relátorio de duplicatas contate o suporte.";
                break;
            case
            'CARNET':
                title = "Falta de Relatorio de Carnê";
                message = "Você esta sem o relátorio de carnê contate o suporte.";
                break;
            case
            'PROMISSORY':
                title = "Falta de Relatorio de Promissória";
                message = "Você esta sem o relátorio de promissória contate o suporte.";
                break;
        }
        FinanceReportService.openModalViewer(type, '', variables, () => {
            SweetAlert.swal(title, message, "warning");
        });
        $uibModalInstance.close();
    };

    $scope.close = () => {
        $uibModalInstance.close();
    }

}

module.exports = ReceiveTitlePrintModalController;