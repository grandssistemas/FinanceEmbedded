let template = require('../views/pay.html');

module.exports = {
    templateUrl: template,
    controller: 'PayEmbeddedController',
    bindings:{
        onBackClick: '&',
        reverseTitle: '&?'
    }
};