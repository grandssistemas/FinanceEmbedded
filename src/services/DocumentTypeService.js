
DocumentTypeService.$inject = ['GumgaRest', 'FinanceEmbeddedService']

function DocumentTypeService(GumgaRest, FinanceEmbeddedService) {
    var Service = new GumgaRest(FinanceEmbeddedService.getDefaultConfiguration().api + '/documenttype');
    Service.getOldVersions = getOldVersions;

    function getOldVersions(id) {
        return Service.extend('GET', '/listoldversions/'.concat(id));
    }

    return Service;
}

module.exports = DocumentTypeService;
