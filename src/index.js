import Style from './style/index.css'

import GroupDependencies from './Utils/GroupDependencies'

import financeEmbedded from './FinanceEmbedded/financeEmbedded'
import ngDynamicController from './Utils/DynamicController'
import FinanceEmbeddedService from './FinanceEmbedded/financeEmbeddedService'
import TitlePayListController from './FinanceEmbedded/pages/title/titlePay/TitlePayListController'
import TitleReceiveListController from './FinanceEmbedded/pages/title/titleReceive/TitleReceiveListController'
import TitleService from './FinanceEmbedded/pages/title/TitleService'
import titlePay from './FinanceEmbedded/pages/title/titlePay/titlePay'
import bindHtmlCompile from './Utils/bindHtmlCompile'


const finance = angular.module('finance.embedded', ['ngSanitize', 'ui.bootstrap', 'group.dependencies'])
finance.service('FinanceEmbeddedService', FinanceEmbeddedService)
finance.service('TitleService', TitleService)

finance.controller('TitlePayListController', TitlePayListController)
finance.controller('TitleReceiveListController', TitleReceiveListController)



finance.directive('financeEmbedded', financeEmbedded)
finance.directive('ngDynamicController', ngDynamicController)
finance.directive('titlePay', titlePay)
finance.directive('bindHtmlCompile', bindHtmlCompile)

export default finance.name