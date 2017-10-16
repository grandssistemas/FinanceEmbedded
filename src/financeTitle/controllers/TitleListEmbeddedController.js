// var modalTemplate = require('../views/viewermodal.html');

TitleListEmbeddedController.$inject = [
    '$scope',
    'TitleService',
    'FinanceReportService',
    'SweetAlert',
    '$uibModal',
    'gumgaController'];
function TitleListEmbeddedController(
    $scope,
    TitleService,
    FinanceReportService,
    SweetAlert,
    $uibModal,
    gumgaController) {

        TitleService.resetDefaultState();

        gumgaController.createRestMethods($scope, TitleService, 'title');
        $scope.participation = "";
        $scope.currentPage = 1;

        $scope.titleType = $scope.$ctrl.titleType;

        $scope.title.on('deleteSuccess', function () {
            $scope.title.methods.get(1);
        });

        $scope.title.methods.get = function (page) {
            $scope.currentPage = page;
            TitleService.findTitleWithParticipations($scope.titleType.toUpperCase(), page).then(function (response) {
                $scope.title.data = response.data.values;
                $scope.title.count = response.data.count;
                $scope.title.pageSize = response.data.pageSize;
            });
        };

        $scope.simpleSearch = function (field, param) {
            if (param === ""){
                $scope.title.methods.get(1);
                return;
            }

            var aq = "obj." + field + " like '" + param + "'";
            TitleService.findTitleWithParticipations($scope.titleType.toUpperCase(), 1, aq).then(function (data) {
                $scope.title.data = data.data.values;
                $scope.title.count = data.data.count;
                $scope.title.pageSize = data.data.pageSize;
            })
        };

        $scope.title.methods.get($scope.currentPage);

        $scope.buscaParticipations = function (participation) {
            if (participation === "") {
                $scope.title.methods.get($scope.currentPage)
            }
            $scope.title.data = $scope.title.data.filter(function (data) {
                return data.participationsFormatted.indexOf(participation) > -1
            })

        };

        $scope.selected = {};
        $scope.labels = [];
        TitleService.getLabels()
            .then(function (response) {
                $scope.labels = response.data.values;
            }, function (error) {
                console.error(error.data);
            });

        $scope.buscaTag = function (param) {

            var search = "searchFields=value&q=" + param;
            return TitleService.searchLabels(search).then(function (response) {
                $scope.labels = response.data.values
            })
        };

        $scope.selectLabel = function (label) {
            // $scope.selected = angular.copy(label);
            $scope.selected.labels.clear();
            $scope.selected.labels[0] = label;

            TitleService.searchTags(label.value, $scope.titleType.toUpperCase()).then(function (response) {
                $scope.title.data = response.data.values
            })
        };

        $scope.reset = function () {
            $scope.title.methods.get(1);
        };

        $scope.titleList = [];

        $scope.isParcial = function (idTitle, typeTitle) {
            //TODO
        };

        $scope.tableConf = {
            columns: 'titleType, issuedAt,documentNumber, participationsFormatted, expiration, docname, value, btns',
            materialTheme: true,
            title: $scope.titleType === "pay" ? 'Listagem de Contas a Pagar' : 'Listagem de Contas a Receber',
            columnsConfig: [
                {
                    name: 'titleType',
                    title: '<span gumga-translate-tag="title.titleType"></span>',
                    content: '<span style="">{{$value.titleType == \'PAY\' ? \'A PAGAR\' : \'A RECEBER\'}}</span>',
                    size: 'col-md-2 col-lg-1'

                }, {
                    name: 'issuedAt',
                    title: '<span gumga-translate-tag="title.issuedAt"></span>',
                    content: '<span>{{$value.emissionDate | date: \'dd/MM/yyyy\' }}</span>'

                }, {
                    name: 'documentNumber',
                    title: '<span gumga-translate-tag="title.documentNumberAdapted"></span>',
                    content: '<span>{{$value.documentNumber}}</span>'

                }, {
                    name: 'participationsFormatted',
                    title: '<span gumga-translate-tag="title.participationsFormatted"></span>',
                    content: '<div uib-tooltip="{{$value.participationsFormatted}}" ng-class="{\'text-overflow-list\':$value.participations.length == 1, \'text-align-center\':$value.participations.length > 1}">' +
                    '<i class=" glyphicon glyphicon-user"></i><i class=" glyphicon glyphicon-user" ng-if="$value.participations.length > 1"></i>' +
                    '&nbsp;<span ng-if="$value.participations.length == 1">{{$value.participationsFormatted}}</span></div>'

                }, {
                    name: 'expiration',
                    title: '<span gumga-translate-tag="title.expiration"></span>',
                    content: '<span>{{$parent.$parent.getNextParcelExpiration($value.parcel) | date: \'dd/MM/yyyy\'}}</span>'

                }, {
                    name: 'docname',
                    title: '<span gumga-translate-tag="title.documentType"></span>',
                    content: '<span>{{$value.documentType.name}}</span>'

                }, {
                    name: 'value',
                    title: '<span gumga-translate-tag="title.value"></span>',
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

        $scope.goInsert = function () {
            $scope.$ctrl.onNewTitle({type: $scope.$ctrl.titleType});
        };

        $scope.goEdit = function (type, id, fullPaid) {
            $scope.$ctrl.onEditTitle({type: type, id: id, fullPaid: fullPaid});
        };

        $scope.replacement = function (value, fullPaid) {
            $scope.$ctrl.onReplacement({value: value, fullPaid: fullPaid});
        };

        function convertDate(date) {
            function pad(s) {
                return (s < 10) ? '0' + s : s;
            }

            var d = new Date(date);
            return [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join('/');
        }

        function formatData(values) {
            var len = values.values.length;
            for (var i = 0; i < len; i++) {
                var value = values.values[i];
                value.issuedAt = convertDate(value.issuedAt);
                value.postedAt = convertDate(value.postedAt);
                value.titleType = translateTitleType(value.titleType);
            }
        }

        function translateTitleType(title) {
            return (title === "PAY") ? "A pagar" : "A receber";
        }

        $scope.getNextParcelExpiration = function(parcels){
            let result;
            parcels.forEach(function (parcel) {
                if(!result && !parcel.fullPaid){
                    result = parcel;
                }else if(!parcel.fullPaid){
                    let dateIndex = new Date(parcel);
                    let dateResult = new Date(result);
                    if(dateResult > dateIndex){
                        result = dateIndex;
                    }
                }
            });

            if(!result)
                parcels.forEach(function (parcel) {
                    if(!result){
                        result = parcel;
                    }else{
                        let dateIndex = new Date(parcel);
                        let dateResult = new Date(result);
                        if(dateResult > dateIndex){
                            result = dateIndex;
                        }
                    }
                });

            return result.expiration;
        };

        $scope.print = function(type){
            // console.log(type);
            var typePrint = type === 'receive'? 'RECEIVE_BILL':null;
            FinanceReportService.openModalViewer(typePrint,'',[],()=>{
                SweetAlert.swal("Falta de Relatorio de contas a receber", "Você esta sem o relátorio de contas a receber contate o suporte.", "warning");
            })
        }
    };

module.exports =  TitleListEmbeddedController;
