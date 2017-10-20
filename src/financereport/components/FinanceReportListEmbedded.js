let template = require('../views/list.html');

module.exports = {
    templateUrl: template,
    controller: 'FinanceReportListEmbeddedController',
    bindings:{
        viewReport: '&',
        editReport: '&',
        insertReport: '&'
    }
};