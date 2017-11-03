IndividualEmbeddedService.$inject = ['GumgaRest', '$http', 'FinanceEmbeddedService']

function IndividualEmbeddedService(GumgaRest, $http, FinanceEmbeddedService) {
    var Service = new GumgaRest(FinanceEmbeddedService.getDefaultConfiguration().api + '/individual');

    Service.getLabels = function () {
        return $http.get(FinanceEmbeddedService.getDefaultConfiguration().api + '/individuallabel');
    };

    Service.searchLabels = function (param) {
        return $http.get(FinanceEmbeddedService.getDefaultConfiguration().api + '/individuallabel?' + param);
    };

    Service.getLogged = function(){
        return Service.extend('get', '/getlogged');
    };

    Service.getEmployees = function(){
        return Service.extend('get', '/getemployees');
    };


    return Service;
}

module.exports = IndividualEmbeddedService;
