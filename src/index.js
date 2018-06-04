// UTILS
import ngDynamicController from './Utils/DynamicController';
import bindHtmlCompile from './Utils/bindHtmlCompile';

import './style/index.css';
import './financereport/module';
import './cashcheckin/module';
import './cashcheckout/module';
import './financeTitle/module';
import './financeTitleParcelPay/module';
import './financeTitleParcelReceive/module';
import './services/module';
import './providers/module';

import './Utils/GroupDependencies';

const finance = angular.module('finance.embedded', [
	'ui.bootstrap',
	'group.dependencies',
	'finance.providers',
	'finance.services',
	'finance.title',
	'finance.titleparcel',
	'finance.titleparcelreceive',
	'finance.stimulsoftembedded',
	'finance.cashcheckinembedded',
	'finance.cashcheckoutembedded',
	'gumga.date']);

finance.directive('ngDynamicController', ngDynamicController);
finance.directive('bindHtmlCompile', bindHtmlCompile);

finance.config(['GumgaDateServiceProvider', (GumgaDateServiceProvider) => {
	GumgaDateServiceProvider.setDefaultConfiguration({
		minYear: 1500,
		closeOnChange: true
	});
}]);

export default finance.name;
