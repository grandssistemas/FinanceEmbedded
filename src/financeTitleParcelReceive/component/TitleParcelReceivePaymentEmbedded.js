let template = require('../views/pay.html');

module.exports = {
    templateUrl: template,
    controller: 'PayReceiveEmbeddedController',
    bindings:{
        onMakePayment: '&',
        onPost: '&'
    }
};