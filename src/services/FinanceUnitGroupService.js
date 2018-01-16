FinanceUnitGroupService.$inject = ['GumgaRest', 'FinanceEmbeddedService'];

function FinanceUnitGroupService(GumgaRest, FinanceEmbeddedService){
    var service = new GumgaRest(FinanceEmbeddedService.getDefaultConfiguration().api + '/financeunitgroup');
    let group;

    service.getOpen = () => {
        if (!group) {
            let cash = sessionStorage.getItem('groupOpen');
            if (cash !== 'undefined') {
                return group = JSON.parse(cash);
            }
            return null;
        }
        return group;
    };

    service.getUpdateGroup = function () {
        if (!group) {
            let cash = sessionStorage.getItem('groupOpen');
            if (cash === 'undefined' || cash === 'null') {
                return service.getDefaultGroup().then(function (data) {
                    service.setGroup(data.data);
                    return data.data;
                })
            }
            group = JSON.parse(cash);
        }
        return service.getById(group.id).then(function (data) {
            service.setGroup(data.data);
            return group;
        });
    };

    service.setGroup = function (value) {
        sessionStorage.setItem('groupOpen', JSON.stringify(value));
        group = value;
    };

    service.removeSessionGroup = function () {
        sessionStorage.removeItem('groupOpen');
        group = null;
    };

    service.getDefaultGroup = function () {
        return service.extend('get', '/getdefaultgroup');
    };


    return service;
};

module.exports = FinanceUnitGroupService;