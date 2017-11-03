require('../services/module')
module.exports = angular.module('finance.stimulsoftembedded.controllers', ['finance.stimulsoftembedded.service'])
    .controller('DesignerEmbeddedController', require('./DesignerEmbeddedController'))
    .controller('FinanceReportListEmbeddedController', require('./FinanceReportListEmbeddedController'))
    .controller('ReportTypeModalEmbeddedController', require('./ReportTypeModalEmbeddedController'))
    .controller('ViewerEmbeddedController', require('./ViewerEmbeddedController'));