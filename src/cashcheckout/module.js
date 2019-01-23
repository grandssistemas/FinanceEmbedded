
require('./style.css');
require('./views/BalanceModal.html');
require('./component/check/check');

module.exports = angular.module('finance.cashcheckoutembedded', ['mbCheck'])
    .controller('CashCheckoutEmbeddedFormController', require('./controllers/CashCheckoutEmbeddedFormController'))
    .controller('BalanceModalController', require('./controllers/BalanceModalController'))
    .controller('ConfirmCashCheckoutModal', require('./controllers/ConfirmCashCheckoutModal'))
    .component('cashCheckoutEmbedded', require('./component/CashCheckoutEmbedded'));
