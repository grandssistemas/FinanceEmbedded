CashCheckinEmbeddedService.$inject = ['GumgaRest', 'FinanceEmbeddedService', '$http'];

function CashCheckinEmbeddedService(GumgaRest, FinanceEmbeddedService, $http){
    let service = new GumgaRest(FinanceEmbeddedService.getDefaultConfiguration().api + '/cashcheckin');

    service.getCurrentCheckin = function () {
        return service.extend('get', '/opencheckin');
    };

    service.getByCurrentCashCheckin = function (date) {
        return service.extend('get', '/getbycurrentcashcheckin?date='+date);
    };

    service.update = function (entity) {
        if(entity.cashCheckouts.length > 0) {
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
        return $http.post('http://127.0.0.1:8084/finance-api/api/cashcheckin/do-cashcheckin', openCash);
    }

    return service;
}

module.exports = CashCheckinEmbeddedService;
