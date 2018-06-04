import './views/BalanceModal.html';
import CashCheckoutEmbeddedFormController from './controllers/CashCheckoutEmbeddedFormController';
import BalanceModalController from './controllers/BalanceModalController';
import cashCheckoutEmbedded from './component/CashCheckoutEmbedded';

export default angular.module('finance.cashcheckoutembedded', [])
	.controller('CashCheckoutEmbeddedFormController', CashCheckoutEmbeddedFormController)
	.controller('BalanceModalController', BalanceModalController)
	.component('cashCheckoutEmbedded', cashCheckoutEmbedded);
