FinanceUnitGroupService.$inject = ['GumgaRest', 'FinanceEmbeddedService'];

function FinanceUnitGroupService(GumgaRest, FinanceEmbeddedService){
    var Service = new GumgaRest(FinanceEmbeddedService.getDefaultConfiguration().api + '/financeunitgroup');
    return Service;
};

module.exports = FinanceUnitGroupService;