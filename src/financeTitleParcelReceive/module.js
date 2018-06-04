import TitleParcelReceiveListEmbeddedController from './controllers/TitleParcelReceiveListEmbeddedController';
import PayReceiveEmbeddedController from './controllers/PayReceiveEmbeddedController';
import financeTitleParcelReceivePayment from './component/TitleParcelReceivePaymentEmbedded';
import financeTitleParcelReceiveList from './component/TitleParcelReceiveListEmbedded';

export default angular.module('finance.titleparcelreceive', ['finance.services', 'finance.titleparcel'])
	.controller('TitleParcelReceiveListEmbeddedController', TitleParcelReceiveListEmbeddedController)
	.controller('PayReceiveEmbeddedController', PayReceiveEmbeddedController)
	.component('financeTitleParcelReceivePayment', financeTitleParcelReceivePayment)
	.component('financeTitleParcelReceiveList', financeTitleParcelReceiveList);

