let template = require('../views/form.html');

module.exports = {
    templateUrl: template,
    controller: 'CashCheckinEmbeddedFormController',
    bindings:{
        employee: '=',
        disableOpening: '=',
        onGoHome: '&'
    }
};