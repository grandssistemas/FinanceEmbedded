import Style from './style/index.css'
require('./cashcheckin/module');
require('./cashcheckout/module');
require('./financeTitle/module');
require('./services/module');
require('./providers/module');


// DEPENDENCIAS
import GroupDependencies from './Utils/GroupDependencies'

// UTILS
import ngDynamicController from './Utils/DynamicController'
import bindHtmlCompile from './Utils/bindHtmlCompile'

const finance = angular.module('finance.embedded', ['ui.bootstrap', 'group.dependencies', 'finance.providers', 'finance.services', 'finance.title', 'finance.cashcheckinembedded', 'finance.cashcheckoutembedded'])

finance.directive('ngDynamicController', ngDynamicController)
finance.directive('bindHtmlCompile', bindHtmlCompile)

finance.config(['GumgaDateServiceProvider', (GumgaDateServiceProvider) => {
    GumgaDateServiceProvider.setDefaultConfiguration({
        minYear: 1500,
        closeOnChange: true
    });
}])

export default finance.name