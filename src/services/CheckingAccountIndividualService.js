CheckingAccountIndividualService.$inject = ['GumgaRest', 'FinanceEmbeddedService'];

function CheckingAccountIndividualService(GumgaRest, FinanceEmbeddedService) {
    var Service = new GumgaRest(FinanceEmbeddedService.getDefaultConfiguration().api + '/checking-account-individual');

    return Service;
}

module.exports = CheckingAccountIndividualService;
