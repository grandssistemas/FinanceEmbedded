WalletService.inject = ['GumgaRest', 'FinanceEmbeddedService']

function WalletService(GumgaRest, FinanceEmbeddedService) {
    var Service = new GumgaRest(FinanceEmbeddedService.getDefaultConfiguration().api + '/wallet');

    return Service;
}

module.exports = WalletService;

