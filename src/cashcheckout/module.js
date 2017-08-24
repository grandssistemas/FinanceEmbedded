module.exports = angular.module('finance.cashcheckoutembedded', [])
    .controller('CashCheckoutEmbeddedFormController', require('./controllers/CashCheckoutEmbeddedFormController'))
    .service('CashCheckoutEmbeddedService', require('./services/CashCheckoutEmbeddedService'))
    .component('CashCheckoutEmbedded', require('./component/CashCheckoutEmbedded'));
