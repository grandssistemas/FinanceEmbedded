require('./../providers/module');

module.exports = angular.module('finance.services', ['finance.providers'])
    .service('WalletService', require('./WalletService'))
    .service('RatioPlanService', require('./RatioPlanService'))
    .service('IndividualEmbeddedService', require('./IndividualEmbeddedService'))
    .service('FinanceUnitService', require('./FinanceUnitService'))
    .service('DocumentTypeService', require('./DocumentTypeService'))
    .service('PlanLeafService', require('./PlanLeafService'))
    .service('TitleParcelPayService', require('./TitleParcelPayService'))
    .service('FinanceConfigurationService', require('./FinanceConfigurationService'))
    .service('CheckingAccountService', require('./CheckingAccountService'))
    .service('ThirdPartyChequeService', require('./ThirdPartyChequeService'))
    .service('PaymentService', require('./PaymentService'))
    .service('LocalCashService', require('./LocalCashService'))
    .service('ChequePortfolioService', require('./ChequePortfolioService'))
    .service('IndividualCreditService', require('./IndividualCreditService'))
    .service('CreditCardAccountService', require('./CreditCardAccountService'))
    .service('DocTedService', require('./DocTedService'))
    .service('BankService', require('./BankService'))
    .service('TitleService', require('./TitleService'));


