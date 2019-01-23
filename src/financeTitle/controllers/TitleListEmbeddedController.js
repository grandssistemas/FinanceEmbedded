// var modalTemplate = require('../views/viewermodal.html');
const modalTemplate = require('../views/receiveTitlePrintModal.html');

function TitleListEmbeddedController(
	$scope,
	$state,
	TitleService,
	FinanceReportService,
	SweetAlert,
	$uibModal,
	gumgaController
) {
	TitleService.resetDefaultState();

	$scope.lastGQuery = new GQuery();

	gumgaController.createRestMethods($scope, TitleService, 'title');
	$scope.participation = '';
	$scope.currentPage = 1;

	$scope.$ctrl.$onInit = () => {
		$scope.titleType = $scope.$ctrl.titleType;
		$scope.title.methods.get($scope.currentPage);
	};

	$scope.title.on('deleteSuccess', () => {
		$scope.title.methods.get(1);
	});

	$scope.verdata = (valor) => {
		$scope.openPrintings(valor.id);
	};

	$scope.title.methods.get = function (page) {
		$scope.currentPage = page;
		TitleService.findTitleWithParticipations(($scope.titleType || '').toUpperCase(), page).then((response) => {
			$scope.title.data = response.data.values;
			$scope.title.count = response.data.count;
			$scope.title.pageSize = response.data.pageSize;
		});
	};

	$scope.searchTitle = (param) => {
		const criteriaTitleType = new Criteria('obj.titleType', ComparisonOperator.EQUAL, $scope.titleType.toUpperCase());
		const filterType = new GQuery(criteriaTitleType).join(new Join('obj.participations as p', JoinType.INNER));
		if (!param || !param.and) {
			param = filterType;
		} else {
			param = param.and(filterType);
		}
		$scope.lastGQuery = param;
		$scope.title.methods.asyncSearchWithGQuery(param).then((values) => {
			$scope.title.data = values;
		}).catch((error) => {
			console.error(error);
		});
	};

	$scope.buscaParticipations = function (participation) {
		if (participation === '') {
			$scope.title.methods.get($scope.currentPage);
		}
		$scope.title.data = $scope.title.data.filter((data) => data.participationsFormatted.indexOf(participation) > -1);
	};


	const initialize = () => {
		$scope.titleType = $scope.titleType || $state.$current.data.type;
		$scope.selected = {};
		$scope.labels = [];
		TitleService.getLabels()
			.then((response) => {
				$scope.labels = response.data.values;
			}, (error) => {
				console.error(error.data);
			});
	};

	initialize();

	$scope.buscaTag = function (param) {
		const search = `searchFields=value&q=${param}`;
		return TitleService.searchLabels(search).then((response) => {
			$scope.labels = response.data.values;
		});
	};

	$scope.selectLabel = function (label) {
		$scope.selected.labels.clear();
		$scope.selected.labels[0] = label;

		TitleService.searchTags(label.value, ($scope.titleType || '').toUpperCase()).then((response) => {
			$scope.title.data = response.data.values;
		});
	};

	$scope.reset = function () {
		$scope.title.methods.get(1);
	};

	$scope.titlePage = ($scope.titleType || '').toLowerCase() === 'pay' ? 'Listagem de Contas a Pagar' : 'Listagem de Contas a Receber';

	$scope.titleList = [];

	$scope.tableConf = {
		columns: 'titleType, issuedAt,documentNumber, participationsFormatted, expiration, docname, value, btns',
		materialTheme: true,
		columnsConfig: [
			{
				name: 'titleType',
				title: '<span gumga-translate-tag="title.titleType"></span>',
				content: '<span style="">{{$value.titleType == \'PAY\' ? \'A PAGAR\' : \'A RECEBER\'}}</span>',
				sortField: 'titleType',
				size: 'col-md-2 col-lg-1'

			}, {
				name: 'issuedAt',
				title: '<span gumga-translate-tag="title.issuedAt"></span>',
				sortField: 'emissionDate',
				content: '<span>{{$value.emissionDate | date: \'dd/MM/yyyy\' }}</span>'

			}, {
				name: 'documentNumber',
				title: '<span gumga-translate-tag="title.documentNumberAdapted"></span>',
				sortField: 'documentNumber',
				content: '<span>{{$value.documentNumber}}</span>'

			}, {
				name: 'participationsFormatted',
				title: '<span gumga-translate-tag="title.participationsFormatted"></span>',
				content: '<div class="ellipsis" ng-if="$value.participations.length == 1">{{$value.participationsFormatted}}</div>'

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
				sortField: 'value',
				alignColumn: 'right',
				alignRows: 'right',
				content: '<span>{{$value.value | currency}}</span>'

			}, {
				name: 'btns',
				title: ' ',
				content: `
                <div style="display:inline-block;">
                    <span>
                        &nbsp;&nbsp;
                        <a uib-tooltip="Renegociar" 
                           ng-show="!$value.fullPaid && $value.isRenegotiate" 
                           class="btn btn-primary btn-sm" 
                           ng-disabled="$value.replacedBy || $value.fullPaid" 
                           ng-click="$parent.$parent.replacement($value, $value.fullPaid)">
                            <i class="fa fa-share-square-o"></i>
                        </a>
                    </span>                                                                         
                </div>
                <span ng-if="!$value.isReversed && $value.replacedBy" class="label label-warning">Renegociado</span>
                <span ng-if="$value.isReversed" class="label label-danger">Estornado</span>
                <span ng-if="!$value.isReversed && $value.hasPayment && !$value.fullPaid" class="label label-info">Parcial</span>                    
                <span ng-if="!$value.isReversed && $value.fullPaid && $value.titleType == \'RECEIVE\'" class="label label-success">Recebido</span>
                <span ng-if="!$value.isReversed && $value.fullPaid && $value.titleType == \'PAY\'" class="label label-success">Pago</span>
                <span ng-if="!$value.isReversed && !$value.hasRatio" class="glyphicon glyphicon-info-sign pull-right" uib-tooltip=\'Sem Rateio\' tooltip-placement=\'left\'></span>`,
				size: 'col-md-3'
			}]
	};

	$scope.searchSortQuery = (field, dir, pageSize, page) => {
		$scope.titleField = field;
		$scope.titleDir = dir;
		$scope.title.methods.createQuery()
			.pageSize(pageSize)
			.page(page)
			.sort(field, dir)
			.gQuery($scope.lastGQuery)
			.send()
			.then(() => {
			});
	};

	$scope.createQuery = function (page, pageSize) {
		$scope.field = $scope.titleField || 'emissionDate';
		$scope.dir = $scope.titleDir || 'desc';

		$scope.title
			.methods
			.createQuery()
			.gQuery($scope.lastGQuery)
			.page(page)
			.sort($scope.field, $scope.dir)
			.pageSize(pageSize)
			.send();
	};

	$scope.openPrintings = function (id) {
		$uibModal.open({
			templateUrl: modalTemplate,
			controller: 'ReceiveTitlePrintModalController',
			backdrop: 'static',
			size: 'sm',
			resolve: {
				id() {
					return id;
				}
			}
		});
	};

	$scope.goInsert = function () {
		$scope.$ctrl.onNewTitle({ type: $scope.$ctrl.titleType });
	};

	$scope.goEdit = function (type, id, fullPaid) {
		$scope.$ctrl.onEditTitle({ type, id, fullPaid });
	};

	$scope.replacement = function (value, fullPaid) {
		$scope.$ctrl.onReplacement({ value, fullPaid });
	};

	// function convertDate(date) {
	// 	function pad(s) {
	// 		return (s < 10) ? `0${s}` : s;
	// 	}

	// 	const d = new Date(date);
	// 	return [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join('/');
	// }

	// function formatData(values) {
	// 	const len = values.values.length;
	// 	for (let i = 0; i < len; i++) {
	// 		const value = values.values[i];
	// 		value.issuedAt = convertDate(value.issuedAt);
	// 		value.postedAt = convertDate(value.postedAt);
	// 		value.titleType = translateTitleType(value.titleType);
	// 	}
	// }

	// function translateTitleType(title) {
	// 	return (title === 'PAY') ? 'A pagar' : 'A receber';
	// }

	$scope.getNextParcelExpiration = function (parcels) {
		let result;
		if (!parcels || parcels.length < 1) {
			return null;
		}
		parcels.forEach((parcel) => {
			if (!result && !parcel.fullPaid) {
				result = parcel;
			} else if (!parcel.fullPaid) {
				const dateIndex = new Date(parcel);
				const dateResult = new Date(result);
				if (dateResult > dateIndex) {
					result = dateIndex;
				}
			}
		});

		if (!result) {
			parcels.forEach((parcel) => {
				if (!result) {
					result = parcel;
				} else {
					const dateIndex = new Date(parcel);
					const dateResult = new Date(result);
					if (dateResult > dateIndex) {
						result = dateIndex;
					}
				}
			});
		}
		return result.expiration;
	};

	$scope.print = function (type) {
		const typePrint = type === 'receive' ? 'RECEIVE_BILL' : null;
		FinanceReportService.openModalViewer(typePrint, '', [], () => {
			SweetAlert.swal('Falta de Relatorio de contas a receber', 'Você esta sem o relátorio de contas a receber contate o suporte.', 'warning');
		});
	};
}

TitleListEmbeddedController.$inject = [
	'$scope',
	'$state',
	'TitleService',
	'FinanceReportService',
	'SweetAlert',
	'$uibModal',
	'gumgaController'
];

module.exports = TitleListEmbeddedController;
