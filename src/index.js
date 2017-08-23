import Style from './style/index.css'
require('./title/module');

// DEPENDENCIAS
import GroupDependencies from './Utils/GroupDependencies'

// UTILS
import ngDynamicController from './Utils/DynamicController'
import bindHtmlCompile from './Utils/bindHtmlCompile'

// SERVICES
import FinanceEmbeddedService from './services/financeembedded.provider'
// 'ngSanitize',

const finance = angular.module('finance.embedded', ['ui.bootstrap', 'group.dependencies', 'finance.title.list'])

finance.provider('FinanceEmbeddedService', FinanceEmbeddedService)
finance.directive('ngDynamicController', ngDynamicController)
finance.directive('bindHtmlCompile', bindHtmlCompile)

finance.config(['GumgaDateServiceProvider', (GumgaDateServiceProvider) => {
    GumgaDateServiceProvider.setDefaultConfiguration({
        minYear: 1500,
        closeOnChange: true
    });
}])

export default finance.name