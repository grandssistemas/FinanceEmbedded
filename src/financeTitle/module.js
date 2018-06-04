import ModalParticipationController from './controllers/ModalParticipationController';
import ModalLaunchPaidController from './controllers/ModalLaunchPaidController';
import PaymentsModalController from './controllers/PaymentsModalController';
import TitleListEmbeddedController from './controllers/TitleListEmbeddedController';
import ReceiveTitlePrintModalController from './controllers/ReceiveTitlePrintModalController';
import financeTitleList from './component/TitleListEmbedded';
import financeTitleForm from './component/TitleFormEmbedded';

export default angular.module('finance.title', ['finance.services'])
	.controller('ModalParticipationController', ModalParticipationController)
	.controller('ModalLaunchPaidController', ModalLaunchPaidController)
	.controller('PaymentsModalController', PaymentsModalController)
	.controller('TitleListEmbeddedController', TitleListEmbeddedController)
	.controller('ReceiveTitlePrintModalController', ReceiveTitlePrintModalController)
	.component('financeTitleList', financeTitleList)
	.component('financeTitleForm', financeTitleForm);
