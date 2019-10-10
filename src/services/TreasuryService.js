TreasuryService.$inject = ['GumgaRest', 'FinanceEmbeddedService'];

function TreasuryService(GumgaRest, FinanceEmbeddedService) {
    var Service = new GumgaRest(FinanceEmbeddedService.getDefaultConfiguration().api + '/treasury');

    return Service;
}

module.exports = TreasuryService;
