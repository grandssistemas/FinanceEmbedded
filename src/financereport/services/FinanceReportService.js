var modalTemplate = require('../views/viewermodal.html');

FinanceReportService.$inject = ['GumgaRest', '$uibModal', 'FinanceEmbeddedService'];

function FinanceReportService(GumgaRest, $uibModal,  FinanceEmbeddedService) {
    var service = new GumgaRest(FinanceEmbeddedService.getDefaultConfiguration().api + '/financereport');

    service.getReportType = function () {
        return service.extend('get', '/getreporttype');
    };

    service.setConnectionLocal = function () {
        service.connectionLocal = FinanceEmbeddedService.getDefaultConfiguration().api + '/financereportconnect?gumgaToken=' + window.sessionStorage['token'];
    };

    service.setConnectionLocal();

    service.getByType = function (page, type) {
        if (page) {
            if (page < 1) {
                throw 'Invalid page';
            }
            this._query.params.start = (page - 1) * this._query.params.pageSize;
        }

        if (type) {
            this._query.params.aq = 'obj.type = \'' + type + '\'';
        }

        return service.extend('get', '', this._query);
    };

    service.getDefault = (type) => {
        return service.extend('get', `/getdefault/${type}`)
    };

    service.mountVariable = (category, name, value) => {
        const variable = new Stimulsoft.Report.Dictionary.StiVariable();
        variable.category = category;
        variable.name = name;
        variable.alias = name;
        variable.description = '';
        variable.value = value;
        variable.readOnly = true;
        variable.typeT = String;
        variable.requestFromUser = false;
        variable.key = null;
        variable.allowUseAsSqlParameter = false;
        return variable;
    };

    service.openModalViewer = function (type,filters,variables,noReport,baseState) {
        service.getDefault(type).then((response) => {
            if (response.data) {
                const modal = $uibModal.open({
                    templateUrl: modalTemplate,
                    controller: 'ViewerEmbeddedController',
                    backdrop: 'static',
                    size: 'lg',
                    resolve: {
                        entity: function () {
                            return response.data;
                        },
                        filters: function () {
                            return filters;
                        },
                        variable: function () {
                            return variables;
                        },
                        backState: function () {
                            return baseState;
                        }
                    }
                });
                modal.result.then(() => {
                }, () => {
                    $state.go(baseState)
                })
            } else {
                noReport();
            }
        });
    };

    service.mountVariable = (category, name, value) => {
        var variable = new Stimulsoft.Report.Dictionary.StiVariable();
        variable.category = category;
        variable.name = name;
        variable.alias = name;
        variable.description = '';
        variable.value = value;
        variable.readOnly = true;
        variable.typeT = String;
        variable.requestFromUser = false;
        variable.key = null;
        variable.allowUseAsSqlParameter = false;
        return variable;
    };

    return service;
}

module.exports = FinanceReportService;