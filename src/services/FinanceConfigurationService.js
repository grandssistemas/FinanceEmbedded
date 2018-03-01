FinanceConfigurationService.$inject = ['GumgaRest', 'FinanceEmbeddedService'];

function FinanceConfigurationService(GumgaRest, FinanceEmbeddedService) {
    var Service = new GumgaRest(FinanceEmbeddedService.getDefaultConfiguration().api + '/financeconfiguration');

    return Service;
}

module.exports = FinanceConfigurationService;