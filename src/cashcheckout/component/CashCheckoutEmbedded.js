let template = require('../views/form.html');

module.exports = {
    templateUrl: template,
    controller: 'CashCheckoutEmbeddedFormController',
    bindings:{
        entity: '=',
        onGoHome: '&'
    }
};