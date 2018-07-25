
require('./style.css');
require('./views/BalanceModal.html');

module.exports = angular.module('finance.cashcheckoutembedded', [])
    .controller('CashCheckoutEmbeddedFormController', require('./controllers/CashCheckoutEmbeddedFormController'))
    .controller('BalanceModalController', require('./controllers/BalanceModalController'))
    .controller('ConfirmCashCheckoutModal', require('./controllers/ConfirmCashCheckoutModal'))
    .component('cashCheckoutEmbedded', require('./component/CashCheckoutEmbedded'));
