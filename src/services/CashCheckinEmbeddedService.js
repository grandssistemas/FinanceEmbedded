CashCheckinEmbeddedService.$inject = ['GumgaRest', 'FinanceEmbeddedService'];

function CashCheckinEmbeddedService(GumgaRest, FinanceEmbeddedService){
    let service = new GumgaRest(FinanceEmbeddedService.getDefaultConfiguration().api + '/cashcheckin');

    service.getCurrentCheckin = function () {
        return service.extend('get', '/opencheckin');
    };

    service.getByCurrentCashCheckin = function (date) {
        return service.extend('get', '/getbycurrentcashcheckin?date='+date);
    };

    return service;
}

module.exports = CashCheckinEmbeddedService;
