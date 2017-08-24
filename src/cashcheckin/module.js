module.exports = angular.module('finance.cashcheckinembedded', [])
    .controller('CashCheckinEmbeddedFormController', require('./controllers/CashCheckinEmbeddedFormController'))
    .component('cashCheckinEmbedded', require('./component/CashCheckinEmbedded'));


