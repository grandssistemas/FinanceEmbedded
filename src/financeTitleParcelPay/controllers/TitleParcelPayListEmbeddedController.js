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
	'TitleService'];

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
	TitleService
) {
	gumgaController.createRestMethods($scope, TitleParcelPayService, 'titleparcelPay');
	gumgaController.createRestMethods($scope, IndividualEmbeddedService, 'individual');

	$scope.searchIndividual = (param) => {
		param = param || '';
		return IndividualEmbeddedService.searchIndividual(param).then((resp) => {
			return resp.data.values;
		});
	};


	TitleParcelPayService.resetDefaultState();
	IndividualEmbeddedService.resetDefaultState();

	$scope.listCategoryTitle = [
		{ name: 'Receber / Pagar', key: 'RECEIVEPAY' },
		{ name: 'Receber', key: 'RECEIVE' },
		{ name: 'Pagar', key: 'PAY' }
	];
	$scope.filters = [
		{ name: 'Hoje', key: 'today' },
		{ name: 'Esta Semana', key: 'thisWeek' },
		{ name: 'Este Mês', key: 'thisMonth' },
		{ name: 'Mês Passado', key: 'lastMonth' },
		{ name: 'Este Ano', key: 'thisYear' },
		{ name: 'Todos', key: null }
	];
	$scope.filterMto = $scope.filters[5];
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

	$scope.$watch('individualSearch', (individual) => {
		$scope.individualSearch = individual;

		$scope.filter($scope.filterMto.key, $scope.paidOut, 'RECEIVE');
		$scope.filter($scope.filterMto.key, $scope.paidOut, 'PAY');
	});

	$scope.$watch('filterMto', (fil) => {
		$scope.filterMto = fil;

		$scope.filter($scope.filterMto.key, $scope.paidOut, 'RECEIVE');
		$scope.filter($scope.filterMto.key, $scope.paidOut, 'PAY');
	});

	$scope.getSearchCategory = function (param) {
		return $q((resolve) => {
			const arr = $scope.listCategoryTitle.filter((category) => category.name.indexOf(param) !== -1);
			resolve(arr);
		});
	};

	$scope.getSearchFilter = function (param) {
		return $q((resolve) => {
			const arr = $scope.filters.filter((fil) => fil.name.indexOf(param) !== -1);
			resolve(arr);
		});
	};

	$scope.filter = function (whichFilter, fullpaid, titleCategory, page, pageSize) {
		$scope.paidOut = fullpaid;
		$scope.lastClicked = whichFilter;
		let gQuery = new GQuery(new Criteria('obj.title.titleType', ComparisonOperator.EQUAL, titleCategory));

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
				beginDate = `${moment($s$scope.gQueryFilterscope.beginDate).format('YYYY-MM-DD')} 00:00:00`;
				endDate = `${moment($scope.endDate).format('YYYY-MM-DD')} 23:59:59`;
				break;
			}
			default:
				break;
		}

		if (beginDate && endDate) {
			gQuery = gQuery.and(new Criteria('obj.expiration', ComparisonOperator.BETWEEN, [beginDate, endDate]));
		}

		if ($scope.individualSearch && $scope.individualSearch.id) {
			gQuery = gQuery.and(new Criteria('obj.individual.name', ComparisonOperator.EQUAL, $scope.individualSearch.name));
		}

		if ($scope.paidOut) {
			gQuery = gQuery.and(new Criteria('obj.fullPaid', ComparisonOperator.EQUAL, true));
		} else {
			gQuery = gQuery.and(new Criteria('obj.fullPaid', ComparisonOperator.EQUAL, false));
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

	$scope.compairTitleCategory = (selectedValuesPay, selectedValuesReceive, $containsFullPaid) => {
		if (selectedValuesPay.length > 0 && selectedValuesReceive.length <= 0) {
			$scope.individualCheckAndPay(selectedValuesPay, $containsFullPaid);
		} else if (selectedValuesPay.length <= 0 && selectedValuesReceive.length > 0) {
			$scope.individualCheckAndPay(selectedValuesReceive, $containsFullPaid);
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
					$scope.$ctrl.onSameIndividual();
				} else {
					$scope.$ctrl.onSameIndividualReceive();
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
		columns: 'documentNumber, parcel, individual, expiration, amount',
		materialTheme: true,
		itemsPerPage: [5, 10, 25, 50, 100],
		selection: 'multi',
		disabledRow: (row) => (row.type === 'RECEIVE' && $scope.selectedValuesPay.length > 0)
			|| (row.type === 'PAY' && $scope.selectedValuesReceive.length > 0),
		fixed: {
			head: true
		},
		columnsConfig: [
			{
				name: 'documentNumber',
				title: '<span>Doc</span>',
				content: '{{$value.titleData.documentNumber}}'
			},
			{
				name: 'parcel',
				title: '<span>Parcelas</span>',
				content: '{{$value.number}} / {{$value.titleData.parcelsCount}}',
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
				content: '{{$value.expiration | date: "dd/MM/yyyy"}}',
				sortField: 'expiration'
			},
			{
				name: 'amount',
				alignRows: 'right',
				alignColumn: 'right',
				title: '<span class="text-right">Valor</span>',
				content: '<div class="pull-right">{{$value.value | currency: "R$"}}</div>',
				sortField: 'value'
			}
		]
	};

	$scope.selectedType = 'pays';
	$scope.buttonTypeClass = function (parameter) {
		return $scope.paidOut === parameter ? 'btn btn-danger' : 'btn btn-dark-default';
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

	$scope.changeSubTypeButton('all');
	$scope.buttonSubTypeClass();
	// $scope.filter($scope.selectedSubType, $scope.paidOut);
}

module.exports = TitleParcelPayListEmbeddedController;
