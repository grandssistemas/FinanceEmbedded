IndividualEmbeddedService.$inject = ['GumgaRest', '$http', 'FinanceEmbeddedService']

function IndividualEmbeddedService(GumgaRest, $http, FinanceEmbeddedService) {
    var Service = new GumgaRest(FinanceEmbeddedService.getDefaultConfiguration().api + '/individuallabel');

    Service.getLabels = function () {
        return $http.get(FinanceEmbeddedService.getDefaultConfiguration().api);
    };

    Service.searchLabels = function (param) {
        return $http.get(FinanceEmbeddedService.getDefaultConfiguration().api + '?' + param)
    };


    return Service;
}

module.exports = IndividualEmbeddedService;
