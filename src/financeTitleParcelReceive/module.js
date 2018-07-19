module.exports = angular.module('finance.titleparcelreceive', ['finance.services', 'finance.titleparcel'])
	.controller('TitleParcelReceiveListEmbeddedController', require('./controllers/TitleParcelReceiveListEmbeddedController'))
	.controller('PayReceiveEmbeddedController', require('./controllers/PayReceiveEmbeddedController'))
	.component('financeTitleParcelReceivePayment', require('./component/TitleParcelReceivePaymentEmbedded'))
	.component('financeTitleParcelReceiveList', require('./component/TitleParcelReceiveListEmbedded'));

