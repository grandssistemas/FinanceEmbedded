import TitleParcelPayListEmbeddedController from './controllers/TitleParcelPayListEmbeddedController';
import ReceivePrintEmbeddedController from './controllers/ReceivePrintEmbeddedController';
import PayEmbeddedController from './controllers/PayEmbeddedController';
import financeTitleParcelPayPayment from './component/TitleParcelPayPaymentEmbedded';
import financeTitleParcelPayList from './component/TitleParcelPayListEmbedded';

export default angular.module('finance.titleparcel', ['finance.services'])
	.controller('TitleParcelPayListEmbeddedController', TitleParcelPayListEmbeddedController)
	.controller('ReceivePrintEmbeddedController', ReceivePrintEmbeddedController)
	.controller('PayEmbeddedController', PayEmbeddedController)
	.component('financeTitleParcelPayPayment', financeTitleParcelPayPayment)
	.component('financeTitleParcelPayList', financeTitleParcelPayList);

