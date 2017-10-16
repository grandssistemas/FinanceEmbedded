let template = require('../views/designer.html');

module.exports = {
    templateUrl: template,
    controller: 'DesignerEmbeddedController',
    bindings:{
        backState: '&',
        entity: '=',
        variable: '='
    }
};