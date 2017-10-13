let template = require('../views/viewer.html');

module.exports = {
    templateUrl: template,
    controller: 'ViewerEmbeddedController',
    bindings:{
        entity: '=',
        variable: '=',
        filters: '=',
        backState: '&'
    }
};