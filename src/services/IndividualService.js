IndividualService.inject = ['GumgaRest', '$http', 'FinanceEmbeddedService']

function IndividualService(GumgaRest, $http, FinanceEmbeddedService) {
    var Service = new GumgaRest(FinanceEmbeddedService.getDefaultConfiguration().api + '/individual');

    Service.getLabels = function () {
        return $http.get(FinanceEmbeddedService.getDefaultConfiguration().api + '/individuallabel');
    };

    Service.searchLabels = function (param) {
        return $http.get(FinanceEmbeddedService.getDefaultConfiguration().api + '/individuallabel?' + param)
    };


    return Service;
}

module.exports = IndividualService;
