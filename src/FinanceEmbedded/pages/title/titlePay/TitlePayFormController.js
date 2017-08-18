const TitlePayFormController = (
    $scope,
    gumgaController,
    IndividualService,
    DocumentTypeService,
    TitleService,
    $timeout,
    RatioPlanService,
    PlanLeafService) => {

    TitleService.resetDefaultState();
    gumgaController.createRestMethods($scope, DocumentTypeService, 'documentType');
    // gumgaController.createRestMethods($scope, FinanceUnitService, 'financeunit');
    gumgaController.createRestMethods($scope, IndividualService, 'individual');
    gumgaController.createRestMethods($scope, RatioPlanService, 'ratioPlan');
    gumgaController.createRestMethods($scope, PlanLeafService, 'planLeaf');
    // gumgaController.createRestMethods($scope, WalletService, 'wallet');
    // gumgaController.createRestMethods($scope, TitleService, 'title')
    $scope.individual.methods.search('name', '');

    $scope.title = {};

    $scope.editParcels = false;
    $scope.selectArrays = [];
    $scope.totalRateio = 0;
    $scope.subLeafs = [];
    $scope.discount = 0;
    $scope.tags = [];
    $scope.step = 1;
    $scope.interestActive = true;

    $scope.changePage = () => {
        $scope.$emit('changeTitlePay', 'list')
    }

    TitleService.getPlanTree().then((response) => {
        $scope.planTree = response.data.values;
    });

    $scope.postDocType = (value) => {
        return DocumentTypeService.save(value);
    };

    $scope.labels = [];
    TitleService.getLabels().then((response) => {
        $scope.labels = response.data.values;
    }, (error) => {
        console.error(error.data);
    });

    $scope.labelTransform = (newLabel) => {
        let label = {
            value: newLabel
        };
        return label;
    };
    $scope.newPlanLeaf = (newLabel) => {
        let label = {
            name: newLabel
        };
        return label;
    };
    $scope.selectedRatio = (item, planType, index) => {
        if (item.isTag) {
            let position = $scope.title.planLeafs[index].length - 1;
            let leaf = {
                name: item.name,
                planType: planType
            };
            PlanLeafService.save(leaf).then((response) => {
                $scope.title.planLeafs[index][position] = response.data.data;
            });
        }
    };

    $scope.searchRatioPlan = (label, value) => {
        return RatioPlanService.advancedSearch(value).then((response) => {
            return $scope.ratioPlan = response.data.values;
        });
    }


    $scope.automaticRatio = (value) => {
        let total = $scope.sumParcels($scope.title.parcel);
        RatioPlanService.getAutomaticRatio(value.label, total).then((response) => {
            $scope.title.planLeafs = response.data;
        });
    };

    $scope.disable = false;
    $scope.changeStep = (numStep) => {
        if (numStep === 1) {
            if ($scope.title.hasPayment || $scope.title.fullPaid || $scope.renegotiation) {
                $scope.disable = true;
                $scope.step = numStep;
            } else {
                $scope.disable = false;
                $scope.step = numStep;
            }
        }
        if (numStep === 2) {
            $scope.disable = true;
            $scope.step = numStep;
        }
    };

    //Função de busca do rateio.
    $scope.buscaLeafs = (plan, query) => {
        if (!plan.subPlanLeafs) {
            plan.subPlanLeafs = []
        }
        if (query === undefined) {
            query = "";
        }
        let search = "obj.planType.id=" + plan.type.id + " and obj.name like '%" + query + "%'";
        return PlanLeafService.advancedSearch(search).then((response) => {
            $scope.selectArrays[plan.type.id] = response.data.values;
        })

    };

    $scope.checkSubPlanLeafs = (account) => {
        console.log(account)
        if (!account.subPlanLeafs) {
            account.subPlanLeafs = [];
        }
    };

    $scope.buscaSubLeafs = (plan, query) => {
        if (query === undefined) {
            query = "";
        }
        if (plan) {
            let search = "obj.planType.id=" + plan.type.id + " and obj.name like '%" + query + "%'";
            return PlanLeafService.advancedSearch(search).then(function (data) {
                $scope.selectArray = data.data.values;
            })
        }
    };

    $scope.title.parcel = $scope.title.parcel || [];
    $scope.title.numberParcel = $scope.title.numberParcel || 0;
    $scope.title.billetCollection = $scope.title.billetCollection || 0;
    $scope.title.parcelpenalty = $scope.title.parcelpenalty || 0;
    $scope.title.parcelinterest = $scope.title.parcelinterest || 0;
    $scope.title.expiration = $scope.title.expiration ? new Date($scope.title.expiration) : new Date();
    console.log($scope.title)

    $scope.calculatedInterest = () => {
        $scope.interestActive = !$scope.interestActive;
        if (!$scope.interestActive) {
            $scope.title.mora = $scope.title.value * $scope.title.parcelinterest / 30
        } else {
            $scope.title.parcelinterest = 30 * $scope.title.mora / $scope.title.value
        }
    };

    if ($scope.title.parcel.length > 0) {
        $scope.title.emissionDate = new Date($scope.title.emissionDate) || new Date();
    }


    if ($scope.title.hasPayment || $scope.title.fullPaid) {
        $scope.disable = true;
    }

    //Função para pegar o barCode do input quando for precionado enter.
    $scope.keyEnter = ($event) => {
        if ($event.keyCode === 13) {
            $scope.getDataFromBarcode();
        }
    };
    //Função para pegar os dados do barCode e retornar os valores dos campos preenchidos.
    $scope.getDataFromBarcode = () => {
        let barcode = $scope.title.barcode;
        if (barcode) {
            $scope.title.billetCollection++;
            TitleService.readBarCode(barcode).then((response) => {
                $scope.title.documentType = { "name": response.data.classe };
                if (response.data.individual.length > 0) {
                    $scope.title.assignedIndividual = response.data.individual[0];
                    if (response.data.individual[0].preferentialRatioPlan !== null) {
                        $scope.automaticRatio(response.data.individual[0].preferentialRatioPlan)
                    }
                }
                $scope.title.documentNumber = response.data.ourNumber;
                $scope.title.value = response.data.numberValue;

                if (response.data.checkDigit === "9" || response.data.checkDigit === "4") {
                    $scope.title.expiration = new Date();
                } else {
                    $scope.title.expiration = new Date(response.data.expirationDate)
                }
                let itemLabel = { value: response.data.classe, isTag: true };
                $scope.title.labels = [itemLabel];
                $scope.addParcel();
            }, (error) => {
                console.error(error);
                document.getElementById('barcode').select();
            });
        }
    };

    $scope.save = (vava) => {
        let av = angular.copy($scope.title)
        console.log(av)
        TitleService.saveTitle(av);
    };

    $scope.items = [];
    $scope.launchPaid = () => {
        let uibModalInstance = $uibModal.open({
            templateUrl: 'modules/title/views/ModalLaunchPaidController.html',
            controller: 'ModalLaunchPaidController',
            size: "lg",
            resolve: {
                items: () => {
                    return $scope.items;
                }
            }
        });
        uibModalInstance.result.then((financeunitReturn) => {
            $scope.title.automaticFinanceUnit = financeunitReturn.automaticFinanceUnit;
            $scope.title.registerAsPayed = financeunitReturn.registerAsPayed;
            $scope.save($scope.title);
        });
    };

    $scope.back = (rote) => {

    };

    //Adicionar folha no rateio
    $scope.addLeaf = (account) => {
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

    $scope.selected = (params) => {
        $scope.title.parcelinterest = params.interest.value;
        $scope.title.parcelpenalty = params.penalty.value;
    };

    //somar folha do rateio
    $scope.sumLeafs = (account) => {
        let total = 0;
        if (account.subPlanLeafs && account.subPlanLeafs.length > 0) {
            angular.forEach(account.subPlanLeafs, (leaf) => {
                total += leaf.value;
            });
        }
        return total;
    };
    //Valida se o valor das folhas do rateio é maior que o valor do rateio
    $scope.validAddLeaf = (account) => {
        return ($scope.sumLeafs(account) + account.valueLeaf) > account.value;
    };
    //Valida se o valor das folhas do rateio é igual que o valor do rateio
    $scope.invalidAddLeaf = (account) => {
        return ($scope.sumLeafs(account) >= account.value);
    };
    //Remove as folhas do rateio
    $scope.removeLeaf = (account, index) => {
        account.subPlanLeafs.splice(index, 1);
        account.valueLeaf = (account.value - $scope.sumLeafs(account));
    };


    //verifica a troca do input de data para transforma-lá em um objeto para chamar a função de calcular parcelas.
    $scope.change = () => {
        if ($scope.title.expiration) {
            $scope.title.expiration = new Date($scope.title.expiration);
            $scope.calculateParcels();
        }
        $timeout(() => {
            let objScroll = document.getElementById('scrollParcels');
            if (objScroll)
                objScroll.scrollTop = objScroll.scrollHeight;
        }, 700);
    };


    // Calcula parcelas
    const setExpiration = (parcel, expiration) => {
        return (parcel === 0) ? expiration.setMonth(expiration.getMonth()) : expiration.setMonth(expiration.getMonth() + 1);
    };

    $scope.calculateParcels = () => {
        let valueParcel = $scope.title.value;
        let numberParcel = $scope.title.numberParcel;
        $scope.title.parcel = [];
        let expiration = new Date($scope.title.expiration);
        for (let i = 0; i < $scope.title.numberParcel; i++) {
            let currentParcel = {
                number: i + 1,
                value: valueParcel,
                expiration: setExpiration(i, expiration)
            }
            $scope.title.parcel.push(currentParcel);
        }
        $scope.elem = angular.copy($scope.title.parcel);
    }

    if (!$scope.title.id) {
        $scope.calculateParcels();
    }

    $scope.valores = (model, account) => {
        angular.forEach($scope.title.planLeafs, (data) => {
            if (account.id === data[model].id) {
                data[model].value = $scope.sumParcels($scope.title.parcel);
                data[model].valueLeaf = $scope.sumParcels($scope.title.parcel);
            }
        })
    };
    //Função para adicionar as parcelas na tabela a direita
    $scope.addParcel = () => {
        $scope.title.numberParcel++;
        let parcel = {
            number: $scope.title.numberParcel,
            value: $scope.title.value,
            expiration: $scope.title.expiration,
            barCode: $scope.title.barcode
        };

        if ($scope.title.numberParcel === 1) {
            $scope.title.parcel[0] = parcel;
        } else {
            $scope.title.parcel.push(parcel);
        }
        $scope.title.barcode = null;
    };

    $scope.title.planLeafs = $scope.title.planLeafs || [];
    $scope.addPlanLeaf = () => {
        $scope.title.planLeafs.push($scope.temp.planLeaf);
        $scope.temp.planEntry = null;
    };

    $scope.title.planEntries = $scope.title.planEntries || [];
    $scope.mountPlanEntries = () => {
        angular.forEach($scope.title.planLeafs, (c) => {
            $scope.title.planEntries.push(c);
            angular.forEach(c.subPlanLeafs, (sc) => {
                $scope.title.planEntries.push(sc);
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

    //Função que redireciona quando o formulário é salvo.
    // $scope.title.on('putSuccess', () => {
    //     // $state.go('title.listpay');
    //     $scope.changePage();
    // });

    //Função para somar o valor total das parcelas.
    $scope.sumParcels = (array) => {
        return array.reduce((p, n) => {
            return p += n.value;
        }, 0);
    };

    $scope.changeValueParcel = (value, index) => {
        $scope.elem = angular.copy($scope.title.parcel);
        if (angular.equals($scope.elem[index].value, value)) {
            swal({
                title: "Valor",
                text: "Deseja alterar o valor das demais parcelas?",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#0cddb3",
                confirmButtonText: "Sim, Altere!",
                cancelButtonText: "Não!",
                closeOnConfirm: false,
                closeOnCancel: false
            },
                (isConfirm) => {
                    if (isConfirm) {
                        for (index; index < $scope.title.parcel.length; index++) {
                            $scope.title.parcel[index].value = value;
                        }
                        swal("Alterado!", "Os valores foram alterados", "success");
                    } else {
                        swal("Mantido", "Os valores foram mantidos :)", "success");
                    }
                });
        }
    }

    $scope.changeDateParcel = (value, index) => {
        if (!angular.equals($scope.title.parcel[index].expiration, new Date(value).getTime())) {
            swal({
                title: "Vencimento",
                text: "Deseja alterar o vencimento das demais parcelas?",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#0cddb3",
                confirmButtonText: "Sim, Altere!",
                cancelButtonText: "Não!",
                closeOnConfirm: false,
                closeOnCancel: false
            },
                (isConfirm) => {
                    if (isConfirm) {
                        for (index; index < $scope.title.parcel.length; index++) {
                            $scope.title.parcel[index].expiration = setExpiration(index, value);
                        }
                        swal("Alterado!", "Os vencimentos foram alterados", "success");
                    } else {
                        swal("Mantido", "Os vencimentos foram mantidos :)", "success");
                    }
                });
        }
    };

    $scope.paymentRest = 0;
    // if ($scope.titleType === 'editpay' || $scope.titleType === 'editreceive') {
    //     // $scope.title.parcel.map(function (elem) {
    //     //     return new Date(elem.expiration);
    //     // });
    //     angular.forEach($scope.title.parcel, function (params, index) {
    //         $scope.title.parcel[index].expiration = new Date(params.expiration);
    //         if (!params.fullPaid) {
    //             $scope.paymentRest += params.value;
    //         }
    //         if (params.number === "1") {
    //             $scope.title.expiration = new Date(params.expiration) || new Date();
    //         }
    //     });
}

TitlePayFormController.$inject = [
    '$scope',
    'gumgaController',
    'IndividualService',
    'DocumentTypeService',
    'TitleService',
    '$timeout',
    'RatioPlanService',
    'PlanLeafService'];

export default TitlePayFormController