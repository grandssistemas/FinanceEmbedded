DocTedService.$inject = ['GumgaRest', 'FinanceEmbeddedService'];

function DocTedService(GumgaRest, FinanceEmbeddedService) {
    var Service = new GumgaRest(FinanceEmbeddedService.getDefaultConfiguration().api + '/entry');

    Service.save = save;
    Service.getEntry = getEntry;

    function save(data) {
        var transferTo = '[' + data.bank.name + ']' + data.agency + ' - ' + data.name + '\n';
        data.available = true;
        data.value = -data.value;
        data.availableIn = data.momment;
        return {
            ted: function () {
                data.historic = '[TED] '.concat(transferTo);
                return Service.extend('POST', '/ted', data)
            },
            doc: function () {
                data.historic = '[DOC] '.concat(transferTo);
                return Service.extend('POST', '/doc', data);
            }
        }
    }

    function getEntry(url, start) {
        start = start || 0;
        return Service.extend('GET', '/', {
            params: {
                aq: url,
                pageSize: 10,
                start: start
            }
        })
    }


    return Service;
}

module.exports = DocTedService;