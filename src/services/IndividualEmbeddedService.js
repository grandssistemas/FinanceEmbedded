IndividualEmbeddedService.$inject = ['GumgaRest', '$http', 'FinanceEmbeddedService']

function IndividualEmbeddedService(GumgaRest, $http, FinanceEmbeddedService) {
    var Service = new GumgaRest(FinanceEmbeddedService.getDefaultConfiguration().api + '/individual');

    Service.getLabels = function () {
        return Service.extend('get', '/individuallabel');
    };

    Service.searchLabels = function (param) {
        return Service.extend('get', '/individuallabel?' + param);
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
