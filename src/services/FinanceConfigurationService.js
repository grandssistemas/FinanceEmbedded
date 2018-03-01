FinanceConfigurationService.$inject = ['GumgaRest', 'FinanceEmbeddedService'];

function FinanceConfigurationService(GumgaRest, FinanceEmbeddedService) {
    var Service = new GumgaRest(FinanceEmbeddedService.getDefaultConfiguration().api + '/financeconfiguration');

    Service.getCurrentVersion = function () {
        return Service.extend('get', '/getcurrentversion');
    };

    return Service;
}

module.exports = FinanceConfigurationService;