FinanceUnitGroupService.$inject = ['GumgaRest', 'FinanceEmbeddedService'];

function FinanceUnitGroupService(GumgaRest, FinanceEmbeddedService){
    var service = new GumgaRest(FinanceEmbeddedService.getDefaultConfiguration().api + '/financeunitgroup');
    let group;

    service.getOpen = () => {
        if (!group) {
            let cash = localStorage.getItem('groupOpen');
            if (cash !== 'undefined') {
                return group = JSON.parse(cash);
            }
            return null;
        }
        return group;
    };

    service.getUpdateGroup = function () {
        if (!group) {
            let cash = localStorage.getItem('groupOpen');
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
        if (value) {
            localStorage.setItem('groupOpen', JSON.stringify(value));
            group = value;   
        }
    };

    service.removeSessionGroup = function () {
        localStorage.removeItem('groupOpen');
        group = null;
    };

    service.getDefaultGroup = function () {
        return service.extend('get', '/getdefaultgroup');
    };

    service.getGQueryV2 = function(param) {
        let GQueryBase = new GQuery()
        .select("exists(select cc.id from CashCheckin cc join cc.group as g where g.id = obj.id and cc.status = 'ABERTO') as caixaAberto")
        .select("obj.id as id")
        .select("obj.name as name")
        .select("obj.integrationValue as integrationValue")

        return service.searchWithGQuery(GQueryBase
            .and(new Criteria('obj.name', ComparisonOperator.CONTAINS, param).addIgnoreCase().addTranslate())
            .and(new Criteria('obj.pdvIntegrationId', ComparisonOperator.IS, new CriteriaField('null'))))
    }


    return service;
};

module.exports = FinanceUnitGroupService;