require('../../providers/module');
module.exports = angular.module('finance.stimulsoftembedded.service', ['finance.providers'])
    .service('FinanceReportService',require('./FinanceReportService'));

