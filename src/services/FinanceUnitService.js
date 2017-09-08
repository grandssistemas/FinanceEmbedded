FinanceUnitService.$inject = ['GumgaRest', '$http', 'FinanceEmbeddedService']

function FinanceUnitService(GumgaRest, $http, FinanceEmbeddedService) {
    var Service = new GumgaRest(FinanceEmbeddedService.getDefaultConfiguration().api + '/financeunit');
    var apiExecutionQuery = FinanceEmbeddedService.getDefaultConfiguration().api + '/executionquerys';

    Service.getEntriesFromFinanceUnit = function (id) {
        return $http.get(apiExecutionQuery + '/entriesfromlastbalance/' + id);
    };

    Service.getEntriesFromFinanceUnitFilter = function (params) {
        return $http.get(apiExecutionQuery + '/entriesfromlastbalance/' + params);
    };

    Service.getConciliatedEntriesFromFinanceUnitFilter = function (params) {
        return $http.get(apiExecutionQuery + '/conciliatedentriesfromlastbalance/' + params);
    };

    Service.getConciliatedEntriesFromLastBalance = function (id) {
        return $http.get(apiExecutionQuery + '/conciliatedentriesfromlastbalance/' + id);
    };

    Service.getByQ = function (q) {
        return $http.get(Service._url + '?pageSize=10&start=0&searchFields=name&q=' + q);
    };

    Service.balance = function (id) {
        return $http.get(apiExecutionQuery + '/entriesfromlastbalance/' + id)
    };

    Service.getEntriesByFinanceUnitAndCheckin = (financeUnitId, checkinId) => {
        return $http.get(`${apiExecutionQuery}/entriesbyfinanceunitandcheckin/${financeUnitId}/${checkinId}`)
    }

    Service.getEntriesByCheckin = (checkinId) => {
        return $http.get(`${apiExecutionQuery}/entriesbycheckin/${checkinId}`)
    }

    return Service;
}

module.exports = FinanceUnitService;
