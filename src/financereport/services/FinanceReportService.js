var modalTemplate = require('../views/viewermodal.html');

FinanceReportService.$inject = ['GumgaRest', '$uibModal', 'apiLocation'];

function FinanceReportService(GumgaRest, $uibModal, apiLocation) {
    var service = new GumgaRest(apiLocation + '/api/financereport');

    service.getReportType = function () {
        return service.extend('get', '/getreporttype');
    };

    service.setConnectionLocal = function () {
        service.connectionLocal = apiLocation + '/api/financereportconnect?gumgaToken=' + window.sessionStorage['token'];
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

    service.openModalViewer = function (type,filters,variables,noReport) {
        service.getDefault(type).then((response) => {
            if (response.data) {
                $uibModal.open({
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
                            return '';
                        }
                    }
                });
            } else {
                noReport();
            }
        });
    };

    return service;
}

module.exports = FinanceReportService;