const receiptPrint = require('./../views/paymentPrint.html');

TitleParcelPayListEmbeddedController.$inject = [
	'$uibModal',
	'$scope',
	'TitleParcelPayService',
	'gumgaController',
	'StorageService',
	'$timeout',
	'IndividualEmbeddedService',
	'$q',
	'$state',
	'SweetAlert',
	'TitleService',
	'PaymentService',
	'FinanceReportService'];

function TitleParcelPayListEmbeddedController(
	$uibModal,
	$scope,
	TitleParcelPayService,
	gumgaController,
	StorageService,
	$timeout,
	IndividualEmbeddedService,
	$q,
	$state,
	SweetAlert,
	TitleService,
	PaymentService,
	FinanceReportService
) {
	gumgaController.createRestMethods($scope, TitleParcelPayService, 'titleparcelPay');
	gumgaController.createRestMethods($scope, IndividualEmbeddedService, 'individual');
	gumgaController.createRestMethods($scope, PaymentService, 'payment');

	$scope.searchIndividual = (param) => {
		param = param || '';
		return IndividualEmbeddedService.searchIndividual(param).then((resp) => resp.data.values);
	};


	TitleParcelPayService.resetDefaultState();
	IndividualEmbeddedService.resetDefaultState();

	$scope.listCategoryTitle = [
		{ name: 'Receber / Pagar', key: 'RECEIVEPAY' },
		{ name: 'Receber', key: 'RECEIVE' },
		{ name: 'Pagar', key: 'PAY' }
	];
	$scope.filters = [
		{ name: 'Todos', key: null },
		{ name: 'Hoje', key: 'today' },
		{ name: 'Esta Semana', key: 'thisWeek' },
		{ name: 'Este Mês', key: 'thisMonth' },
		{ name: 'Mês Passado', key: 'lastMonth' },
		{ name: 'Este Ano', key: 'thisYear' }
	];
	$scope.paidOutFilters = [
		{ name: 'Todos', key: null },
		{ name: 'Pagos', key: true },
		{ name: 'A Pagar', key: false }
	];
	$scope.filterMto = $scope.filters[0];
	$scope.categoryTitle = $scope.listCategoryTitle[0];
	$scope.urlStorage = StorageService.apiAmazonLocation;
	$scope.beginDate = new Date();
	$scope.endDate = new Date();
	$scope.paidOut = false;
	$scope.containsFullPaid = false;
	$scope.lastClicked = null;
	$scope.gQueryFilters = null;
	$scope.increase = 0;
	$scope.total = 0;

	$timeout(() => {
		$scope.filter($scope.filterMto.key, $scope.paidOut, 'RECEIVE');
		$scope.filter($scope.filterMto.key, $scope.paidOut, 'PAY');
	});

	$scope.filterListIndividual = (value) => {
		$scope.individualSearch = value;
		if ($scope.typeTab === 'RECEIVE') {
			$scope.lastIndividualReceive = value;
		} else {
			$scope.lastIndividualPay = value;
		}
		$scope.filter($scope.filterMto.key, $scope.paidOut, $scope.typeTab);
	};

	$scope.filterListFilterMto = (value) => {
		$scope.filterMto = value;
		if ($scope.typeTab === 'RECEIVE') {
			$scope.lastfilterMtoReceive = value;
		} else {
			$scope.lastfilterMtoPay = value;
		}
		$scope.filter($scope.filterMto.key, $scope.paidOut, $scope.typeTab);
	};

	$scope.filterListPaidOutFilter = (value) => {
		$scope.paidOutFilter = value;
		if ($scope.typeTab === 'RECEIVE') {
			$scope.lastfilterPaidOutFilter = value;
		} else {
			$scope.lastfilterPaidOutFilter = value;
		}
		$scope.filter($scope.filterMto.key, $scope.paidOutFilter.key, $scope.typeTab);
	};

	$scope.getSearchFilter = function (param) {
		return $q((resolve) => {
			const arr = $scope.filters.filter((fil) => fil.name.indexOf(param) !== -1);
			resolve(arr);
		});
	};

	TitleService.searchTypeCategorys().then((resp) => {
		const newData = { key: '', category: 'Todas', $$hashKey: '' };
		$scope.typeCategorys = resp.data.values;
		$scope.typeCategorys.splice(0, 0, newData);
		$scope.typeCategory = $scope.typeCategorys[0];
	});

	$scope.filter = function (whichFilter, fullpaid, titleCategory, page, pageSize) {
		$scope.paidOut = fullpaid;
		$scope.lastClicked = whichFilter;
		let gQuery = new GQuery()
			.join(new window.Join('obj.title as title', JoinType.LEFT))
			.join(new window.Join('obj.parcelPayments as pp', JoinType.LEFT))
			.join(new window.Join('pp.payment as pay', JoinType.LEFT))
			.and(new Criteria('obj.title.titleType', ComparisonOperator.EQUAL, titleCategory))

		let beginDate;
		let endDate;

		switch (whichFilter) {
			case 'thisWeek': {
				beginDate = moment().startOf('isoWeek').subtract(1, 'days').format('YYYY-MM-DD');
				endDate = moment().endOf('isoWeek').subtract(1, 'days').format('YYYY-MM-DD');
				break;
			}
			case 'thisMonth': {
				beginDate = moment().startOf('month').format('YYYY-MM-DD');
				endDate = moment().endOf('month').format('YYYY-MM-DD');
				break;
			}
			case 'lastMonth': {
				beginDate = moment().startOf('month').subtract(31, 'days').format('YYYY-MM-DD');
				endDate = moment().endOf('month').subtract(31, 'days').format('YYYY-MM-DD');
				break;
			}
			case 'thisYear': {
				beginDate = moment().startOf('year').format('YYYY-MM-DD');
				endDate = moment().endOf('year').format('YYYY-MM-DD');
				break;
			}
			case 'today': {
				beginDate = `${moment().format('YYYY-MM-DD')} 00:00:00`;
				endDate = `${moment().format('YYYY-MM-DD')} 23:59:59`;
				break;
			}
			case 'custom': {
				beginDate = `${moment($scope.gQueryFilterscope.beginDate).format('YYYY-MM-DD')} 00:00:00`;
				endDate = `${moment($scope.endDate).format('YYYY-MM-DD')} 23:59:59`;
				break;
			}
			default:
				break;
		}

		// if ($scope.paidOutFilter && $scope.paidOutFilter.key) {
		// 	$scope.sortField = 'pay.momment'
		// 	$scope.sortDir = 'DESC'
		// } else {
		// 	$scope.sortField = 'obj.expiration'
		// 	$scope.sortDir = 'DESC'
		// }

		$scope.sortField = 'obj.expiration'
		$scope.sortDir = 'DESC'

		if (beginDate && endDate) {
			if ($scope.paidOutFilter && $scope.paidOutFilter.key) {
				gQuery = gQuery.and(new Criteria('pay.momment', ComparisonOperator.BETWEEN, [beginDate, endDate]))
			} else {
				gQuery = gQuery.and(new Criteria('obj.expiration', ComparisonOperator.BETWEEN, [beginDate, endDate]))
			}
		}

		if ($scope.individualSearch && $scope.individualSearch.id) {
			gQuery = gQuery.and(new Criteria('obj.individual.name', ComparisonOperator.EQUAL, $scope.individualSearch.name));
		}

		if ($scope.paidOut !== null) {
			gQuery = gQuery.and(new Criteria('obj.fullPaid', ComparisonOperator.EQUAL, $scope.paidOut));
		}

		if (titleCategory === 'RECEIVE') {
			$scope.gQueryFiltersReceive = gQuery;
		} else {
			$scope.gQueryFiltersPay = gQuery;
		}

		$scope.getByGQuery(titleCategory, page, pageSize);
		$scope.changeSubTypeButton(whichFilter);
	};

	$scope.totalize = function (category) {
		$timeout(() => {
			let values = [];
			if (category === 'PAY') {
				values = $scope.selectedValuesPay;
			} else {
				values = $scope.selectedValuesReceive;
			}
			let total = 0;
			let increase = 0;
			$scope.containsFullPaid = false;
			angular.forEach(values, (o) => {
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
		let value = $scope.totalPayment().toString();
		value = value.replace('.', ',');
		$scope.payment.numberInWords = $filter('gumgaNumberInWords')(value, true);
		$scope.payment.value = $scope.totalPayment().toFixed(2);
		$scope.printPaid($scope.payment);
	};

	$scope.printPaid = function (items) {
		const uibModalInstance = $uibModal.open({
			templateUrl: receiptPrint,
			controller: 'ReceivePrintEmbeddedController',
			size: 'lg',
			resolve: {
				items() {
					return items;
				}
			}
		});
		uibModalInstance.result.then(() => {

		});
	};

	$scope.compairTitleCategory = ($containsFullPaid) => {
		if ($scope.selectedValuesPay.length > 0 && $scope.selectedValuesReceive.length <= 0) {
			$scope.individualCheckAndPay($scope.selectedValuesPay, $containsFullPaid);
		} else if ($scope.selectedValuesPay.length <= 0 && $scope.selectedValuesReceive.length > 0) {
			$scope.individualCheckAndPay($scope.selectedValuesReceive, $containsFullPaid);
		}
	};


	$scope.individualCheckAndPay = function (parcels, $containsFullPaid) {
		if ($containsFullPaid) {
			let totalValue = 0;
			$scope.selectedValues.forEach((data) => {
				totalValue += data.totalpayed;
			});
			$scope.recibo = { value: totalValue };
			$scope.recibo.parcels = $scope.selectedValues;
			$scope.printPaid($scope.recibo);
		} else {
			const individualDefault = parcels[0].individual.name;
			let sameIndividual = true;
			let hasReversed = false;
			parcels.forEach((parcel) => {
				sameIndividual = sameIndividual && (parcel.individual.name === individualDefault);
				hasReversed = hasReversed || parcel.titleData.reversed;
			});

			if (sameIndividual && !hasReversed) {
				TitleParcelPayService.setInstallmentsPayable(parcels);
				if (parcels[0].type === 'PAY') {
					$scope.$ctrl.onSameIndividual({ parcels });
				} else {
					$scope.$ctrl.onSameIndividualReceive({ parcels });
				}
			} else {
				$scope.errorMessage = hasReversed ? 'Foram selecionados títulos já estornados. Não é possível fazer a movimentação desses títulos.' : 'Foram selecionadas parcelas de fornecedores diferentes, altere sua seleção.';
				SweetAlert.swal('Atenção', $scope.errorMessage, 'warning');
				$timeout(() => {
					delete $scope.errorMessage;
				}, 5000);
			}
		}
	};

	$scope.tableConfig = {
		columns: 'documentNumber, parcel, individual, expiration, status, amount, receipt, balance, edit, print',
		materialTheme: true,
		itemsPerPage: [5, 10, 25, 50, 100],
		selection: 'multi',
		fixed: {
			head: true
		},
		columnsConfig: [
			{
				name: 'documentNumber',
				title: '<span>Doc</span>',
				content: '<div>{{$value.titleData.documentNumber}}</div>'
			},
			{
				name: 'parcel',
				title: '<span>Parcelas</span>',
				content: '<div>{{$value.number}} / {{$value.titleData.parcelsCount}}</div>',
				sortField: 'number'
			},
			{
				name: 'individual',
				title: '<span>Nome</span>',
				content: '<div class="ellipsis-200">{{$value.individual.name}}</div>',
				sortField: 'individual.name'
			},
			{
				name: 'expiration',
				title: '<span>Venc</span>',
				content: '<div>{{$value.expiration | date: "dd/MM/yyyy"}}</div>',
				sortField: 'expiration'
			},
			{
				name: 'status',
				title: '<span>Status</span>',
				content: '<div class="mb-status mb-bg-info" uib-tooltip="Aberta" ng-if="!$value.titleData.reversed && $value.totalpayed == 0 && !$value.isReplaced">A</div>' +
					'<div class="mb-status active" uib-tooltip="Recebida" ng-if="!$value.titleData.reversed && $value.fullPaid">R</div>' +
					'<div class="mb-status mb-bg-warn" uib-tooltip="Estornada" ng-if="$value.titleData.reversed">E</div>' +
					'<div class="mb-status neutral" uib-tooltip="Refaturada" ng-if="!$value.titleData.reversed && $value.isReplaced">R</div>' +
					'<div class="mb-status amortized" uib-tooltip="Amortizada" ng-if="!$value.titleData.reversed && ($value.totalpayed > 0) && !$value.fullPaid">A</div>'
			},
			{
				name: 'amount',
				alignRows: 'right',
				alignColumn: 'right',
				title: '<span class="text-right">Valor</span>',
				content: '<div class="pull-right">{{$value.value | currency: "R$"}}</div>',
				sortField: 'value'
			},
			{
				name: 'receipt',
				alignRows: 'right',
				alignColumn: 'right',
				title: '<span>{{$parent.$parent.$parent.typeTab === "RECEIVE" ? "Recebido" : "Pago"}}</span>',
				content: '<div>{{$value.totalpayed | currency: "R$"}}</div>'
			},
			{
				name: 'balance',
				alignRows: 'right',
				alignColumn: 'right',
				title: '<span>Saldo</span>',
				content: '<div>{{$value.value - $value.totalpayed | currency: "R$"}}</div>'
			},
			{
				name: 'edit',
				title: 'Editar',
				alignColumn: 'center',
				alignRows: 'center',
				content: `
					<cp-edit-icon ng-click="$parent.$parent.goEdit($value.type, $value.titleData.idTitle, $value.fullPaid)"></cp-edit-icon>
				`
			},
			{
				name: 'print',
				title: `Recibo`,
				alignColumn: 'center',
				alignRows: 'center',
				content: `
					<cp-print-icon ng-if="$value.totalpayed > 0 && $value.type !== 'PAY'" ng-click="$parent.$parent.$parent.printReceipt($value)"></cp-print-icon>
				`
			}
		]
	};

	const getPayments = (parcels) => {
		const arr = [];
		parcels.forEach((parcelPayment) => {
			const gQuery = new GQuery(new Criteria('pp.id', ComparisonOperator.EQUAL, parcelPayment.id))
				.join(new Join('obj.parcelPayments as pp', JoinType.INNER));
			arr.push($scope.payment.methods.asyncSearchWithGQuery(gQuery));
		});
		return Promise.all(arr).then((response) => {
			const toReturn = [];
			response.forEach((data) => data.forEach((payment) => {
				if (toReturn.filter((d) => angular.equals(d, payment)).length === 0) {
					toReturn.push(payment);
				}
			}));
			return toReturn;
		});
	};

	$scope.printReceipt = (parcel) => {
		getPayments(parcel.parcelPayments).then((resp) => {
			const baseState = '';
			const variables = [];
			variables.push(FinanceReportService.mountVariable('', 'idPayment', resp[0].id));
			FinanceReportService.openModalViewer('RECEIPTTITLE', [], variables, () => true, baseState);
		});
	};

	$scope.selectedType = 'pays';
	$scope.buttonTypeClass = function (parameter) {
		return $scope.paidOut === parameter ? 'btn btn-danger' : 'btn btn-dark-default';
	};

	$scope.goEdit = (type, id, fullPaid) => {
		if (!fullPaid) {
			$state.go('app.title.edit' + type.toUpperCase(), { id: id, 'visualization': false });
		} else {
			$state.go('app.title.edit' + type.toUpperCase(), { 'id': id, 'visualization': true });
		}
	};

	$scope.goList = (type, item) => {
		if (!item && type === 'PAY') {
			$state.go('app.title.listpay');
		} else if (!item && type === 'RECEIVE') {
			$state.go('app.title.listreceive');
		} else {
			$state.go(`app.title.edit${item.titleData.titleType.toUpperCase()}`, { id: item.titleData.idTitle, visualization: item.titleData.hasFullPaid });
		}
	};

	$scope.goNewTitle = (type) => {
		if (type === 'PAY') {
			$state.go('app.title.insertpay');
		} else {
			$state.go('app.title.insertreceive');
		}
	};

	$scope.changeTypeButton = function (newType) {
		$scope.selectedType = newType;
	};

	$scope.buttonSubTypeClass = function (parameter) {
		return $scope.selectedSubType === parameter ? 'btn btn-danger' : 'btn btn-default';
	};

	$scope.changeSubTypeButton = function (newType) {
		$scope.selectedSubType = newType;
	};

	$scope.configData = () => $scope.filter('custom', $scope.paidOut);

	$scope.getByGQuery = (titleCategory, page, pageSize) => {
		let gQueryFilter = '';
		if (titleCategory === 'RECEIVE') {
			gQueryFilter = $scope.gQueryFiltersReceive;
		} else {
			gQueryFilter = $scope.gQueryFiltersPay;
		}
		TitleParcelPayService.getByGQueryMaxDate(null, titleCategory, page, $scope.individualSearch, $scope.paidOut, gQueryFilter, pageSize, $scope.sortField, $scope.sortDir)
			.then((data) => {
				if (titleCategory === 'PAY') {
					$scope.selectedPayValues = [];
					$scope.titleparcelPay.data = data.data.values;
					$scope.titleparcelPay.data.forEach((row, i) => { $scope.titleparcelPay.data[i].type = titleCategory; });
					$scope.titleparcelPay.pageSize = data.data.pageSize;
					$scope.titleparcelPay.count = data.data.count;
				} else if (titleCategory === 'RECEIVE') {
					$scope.selectedReceiveValues = [];
					$scope.titleparcelReceive.data = data.data.values;
					$scope.titleparcelReceive.data.forEach((row, i) => { $scope.titleparcelReceive.data[i].type = titleCategory; });
					$scope.titleparcelReceive.pageSize = data.data.pageSize;
					$scope.titleparcelReceive.count = data.data.count;
				}
				$scope.changeTypeButton($scope.paidOut ? 'paid' : 'pays');
			});
	};

	$scope.sortByGQuery = (sortField, dir, titleCategory) => {
		$scope.sortField = sortField;
		$scope.sortDir = dir;
		$scope.getByGQuery(titleCategory);
	};

	$scope.getSearchPaidOutFilters = function (param) {
		return $q((resolve) => {
			const arr = $scope.paidOutFilters.filter((fil) => fil.name.indexOf(param) !== -1);
			resolve(arr);
		});
	};

	$scope.alterTab = (type) => {
		$timeout(() => {
			$scope.typeTab = type || 'RECEIVE';
			if ($scope.typeTab === 'RECEIVE') {
				$scope.paidOutFilters = [
					{ name: 'Todos', key: null },
					{ name: 'Recebidos', key: true },
					{ name: 'A Receber', key: false }
				];
				$scope.selectedValuesPay = []
				$scope.individualSearch = $scope.lastIndividualReceive;
				$scope.filterMto = $scope.lastfilterMtoReceive || $scope.filters[0];
				$scope.paidOutFilter = $scope.lastfilterPaidOutFilter || $scope.paidOutFilters[2];
			} else {
				$scope.paidOutFilters = [
					{ name: 'Todos', key: null },
					{ name: 'Pagos', key: true },
					{ name: 'A Pagar', key: false }
				];
				$scope.selectedValuesReceive = []
				$scope.individualSearch = $scope.lastIndividualPay;
				$scope.filterMto = $scope.lastfilterMtoPay || $scope.filters[0];
				$scope.paidOutFilter = $scope.lastfilterPaidOutFilter || $scope.paidOutFilters[2];
			}

			$scope.total = 0
			$scope.increase = 0
		});
	};

	$scope.changeSubTypeButton('all');
	$scope.buttonSubTypeClass();
	// $scope.filter($scope.selectedSubType, $scope.paidOut);
}

module.exports = TitleParcelPayListEmbeddedController;
