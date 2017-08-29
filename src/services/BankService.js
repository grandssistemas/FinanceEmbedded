BankService.$inject = ['GumgaRest', 'FinanceEmbeddedService'];

function BankService(GumgaRest, FinanceEmbeddedService) {
    var Service = new GumgaRest(FinanceEmbeddedService.getDefaultConfiguration().api + '/bank');

    return Service;
}

module.exports = BankService;