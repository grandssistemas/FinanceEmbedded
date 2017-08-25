ChequePortfolioService.$inject = ['GumgaRest', 'FinanceEmbeddedService'];

function ChequePortfolioService(GumgaRest, FinanceEmbeddedService) {
    var Service = new GumgaRest(FinanceEmbeddedService.getDefaultConfiguration().api + '/chequeportfolio');


    return Service;
}

module.exports = ChequePortfolioService;