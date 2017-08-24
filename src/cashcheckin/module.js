module.exports = angular.module('finance.cashcheckinembedded', [])
    .controller('CashCheckinEmbeddedFormController', require('./controllers/CashCheckinEmbeddedFormController'))
    .service('CashCheckinEmbeddedService', require('./services/CashCheckinEmbeddedService'))
    .component('CashCheckinEmbedded', require('./component/CashCheckinEmbedded'));


