RatioPlanService.inject = ['GumgaRest', '$http', 'FinanceEmbeddedService']

function RatioPlanService(GumgaRest, $http, FinanceEmbeddedService) {
    var Service = new GumgaRest(FinanceEmbeddedService.getDefaultConfiguration().api + '/ratioplan');

    Service.getAutomaticRatio = function (plan, total) {
        return $http.get(FinanceEmbeddedService.getDefaultConfiguration().api + '/ratioplan/automaticratio/' + plan + '/' + total);
    };

    return Service;
}

module.exports = RatioPlanService;