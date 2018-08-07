const template = require('./../views/modalLaunchPaid.html');
const templatePayments = require('./../views/PaymentsModal.html');

TitleFormEmbeddedController.$inject = [
	'TitleService',
	'$uibModal',
	'$scope',
	'gumgaController',
	'$timeout',
	'IndividualEmbeddedService',
	'DocumentTypeService',
	'RatioPlanService',
	'PlanLeafService',
	'WalletService',
	'FinanceUnitService',
	'SweetAlert',
	'MoneyUtilsService',
	'TitleParcelPayService',
	'$state',
	'FinanceReportService',
	'PaymentService'];

function TitleFormEmbeddedController(
	TitleService,
	$uibModal,
	$scope,
	gumgaController,
	$timeout,
	IndividualEmbeddedService,
	DocumentTypeService,
	RatioPlanService,
	PlanLeafService,
	WalletService,
	FinanceUnitService,
	SweetAlert,
	MoneyUtils,
	TitleParcelPayService,
	$state,
	FinanceReportService,
	PaymentService
) {
	const ctrl = this;
	ctrl.$onInit = () => {
		$scope.entity = angular.copy(ctrl.entity) || {
			data: {
				parcel: []
			}
		};

		$scope.entity.data.parcel.sort((a, b) => a.number - b.number);
		createMethods();
	};

	function createMethods() {
		gumgaController.createRestMethods($scope, DocumentTypeService, 'documentType');
		gumgaController.createRestMethods($scope, FinanceUnitService, 'financeunit');
		gumgaController.createRestMethods($scope, IndividualEmbeddedService, 'individual');
		gumgaController.createRestMethods($scope, RatioPlanService, 'ratioPlan');
		gumgaController.createRestMethods($scope, PlanLeafService, 'planLeaf');
		gumgaController.createRestMethods($scope, WalletService, 'wallet');
		gumgaController.createRestMethods($scope, TitleService, 'title');
		gumgaController.createRestMethods($scope, PaymentService, 'payment');

		$scope.searchIndividual = (param) => IndividualEmbeddedService.searchIndividual(param);

		$scope.documentType.methods.search('name', '');
		$scope.financeunit.methods.search('name', '');
		$scope.ratioPlan.methods.search('label', '');

		$scope.titleType = $scope.$ctrl.typeTitle; // Tipo de lançamento podendo vir: pay para pagamento ou receive para receber.
		$scope.editParcels = false;
		$scope.selectArrays = [];
		$scope.totalRateio = 0;
		$scope.subLeafs = [];
		$scope.discount = 0;
		$scope.tags = [];
		$scope.step = 1;
		$scope.interestActive = true;


		$scope.blockBtnSave = (formInvalid) => formInvalid;

		$scope.updatePaid = (invalid) => {
			if (invalid) {
				return;
			}
			$scope.launchPaid();
		};

		$scope.update = (invalid, entity) => {
			if (invalid) {
				return;
			}
			$scope.save(entity);
		};

		$scope.backToList = () => {
			// let title;
			// if ($scope.titleType === 'editreceive') {
			// 	title = 'receive';
			// } else {
			// 	title = 'pay';
			// }
			$state.go(`app.titleparcel.list`);
		};

		$scope.ratioPlanSearch = (param) => {
			param = param || '';
			let search = $scope.ratioPlan.methods.asyncSearchWithGQuery(new GQuery(new Criteria('obj.name', ComparisonOperator.CONTAINS, param).addTranslate().addIgnoreCase()));
			return search;
		};

		TitleService.getPlanTree()
			.then((response) => {
				$scope.planTree = response.data.values;
			});

		$scope.postDocType = function (value) {
			return DocumentTypeService.save(value);
		};

		$scope.labels = [];
		TitleService.getLabels()
			.then((response) => {
				$scope.labels = response.data.values;
			}, (error) => {
				console.error(error.data);
			});

		$scope.labelTransform = function (newLabel) {
			let label = {
				value: newLabel
			};
			return label;
		};
		$scope.newPlanLeaf = function (newLabel) {
			let label = {
				name: newLabel
			};
			return label;
		};
		$scope.selectedRatio = function (item, planType, index) {
			if (item.isTag) {
				let position = $scope.title.data.planLeafs[index].length - 1;
				let leaf = {
					name: item.name,
					planType
				};
				PlanLeafService.save(leaf).then((response) => {
					$scope.title.data.planLeafs[index][position] = response.data.data;
				});
			}
		};

		$scope.automaticRatio = function (value) {
			$scope.planTree[0] = value.plan;
			let total = $scope.sumParcels($scope.title.data.parcel);
			if (value.label && value) {
				RatioPlanService.getAutomaticRatio(value.label, total)
					.then((response) => {
						$scope.title.data.planLeafs = response.data;
					});
			}
		};

		$scope.disable = false;
		$scope.changeStep = function (numStep) {
			if (numStep === 1) {
				if ($scope.title.data.hasPayment || $scope.title.data.fullPaid || $scope.renegotiation || $scope.title.data.isReversed) {
					$scope.disable = true;
					$scope.step = numStep;
				} else {
					$scope.disable = false;
					$scope.step = numStep;
				}
			}
			if (numStep === 2) {
				$scope.disable = false;
				$scope.step = numStep;
			}
		};

		$scope.disableParcel = function (entity) {
			return $scope.title.data.isReversed || (entity.parcelPayments && entity.parcelPayments.length > 0);
		};

		// Função de busca do rateio.
		$scope.buscaLeafs = function (plan, query) {
			if (!plan.subPlanLeafs) {
				plan.subPlanLeafs = [];
			}
			if (query === undefined) {
				query = '';
			}
			let search = 'obj.planType.id=' + plan.type.id + " and obj.name like '%" + query + "%'";
			return PlanLeafService.getAdvancedSearch(search).then((data) => {
				$scope.selectArrays[plan.type.id] = data.data.values;
			});
		};

		$scope.checkSubPlanLeafs = function (account) {
			if (!account.subPlanLeafs) {
				account.subPlanLeafs = [];
			}
		};

		$scope.buscaSubLeafs = function (plan, query) {
			if (query === undefined) {
				query = '';
			}
			if (plan) {
				let search = 'obj.planType.id=' + plan.type.id + " and obj.name like '%" + query + "%'";
				return PlanLeafService.getAdvancedSearch(search).then((data) => {
					$scope.selectArray = data.data.values;
				});
			}
		};

		if ($scope.$ctrl.operation && $scope.$ctrl.operation === 'REPLECEMENT') {
			TitleService.getInstance()
				.then((data) => {
					$scope.replecement = $scope.entity.data;
					$scope.title.data = data.data;
				});
		} else if ($scope.$ctrl.operation && $scope.$ctrl.operation === 'RENEGOTIATION') {
			$scope.renegotiation = true;
			$scope.parcels = TitleService.getRenegociationParcels();
			$scope.idParcels = [];
			angular.forEach($scope.parcels, (parcel, index) => {
				$scope.idParcels.push(parcel.id);
				if ($scope.parcels.length === (index + 1)) {
					TitleService.getParcelsDTO($scope.idParcels).then(function (data) {
						$scope.parcelsDTO = data.data;
					})
				}
			});
			if ($scope.parcels.length === 0) {
				$scope.$ctrl.onParcelsEmpty();
			}
			$scope.title.data = $scope.entity.data || {};
		} else {
			$scope.title.data = $scope.entity.data || {};
		}


		$scope.title.data.parcel = $scope.title.data.parcel || [];
		$scope.title.data.numberParcel = $scope.title.data.numberParcel || 0;

		if ($scope.titleType !== undefined) {
			$scope.title.data.titleType = $scope.titleType.substr(0, 4) === 'edit' ? $scope.titleType.substring(4).toUpperCase() : $scope.titleType.toUpperCase();
		}

		$scope.title.data.billetCollection = $scope.title.data.billetCollection || 0;
		$scope.title.data.memo = $scope.title.data.memo || $scope.$ctrl.voice || ''; // Colocando o parametro da voz no campo de historico //
		$scope.title.data.parcelpenalty = $scope.title.data.parcelpenalty || 0;
		$scope.title.data.parcelinterest = $scope.title.data.parcelinterest || 0;
		$scope.title.data.expiration = $scope.title.data.expiration || new Date();

		if ($scope.title.data.titleType === 'PAY' && $scope.title.data.parcel[0]) { $scope.title.data.value = $scope.title.data.parcel[0].value; }

		$scope.calculatedInterest = function () {
			$scope.interestActive = !$scope.interestActive;
			if (!$scope.interestActive) {
				$scope.title.data.mora = $scope.title.data.value * $scope.title.data.parcelinterest / 30;
			} else {
				$scope.title.data.parcelinterest = 30 * $scope.title.data.mora / $scope.title.data.value;
			}
		};

		if ($scope.title.data.parcel.length > 0) {
			$scope.title.data.emissionDate = new Date($scope.title.data.emissionDate) || new Date();
		}

		$scope.verifyParcelDate = (parcel) => {
			$scope.dateNull = !parcel.expiration || parcel.expiration === null;
		};

		if ($scope.title.data.hasPayment || $scope.title.data.fullPaid || $scope.title.data.isReversed) {
			$scope.disable = true;
		}

		// Função para pegar o barCode do input quando for precionado enter.
		$scope.keyEnter = function ($event) {
			if ($event.keyCode === 13) {
				$scope.getDataFromBarcode();
			}
		};
		// Função para pegar os dados do barCode e retornar os valores dos campos preenchidos.
		$scope.getDataFromBarcode = function () {
			let barcode = $scope.title.data.barcode;
			if (barcode) {
				$scope.title.data.billetCollection++;
				TitleService.readBarCode(barcode).then((response) => {
					$scope.title.data.documentType = { "name": response.data.classe };
					if (response.data.individual.length > 0) {
						$scope.title.data.assignedIndividual = response.data.individual[0];
						if (response.data.individual[0].preferentialRatioPlan !== null) {
							$scope.automaticRatio(response.data.individual[0].preferentialRatioPlan)
						}
					}
					$scope.title.data.documentNumber = response.data.ourNumber;
					$scope.title.data.value = response.data.numberValue;

					if (response.data.checkDigit === "9" || response.data.checkDigit === "4") {
						$scope.title.data.expiration = new Date();
					} else {
						$scope.title.data.expiration = new Date(response.data.expirationDate)
					}
					var itemLabel = { value: response.data.classe, isTag: true };
					$scope.title.data.labels = [itemLabel];
					$scope.addParcel();
				}, (error) => {
					console.error(error);
					document.getElementById('barcode').select();
				});
			}
		};

		if ($scope.$ctrl.operation && $scope.$ctrl.operation === 'RENEGOTIATION') {
			$scope.title.data.discount = 0;
			$scope.titleType = 'receive';
			$scope.title.data.titleType = 'RECEIVE';
			let oldIndividual = null;
			$scope.value = 0;
			angular.forEach($scope.parcels, (v) => {
				$scope.value += v.value;
				if (!oldIndividual) {
					oldIndividual = v.individual;
				}
				if (oldIndividual && oldIndividual.id === v.individual.id) {
					$scope.title.data.assignedIndividual = v.individual;
				} else {
					$scope.title.data.assignedIndividual = null;
				}
				oldIndividual = v.individual;
			});
			$scope.title.data.value = 1;
			$scope.$watch('title.data.discount', (data) => {
				$scope.title.data.value = ($scope.value - data)
			});
		}

		$scope.save = function (entity) {
			if ($scope.$ctrl.operation === 'REPLEACEMENT') {
				$scope.replecement.replacedBy = entity;
				TitleService.saveReplecement(entity)
					.then(() => {
						$scope.$ctrl.onSaveOperationReplecement();
					});
			} else if ($scope.$ctrl.operation === 'RENEGOTIATION') {
				entity.parcelsToReplace = $scope.idParcels;
				TitleService.saveRenegotiation(entity)
					.then(() => {
						$scope.$ctrl.onSaveOperationRenegotiation();
					});
			} else {
				$scope.title.methods.put(entity);
			}
		};

		$scope.items = [];
		$scope.launchPaid = function () {
			let uibModalInstance = $uibModal.open({
				templateUrl: template,
				controller: 'ModalLaunchPaidController',
				size: 'lg',
				resolve: {
					items() {
						return $scope.items;
					}
				}
			});
			uibModalInstance.result.then((financeunitReturn) => {
				$scope.title.data.automaticFinanceUnit = financeunitReturn.automaticFinanceUnit;
				$scope.title.data.registerAsPayed = financeunitReturn.registerAsPayed;
				$scope.save($scope.title.data);
			});
		};

		$scope.back = function (rote) {
			$scope.$ctrl.onBackClick({ rote });
		};

		// Adicionar folha no rateio
		$scope.addLeaf = function (account) {
			let notFind = 0;
			let leaf = angular.copy(account.leaf);
			leaf.value = account.valueLeaf;
			if (!account.subPlanLeafs) {
				account.subPlanLeafs = [];
			}
			if (account.subPlanLeafs.length > 0) {
				angular.forEach(account.subPlanLeafs, (planLeaf) => {
					if (planLeaf.name === leaf.name) {
						planLeaf.value += leaf.value;
						notFind++;
					}
				});
			}
			if (notFind === 0) {
				account.subPlanLeafs.push(leaf);
			}
			account.leaf = null;
			account.valueLeaf = (account.value - $scope.sumLeafs(account));
		};

		$scope.selected = function (params) {
			$scope.title.data.parcelinterest = params.interest.value;
			$scope.title.data.parcelpenalty = params.penalty.value;
		};

		// somar folha do rateio
		$scope.sumLeafs = function (account) {
			let total = 0;
			if (account.subPlanLeafs && account.subPlanLeafs.length > 0) {
				angular.forEach(account.subPlanLeafs, (leaf) => {
					total += leaf.value;
				});
			}
			return total;
		};
		// Valida se o valor das folhas do rateio é maior que o valor do rateio
		$scope.validAddLeaf = function (account) {
			return ($scope.sumLeafs(account) + account.valueLeaf) > account.value;
		};
		// Valida se o valor das folhas do rateio é igual que o valor do rateio
		$scope.invalidAddLeaf = function (account) {
			return ($scope.sumLeafs(account) >= account.value);
		};
		// Remove as folhas do rateio
		$scope.removeLeaf = function (account, index) {
			account.subPlanLeafs.splice(index, 1);
			account.valueLeaf = (account.value - $scope.sumLeafs(account));
		};

		// verifica a troca do input de data para transforma-lá em um objeto para chamar a função de calcular parcelas.
		$scope.change = function () {
			if (!$scope.disable) {
				if ($scope.title.data.expiration) {
					$scope.title.data.expiration = new Date($scope.title.data.expiration);
					$scope.calculateParcels();
				}
				$timeout(() => {
					var objScroll = document.getElementById('scrollParcels');
					if (objScroll)
						objScroll.scrollTop = objScroll.scrollHeight;
				}, 700);
			}
		};


		// Calcula parcelas
		let setExpiration = function (parcel, expiration) {
			const dateNew = (parcel === 0) ? expiration.setMonth(expiration.getMonth()) : expiration.setMonth(expiration.getMonth() + 1);
			return new Date(dateNew);
		};

		$scope.calculateParcels = function () {
			let valueParcel = $scope.title.data.value;
			let numberParcel = $scope.title.data.numberParcel;
			let valueParcelReceive = parseFloat((valueParcel / numberParcel).toFixed(2));
			let valueRemainingCalculateReceive = parseFloat((valueParcel - (valueParcelReceive * numberParcel)).toFixed(2));
			$scope.title.data.parcel = [];

			if ((valueParcel / numberParcel) < 0.01) {
				SweetAlert.swal('Atenção!', 'O valor das parcelas não deve ser menor que R$ 0,01 centavo', 'warning');
				$scope.title.data.numberParcel = 0;
			}

			let expiration = new Date($scope.title.data.expiration);
			for (let i = 0; i < $scope.title.data.numberParcel; i++) {
				if ($scope.titleType === 'pay' || $scope.titleType === 'editpay') {
					let currentParcel = {
						number: i + 1,
						value: valueParcel,
						expiration: setExpiration(i, expiration)
					};
					$scope.title.data.parcel.push(currentParcel);
				}

				if ($scope.titleType === 'receive' || $scope.titleType === 'editreceive') {
					if (i === 0) {
						var currentParcelInt = {
							number: i + 1,
							value: (valueParcelReceive + valueRemainingCalculateReceive),
							expiration: setExpiration(i, expiration)
						};
						$scope.title.data.parcel.push(currentParcelInt);
					} else {
						var currentParcelInt = {
							number: i + 1,
							value: valueParcelReceive,
							expiration: setExpiration(i, expiration)
						};
						$scope.title.data.parcel.push(currentParcelInt);
					}
				}
			}

			$scope.elem = angular.copy($scope.title.data.parcel);
		};

		if (!$scope.title.data.id) {
			$scope.calculateParcels();
		}

		$scope.valores = function (model, account) {
			angular.forEach($scope.title.data.planLeafs, (data) => {
				if (account.id === data[model].id) {
					data[model].value = $scope.sumParcels($scope.title.data.parcel);
					data[model].valueLeaf = $scope.sumParcels($scope.title.data.parcel);
				}
			});
		};
		// Função para adicionar as parcelas na tabela a direita
		$scope.addParcel = function () {
			$scope.title.data.numberParcel++;
			let parcel = {
				number: $scope.title.data.numberParcel,
				value: $scope.title.data.value,
				expiration: $scope.title.data.expiration,
				barCode: $scope.title.data.barcode
			};

			if ($scope.title.data.numberParcel === 1) {
				$scope.title.data.parcel[0] = parcel;
			} else {
				$scope.title.data.parcel.push(parcel);
			}
			$scope.title.data.barcode = null;
		};

		$scope.title.data.planLeafs = $scope.title.data.planLeafs || [];
		$scope.addPlanLeaf = function () {
			$scope.title.data.planLeafs.push($scope.temp.planLeaf);
			$scope.temp.planEntry = null;
		};

		$scope.title.data.planEntries = $scope.title.data.planEntries || [];
		$scope.mountPlanEntries = function () {
			angular.forEach($scope.title.data.planLeafs, (c) => {
				$scope.title.data.planEntries.push(c);
				angular.forEach(c.subPlanLeafs, function (sc) {
					$scope.title.data.planEntries.push(sc);
				});
			});
		};

		// Configurações da tabela para listar as parcelas
		$scope.tableConfigListParcels = {
			columns: 'id,documentType,individual,value,payments',
			checkbox: false,
			columnsConfig: [
				{
					name: 'id',
					title: '<span gumga-translate-tag="entry.id">id</span>',
					content: '{{$value.id}}'
				}, {
					name: 'documentType',
					title: '<span gumga-translate-tag="documenttype.label">documentType</span>',
					content: '{{$value.documentType}}'
				}, {
					name: 'individual',
					title: '<span gumga-translate-tag="individualcredit.individual">individual</span>',
					content: '{{$value.individual.name}}'
				}, {
					name: 'value',
					title: '<span gumga-translate-tag="docted.value">value</span>',
					content: '{{$value.value | currency}}'
				}, {
					name: 'payments',
					title: '<span gumga-translate-tag="menu.financeunit">payments</span>',
					content: '<table style="border: none;" class="table table-hover" style="margin: 0;">' +
						'<tr ng-repeat="payment in $value.payments" ng-if="payment.value != 0">' +
						'<td style="border: none;" class="pull-left">{{payment.financeunit}}</td>' +
						'<td style="border: none;" class="pull-right"><button ng-click="$parent.$parent.$parent.$parent.reversal(payment.idPayment, \'PAYMENT\')" class="btn btn-primary btn-sm"><i class="fa fa-reply"></i></button></td>' +
						'<td style="border: none;" class="pull-right">{{payment.momment | date:"dd/mm/yyyy"}}</td>' +
						'<td style="border: none;" class="pull-right">{{payment.value | currency}}</td>' +
						'</tr>' +
						'</table>'
				}]
		};

		// Função que redireciona quando o formulário é salvo.
		$scope.title.on('putSuccess', () => {
			if ($scope.titleType === "pay" || $scope.titleType === "editpay") {
				$scope.$ctrl.onPayPutSuccess();
			}
			if ($scope.titleType === "receive" || $scope.titleType === "editreceive") {
				$scope.$ctrl.onReceivePutSuccess();
			} else {
				$scope.$ctrl.onPayPutSuccess();
			}
		});

		// Função para somar o valor total das parcelas.
		$scope.sumParcels = function (array) {
			return array.reduce((p, n) => {
				return p += n.value;
			}, 0);
		};

		$scope.totalSumParcel = $scope.sumParcels($scope.title.data.parcel);

		$scope.changeValueParcel = function (payment, oldValue) {
			if (!angular.equals(oldValue, payment.value) && $scope.title.data.parcel.length > 1 && $scope.title.data.id != null && $scope.title.data.titleType == 'RECEIVE') {
				SweetAlert.swal(
					{
						title: 'Valor',
						text: 'Deseja alterar o valor das demais parcelas?',
						type: 'warning',
						showCancelButton: true,
						confirmButtonColor: '#0cddb3',
						confirmButtonText: 'Sim, Altere!',
						cancelButtonText: 'Não!',
						closeOnConfirm: false,
						closeOnCancel: false
					},
					(isConfirm) => {

						if (isConfirm) {
							var index = $scope.title.data.parcel.indexOf(payment);
							var totalParcels = 0.00;

							for (var i = 0; i <= index; i++) {
								totalParcels += $scope.title.data.parcel[i].value;
							}


							if (totalParcels > $scope.totalSumParcel) {
								SweetAlert.swal("Atenção!", "O valor da soma das parcelas não deve ser maior que o valor total da venda", "error");
								payment.value = oldValue;
								return;
							}

							var index = $scope.title.data.parcel.indexOf(payment) + 1;
							var restValue = $scope.totalSumParcel - totalParcels;
							var countParcels = $scope.title.data.parcel.length - index;
							var parcelValue = restValue / countParcels;
							var total = 0;
							var count = 0;

							parcelValue = MoneyUtils.roundMoney(parcelValue);
							var parcelRemainder = ((restValue * 100) % countParcels) / 100,
								parcelRemainder = (parcelRemainder < 0.01) ? 0 : parcelRemainder;

							for (var i = index; i < $scope.title.data.parcel.length; i++) {
								count++;
								$scope.title.data.parcel[i].value = parcelValue;
								total = MoneyUtils.sumMoney(total, parcelValue);
								if (count === 1 && parcelRemainder !== 0) {
									$scope.title.data.parcel[i].value = MoneyUtils.sumMoney($scope.title.data.parcel[i].value, parcelRemainder);
									total = MoneyUtils.sumMoney(total, parcelRemainder);
								}
								if (count === countParcels) {
									if (restValue !== MoneyUtils.roundMoney(total)) {
										$scope.title.data.parcel[i].value = MoneyUtils.sumMoney($scope.title.data.parcel[i].value, MoneyUtils.sumMoney(restValue, -total));
									}
								}
							}
							swal("Alterado!", "Os valores foram alterados", "success");
						} else {

							swal("Mantido", "Os valores foram mantidos :)", "success");
						}
					}
				);
			}
		};

		$scope.changeDateParcel = function (value, index, oldDate) {
			if (!angular.equals(oldDate, value) && $scope.title.data.parcel.length > 1) {
				swal(
					{
						title: 'Vencimento',
						text: 'Deseja alterar o vencimento das demais parcelas?',
						type: 'warning',
						showCancelButton: true,
						confirmButtonColor: '#0cddb3',
						confirmButtonText: 'Sim, Altere!',
						cancelButtonText: 'Não!',
						closeOnConfirm: false,
						closeOnCancel: false
					},
					(isConfirm) => {
						if (isConfirm) {
							for (index; index < $scope.title.data.parcel.length; index++) {
								$scope.title.data.parcel[index].expiration = setExpiration(index, value);
							}
							swal("Alterado!", "Os vencimentos foram alterados", "success");
						} else {
							swal("Mantido", "Os vencimentos foram mantidos :)", "success");
						}
					}
				);
			}
		};

		$scope.paymentRest = 0;
		if ($scope.titleType === 'editpay' || $scope.titleType === 'editreceive') {
			// $scope.title.data.parcel.map(function (elem) {
			//     return new Date(elem.expiration);
			// });
			angular.forEach($scope.title.data.parcel, (params, index) => {
				$scope.title.data.parcel[index].expiration = moment.tz(params.expiration, "America/Sao_Paulo").toDate();
				if (!params.fullPaid) {
					$scope.paymentRest += params.value;
				}
				if (params.number === "1") {
					$scope.title.data.expiration = moment.tz(params.expiration, "America/Sao_Paulo").toDate() || new Date();
				}
			});
		}

		$scope.showBarCodeTitle = function () {
			return ($scope.title.data.titleType == 'PAY');
		};

		const getPayments = (parcels) => {
			const arr = [];
			parcels.forEach((parcelPayment) => {
				var gQuery = new GQuery(new Criteria('pp.id', ComparisonOperator.EQUAL, parcelPayment.id))
					.join(new Join('obj.parcelPayments as pp', JoinType.INNER));
				arr.push($scope.payment.methods.asyncSearchWithGQuery(gQuery));
			});
			return Promise.all(arr).then((response) => {
				let toReturn = [];
				response.forEach((data) => data.forEach((payment) => {
					if (toReturn.filter((d) => angular.equals(d, payment)).length === 0) {
						toReturn.push(payment);
					}
				}));
				return toReturn;
			})
		}

		$scope.printReceipt = (parcel) => {
			getPayments(parcel.parcelPayments).then((resp) => {
				const baseState = 'titleparcelreceive.list';
				const variables = [];
				variables.push(FinanceReportService.mountVariable('', 'idPayment', resp[0].id));
				FinanceReportService.openModalViewer('RECEIPTTITLE', [], variables, () => true, baseState);
			});
		};

		$scope.showPayments = function (parcel) {
			if (!parcel.parcelPayments.length) {
				SweetAlert.swal('Nenhum pagamento encontrado', 'Nenhum pagamento foi realizado para a parcela selecionada.', 'warning');
				return;
			}
			$uibModal.open({
				animation: true,
				templateUrl: templatePayments,
				controller: 'PaymentsModalController',
				backdrop: 'static',
				size: 'md',
				resolve: {
					parcelPayments() {
						return parcel.parcelPayments;
					}
				}
			});
		};
	}
}

export default TitleFormEmbeddedController;
