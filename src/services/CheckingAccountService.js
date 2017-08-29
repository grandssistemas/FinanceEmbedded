CheckingAccountService.$inject = ['GumgaRest', 'FinanceEmbeddedService'];

function CheckingAccountService(GumgaRest, FinanceEmbeddedService) {
    var Service = new GumgaRest(FinanceEmbeddedService.getDefaultConfiguration().api + '/checkingaccount');

    return Service;
}

module.exports = CheckingAccountService;
