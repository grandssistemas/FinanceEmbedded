import Style from './style/index.css'

// DEPENDENCIAS
import GroupDependencies from './Utils/GroupDependencies'

// PRINCIPAL
import financeEmbedded from './FinanceEmbedded/financeEmbedded'

// UTILS
import ngDynamicController from './Utils/DynamicController'
import bindHtmlCompile from './Utils/bindHtmlCompile'

// SERVICES
import FinanceEmbeddedService from './FinanceEmbedded/financeEmbeddedService'
import TitleService from './FinanceEmbedded/pages/title/TitleService'
import IndividualService from './FinanceEmbedded/services/IndividualService'
import DocumentTypeService from './FinanceEmbedded/services/DocumentTypeService'
import RatioPlanService from './FinanceEmbedded/services/RatioPlanService'
import PlanLeafService from './FinanceEmbedded/services/PlanLeafService'

// DIRETIVAS
import titlePay from './FinanceEmbedded/pages/title/titlePay/titlePay'

// CONTROLLERS
import TitlePayListController from './FinanceEmbedded/pages/title/titlePay/TitlePayListController'
import TitlePayFormController from './FinanceEmbedded/pages/title/titlePay/TitlePayFormController'
import TitleReceiveListController from './FinanceEmbedded/pages/title/titleReceive/TitleReceiveListController'


const finance = angular.module('finance.embedded', ['ngSanitize', 'ui.bootstrap', 'group.dependencies'])

finance.service('FinanceEmbeddedService', FinanceEmbeddedService)
finance.service('TitleService', TitleService)
finance.service('IndividualService', IndividualService)
finance.service('DocumentTypeService', DocumentTypeService)
finance.service('RatioPlanService', RatioPlanService)
finance.service('PlanLeafService', PlanLeafService)

finance.controller('TitlePayListController', TitlePayListController)
finance.controller('TitleReceiveListController', TitleReceiveListController)
finance.controller('TitlePayFormController', TitlePayFormController)



finance.directive('financeEmbedded', financeEmbedded)
finance.directive('ngDynamicController', ngDynamicController)
finance.directive('titlePay', titlePay)
finance.directive('bindHtmlCompile', bindHtmlCompile)

finance.config(['GumgaDateServiceProvider', (GumgaDateServiceProvider) => {
    GumgaDateServiceProvider.setDefaultConfiguration({
        minYear: 1500,
        closeOnChange: true
    });
}])

export default finance.name