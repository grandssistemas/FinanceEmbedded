CashCheckinEmbeddedService.$inject = ['GumgaRest', 'FinanceEmbeddedService', '$http'];

function CashCheckinEmbeddedService(GumgaRest, FinanceEmbeddedService, $http) {
    let service = new GumgaRest(FinanceEmbeddedService.getDefaultConfiguration().api + '/cashcheckin');

    service.getCurrentCheckin = function () {
        return service.extend('get', '/opencheckin');
    };

    service.getLastCheckout = function (groupIntegrationId) {
        return service.extend('get', '/getchangelastcheckout?idPdv=' + groupIntegrationId);
    };

    service.getByCurrentCashCheckin = function (date, financeUnitGroupId) {
        return service.extend('get', '/getbycurrentcashcheckin?date=' + date + '&financeUnitGroupId=' + financeUnitGroupId);
    };

    service.update = function (entity) {
        if (entity.cashCheckouts && entity.cashCheckouts.length > 0) {
            return $http.post(FinanceEmbeddedService.getDefaultConfiguration().api + '/cashcheckin', entity);
        }
        const openCash = {
            "employee": {
                "id": entity.employee.id,
                "securityLogin": entity.employee.employeeValue.securityLogin
            },
            "cashRegister": {
                "id": entity.group.id
            },
            "pointOfSale": {
                "id": entity.group.integrationValue.integrationId,
                "change": entity.change
            }
        }
        return $http.post(FinanceEmbeddedService.getDefaultConfiguration().api + '/cashcheckin/do-cashcheckin', openCash);
    }

    service.close = function (cashCheckinId) {
        return $http.post(`${FinanceEmbeddedService.getDefaultConfiguration().api}/cashcheckin/close/${cashCheckinId}`);
    }

    return service;
}

module.exports = CashCheckinEmbeddedService;
