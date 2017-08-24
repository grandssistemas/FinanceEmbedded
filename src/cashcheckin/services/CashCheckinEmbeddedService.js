CashCheckinEmbeddedService.$inject = ['GumgaRest', 'FinanceEmbeddedService'];

function CashCheckinEmbeddedService(GumgaRest, FinanceEmbeddedServiceProvider){
    let service = new GumgaRest(FinanceEmbeddedServiceProvider.api + '/cashcheckin');

    service.getCurrentCheckin = function () {
        return service.extend('get', '/opencheckin');
    };

    service.getByCurrentCashCheckin = function (date) {
        return service.extend('get', '/getbycurrentcashcheckin?date='+date);
    };

    return service;
}

module.exports = CashCheckinEmbeddedService;
