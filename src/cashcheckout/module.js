
require('./views/BalanceModal.html');

module.exports = angular.module('finance.cashcheckoutembedded', ['ui.utils.masks'])
    .controller('CashCheckoutEmbeddedFormController', require('./controllers/CashCheckoutEmbeddedFormController'))
    .controller('BalanceModalController', require('./controllers/BalanceModalController'))
    .component('cashCheckoutEmbedded', require('./component/CashCheckoutEmbedded'));
