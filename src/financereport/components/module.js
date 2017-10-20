require('../controllers/module');
module.exports = angular.module('finance.stimulsoftembedded.components', ['finance.stimulsoftembedded.controllers'])
    .component('financeReportDesignerEmbedded', require('./FinanceReportDesignerEmbedded'))
    .component('financeReportListEmbedded', require('./FinanceReportListEmbedded'))
    .component('financeReportViewerEmbedded', require('./FinanceReportViewerEmbedded'));
