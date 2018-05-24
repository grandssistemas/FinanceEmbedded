require('./style/index.css');

require('./financereport/module');
require('./cashcheckin/module');
require('./cashcheckout/module');
require('./financeTitle/module');
require('./financeTitleParcelPay/module');
require('./financeTitleParcelReceive/module');
require('./services/module');
require('./providers/module');

// DEPENDENCIAS
require('./Utils/GroupDependencies');

// UTILS
import ngDynamicController from './Utils/DynamicController'
import bindHtmlCompile from './Utils/bindHtmlCompile'

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

export default finance.name