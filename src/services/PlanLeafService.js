PlanLeafService.inject = ['GumgaRest', '$http', 'FinanceEmbeddedService']

function PlanLeafService(GumgaRest, $http, FinanceEmbeddedService) {
    var Service = new GumgaRest(FinanceEmbeddedService.getDefaultConfiguration().api + '/planleaf');

    Service.getTypes = function () {
        return $http.get(Service._url + '/types');
    };

    return Service;
}

module.exports = PlanLeafService;