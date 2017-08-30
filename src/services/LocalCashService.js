LocalCashService.$inject = ['GumgaRest', 'FinanceEmbeddedService'];

function LocalCashService(GumgaRest, FinanceEmbeddedService) {
    var Service = new GumgaRest(FinanceEmbeddedService.getDefaultConfiguration().api + '/localcash');

    return Service;
}

module.exports = LocalCashService;