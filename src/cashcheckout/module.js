
require('./style.css');
require('./views/BalanceModal.html');

module.exports = angular.module('finance.cashcheckoutembedded', [])
    .controller('CashCheckoutEmbeddedFormController', require('./controllers/CashCheckoutEmbeddedFormController'))
    .controller('BalanceModalController', require('./controllers/BalanceModalController'))
    .component('cashCheckoutEmbedded', require('./component/CashCheckoutEmbedded'));
