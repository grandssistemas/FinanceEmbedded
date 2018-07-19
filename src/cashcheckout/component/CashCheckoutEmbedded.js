let template = require('../views/cashcheckout.html');

module.exports = {
    templateUrl: template,
    controller: 'CashCheckoutEmbeddedFormController',
    bindings:{
        entity: '=',
        onGoHome: '&'
    }
};