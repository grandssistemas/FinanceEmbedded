require('./style/index.css');

module.exports = angular.module('finance.embedded', ['ngSanitize','ui.bootstrap'])
.directive('financeEmbedded', require("./FinanceEmbedded/financeEmbedded"))
.service('FinanceEmbeddedService', require('./FinanceEmbedded/financeEmbeddedService'))

