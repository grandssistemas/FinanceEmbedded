const TitlePayListController = ($scope, gumgaController, TitleService) => {
    TitleService.resetDefaultState();
    gumgaController.createRestMethods($scope, TitleService, 'title')

    $scope.currentPage = 1;

    $scope.toPage = (page) => {
        $scope.currentPage = page;
        TitleService.findTitleWithParticipations('PAY', page).then((response) => {
            $scope.title.data = response.data.values;
            $scope.title.count = response.data.count;
        })
    };

    $scope.toPage($scope.currentPage);


    $scope.changePage = () => {
        $scope.$emit('changeTitlePay', 'form')
    }

    $scope.tableConf = {
        columns: 'titleType, issuedAt,documentNumber, participationsFormatted, postedAt, docname, value, btns',
        materialTheme: true,
        itemsPerPage: [5, 10, 25, 50, 100],
        title: 'Listagem de Contas a Pagar',
        columnsConfig: [
            {
                name: 'titleType',
                title: '<span>A Pagar</span>',
                content: '<span style="">{{$value.titleType == \'PAY\' ? \'A PAGAR\' : \'A RECEBER\'}}</span>',
                size: 'col-md-2 col-lg-1'

            }, {
                name: 'issuedAt',
                title: '<span>Data Criação</span>',
                content: '<span>{{$value.emissionDate | date: \'dd/MM/yyyy\' }}</span>'

            }, {
                name: 'documentNumber',
                title: '<span>Número Documento</span>',
                content: '<span>{{$value.documentNumber}}</span>'

            }, {
                name: 'participationsFormatted',
                title: '<span>Participação</span>',
                content: '<div uib-tooltip="{{$value.participationsFormatted}}" ng-class="{\'text-overflow-list\':$value.participations.length == 1, \'text-align-center\':$value.participations.length > 1}">' +
                '<i class=" glyphicon glyphicon-user"></i><i class=" glyphicon glyphicon-user" ng-if="$value.participations.length > 1"></i>' +
                '&nbsp;<span ng-if="$value.participations.length == 1">{{$value.participationsFormatted}}</span></div>'

            }, {
                name: 'postedAt',
                title: '<span>Vencimento</span>',
                content: '<span>{{$value.postedAt | date: \'dd/MM/yyyy\'}}</span>'

            }, {
                name: 'docname',
                title: '<span>Tipo Documento</span>',
                content: '<span>{{$value.documentType.name}}</span>'

            }, {
                name: 'value',
                title: '<span>Valor</span>',
                content: '<span>{{$value.value | currency}}</span>'

            }, {
                name: 'btns',
                title: ' ',
                content: '{{$parent.$parent.renegotiate}}<div style=\'display:inline-block;width:80px\'><span><a uib-tooltip="{{$value.hasPayment || $value.fullPaid ? \'Visualizar\'  : \'Editar\'}}" ng-click="$parent.$parent.goEdit($value.titleType, $value.id, $value.hasPayment)" class="btn btn-primary btn-sm">' +
                '<i class="{{$value.hasPayment || $value.fullPaid ? \'glyphicon glyphicon-eye-open\' : \'glyphicon glyphicon-pencil\'}}"></i></a>' +
                '&nbsp;&nbsp;' +
                '<a uib-tooltip="Renegociar" ng-show="!$value.fullPaid && $value.isRenegotiate" class="btn btn-primary btn-sm" ng-disabled="$value.replacedBy || $value.fullPaid" ng-click="$parent.$parent.replacement($value, $value.fullPaid)">' +
                '<i class="fa fa-share-square-o"></i>' +
                '</a></span></div>' +
                '<span ng-if="$value.replacedBy" class="label label-warning">Renegociado</span>' +
                '<span ng-if="$value.hasPayment && !$value.fullPaid && $value.titleType == \'PAY\'" class="label label-info">Parcial</span>' +
                '<span ng-if="$value.hasPayment && !$value.fullPaid && $value.titleType == \'RECEIVE\'" class="label label-info">Parcial</span>' +
                '<span ng-if="$value.fullPaid && $value.titleType == \'RECEIVE\'" class="label label-success">Recebido</span>' +
                '<span ng-if="$value.fullPaid && $value.titleType == \'PAY\'" class="label label-success">Pago</span>' +
                '<span ng-if="!$value.hasRatio" class="glyphicon glyphicon-info-sign pull-right" uib-tooltip=\'Sem Rateio\' tooltip-placement=\'left\'></span>',
                size: 'col-md-3'
            }]
    };
}

TitlePayListController.$inject = ['$scope', 'gumgaController', 'TitleService'];

export default TitlePayListController