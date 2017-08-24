require('./../providers/module');

module.exports = angular.module('finance.services', ['finance.providers'])
    .service('WalletService', require('./WalletService'))
    .service('RatioPlanService', require('./RatioPlanService'))
    .service('IndividualService', require('./IndividualService'))
    .service('FinanceUnitService', require('./FinanceUnitService'))
    .service('DocumentTypeService', require('./DocumentTypeService'))
    .service('PlanLeafService', require('./PlanLeafService'))
    .service('TitleService', require('./TitleService'));


