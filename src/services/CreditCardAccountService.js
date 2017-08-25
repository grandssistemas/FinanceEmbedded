CreditCardAccountService.$inject = ['GumgaRest', 'FinanceEmbeddedService'];

function CreditCardAccountService(GumgaRest, FinanceEmbeddedService) {
    var Service = new GumgaRest(FinanceEmbeddedService.getDefaultConfiguration().api + '/creditcardaccount');

    return Service;
}

module.exports = CreditCardAccountService;