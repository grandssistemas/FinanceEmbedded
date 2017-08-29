IndividualEmbeddedService.$inject = ['GumgaRest', '$http', 'FinanceEmbeddedService']

function IndividualEmbeddedService(GumgaRest, $http, FinanceEmbeddedService) {
    var Service = new GumgaRest(FinanceEmbeddedService.getDefaultConfiguration().api + '/individual');

    Service.getLabels = function () {
        return $http.get(FinanceEmbeddedService.getDefaultConfiguration().api + '/individuallabel');
    };

    Service.searchLabels = function (param) {
        return $http.get(FinanceEmbeddedService.getDefaultConfiguration().api + '/individuallabel?' + param)
    };


    return Service;
}

module.exports = IndividualEmbeddedService;
