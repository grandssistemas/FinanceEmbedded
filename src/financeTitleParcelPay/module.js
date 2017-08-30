module.exports = angular.module('finance.titleparcel', ['finance.services'])
    .controller('TitleParcelPayListEmbeddedController', require('./controllers/TitleParcelPayListEmbeddedController'))
    .controller('ReceivePrintEmbeddedController', require('./controllers/ReceivePrintEmbeddedController'))
    .controller('PayEmbeddedController', require('./controllers/PayEmbeddedController'))
    .component('financeTitleParcelPayPayment', require('./component/TitleParcelPayPaymentEmbedded'))
    .component('financeTitleParcelPayList', require('./component/TitleParcelPayListEmbedded'));


