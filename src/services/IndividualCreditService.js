IndividualCreditService.$inject = ['GumgaRest', 'FinanceEmbeddedService'];

function IndividualCreditService(GumgaRest, FinanceEmbeddedService) {
    var Service = new GumgaRest(FinanceEmbeddedService.getDefaultConfiguration().api + '/individualcredit');

    return Service;
}

module.exports = IndividualCreditService;