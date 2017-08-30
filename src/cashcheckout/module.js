module.exports = angular.module('finance.cashcheckoutembedded', [])
    .controller('CashCheckoutEmbeddedFormController', require('./controllers/CashCheckoutEmbeddedFormController'))
    .component('cashCheckoutEmbedded', require('./component/CashCheckoutEmbedded'));
