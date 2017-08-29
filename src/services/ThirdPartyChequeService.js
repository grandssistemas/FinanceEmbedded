ThirdPartyChequeService.$inject = ['GumgaRest', 'FinanceEmbeddedService'];

function ThirdPartyChequeService(GumgaRest, FinanceEmbeddedService) {
    var Service = new GumgaRest(FinanceEmbeddedService.getDefaultConfiguration().api + '/thirdpartycheque');


    return Service;
}

module.exports = ThirdPartyChequeService;