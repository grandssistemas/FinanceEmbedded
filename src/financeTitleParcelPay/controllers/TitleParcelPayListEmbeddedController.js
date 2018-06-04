import receiptPrint from './../views/paymentPrint.html';

function TitleParcelPayListEmbeddedController(
	$uibModal,
	$scope,
	TitleParcelPayService,
	gumgaController,
	$timeout,
	IndividualEmbeddedService
) {
	gumgaController.createRestMethods($scope, TitleParcelPayService, 'titleparcelPay');
	gumgaController.createRestMethods($scope, IndividualEmbeddedService, 'individual');

	TitleParcelPayService.resetDefaultState();
	IndividualEmbeddedService.resetDefaultState();

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
		$scope.filter($scope.lastClicked, $scope.paidOut);
	});


	$scope.filter = function (whichFilter, fullpaid) {
		$scope.paidOut = fullpaid;
		$scope.lastClicked = whichFilter;
		let gQuery = new GQuery(new Criteria('obj.title.titleType', ComparisonOperator.EQUAL, 'PAY'));

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
				beginDate = `${moment($scope.beginDate).format('YYYY-MM-DD')} 00:00:00`;
				endDate = `${moment($scope.endDate).format('YYYY-MM-DD')} 23:59:59`;
				break;
			}
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
		$scope.gQueryFilters = gQuery;
		$scope.getByGQuery();
		$scope.changeSubTypeButton(whichFilter);
	};

	$scope.totalize = function () {
		$timeout(() => {
			let total = 0;
			let increase = 0;
			$scope.containsFullPaid = false;
			angular.forEach($scope.selectedValues, (o) => {
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
			template: receiptPrint,
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
				$scope.$ctrl.onSameIndividual();
			} else {
				$scope.errorMessage = hasReversed ? 'Foram selecionados títulos já estornados. Não é possível fazer a movimentação desses títulos.' : 'Foram selecionadas parcelas de fornecedores diferentes, altere sua seleção.';
				$timeout(() => {
					delete $scope.errorMessage;
				}, 5000);
			}
		}
	};

	$scope.tableConfig = {
		columns: 'documentNumber, parcel, individual, expiration, amount, calculedInterest, calculedPenalty, valuePay, value, status',
		checkbox: true,
		selection: 'multi',
		materialTheme: true,
		itemsPerPage: [5, 10, 25, 50, 100],
		columnsConfig: [
			{
				name: 'documentNumber',
				title: '<span>Nº Doc</span>',
				content: '{{$value.titleData.documentNumber}}',
				sortField: 'number'
			},
			{
				name: 'parcel',
				title: '<span>Parcelas</span>',
				content: '{{$value.number}} / {{$value.titleData.parcelsCount}}',
				sortField: 'number'
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
				title: '<span>Valor</span>',
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
				name: 'valuePay',
				title: '<span>Pago</span>',
				content: '{{($value.totalpayed) | currency: "R$"}}'
			},
			{
				name: 'value',
				title: '<span>A pagar</span>',
				content: '{{$value.remaining | currency: "R$"}}'
			},
			{
				name: 'status',
				title: '<span>Status</span>',
				content: '<span ng-if="!$value.titleData.reversed && $value.totalpayed == 0" class="label label-info">Aberta</span>' +
					'<span ng-if="!$value.titleData.reversed && $value.fullPaid" class="label label-danger">Pago</span>' +
					'<span ng-if="$value.titleData.reversed" class="label label-danger">Estornado</span>' +
					'<span ng-if="!$value.titleData.reversed && ($value.totalpayed > 0) && !$value.fullPaid" class="label label-warning">Amortizado</span>'
			}
		]
	};

	$scope.selectedType = 'pays';
	$scope.buttonTypeClass = function (parameter) {
		return $scope.paidOut === parameter ? 'btn btn-danger' : 'btn btn-dark-default';
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

	$scope.getByGQuery = (page, pageSize) => {
		TitleParcelPayService.getByGQueryMaxDate(null, 'PAY', page, $scope.individualSearch, $scope.paidOut, $scope.gQueryFilters, pageSize, $scope.sortField, $scope.sortDir)
			.then((data) => {
				$scope.selectedValues = [];
				$scope.titleparcelPay.data = data.data.values;
				$scope.titleparcelPay.pageSize = data.data.pageSize;
				$scope.titleparcelPay.count = data.data.count;
				$scope.changeTypeButton($scope.paidOut ? 'paid' : 'pays');
			});
	};

	$scope.sortByGQuery = (sortField, dir) => {
		$scope.sortField = sortField;
		$scope.sortDir = dir;
		$scope.getByGQuery();
	};

	$scope.changeSubTypeButton('all');
	$scope.buttonSubTypeClass();
	$scope.filter($scope.selectedSubType, $scope.paidOut);
}

TitleParcelPayListEmbeddedController.$inject = [
	'$uibModal',
	'$scope',
	'TitleParcelPayService',
	'gumgaController',
	'$timeout',
	'IndividualEmbeddedService'
];

export default TitleParcelPayListEmbeddedController;
