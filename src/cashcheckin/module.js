import controller from './controllers/CashCheckinEmbeddedFormController';
import component from './component/CashCheckinEmbedded';

export default angular.module('finance.cashcheckinembedded', [])
	.controller('CashCheckinEmbeddedFormController', controller)
	.component('cashCheckinEmbedded', component);

