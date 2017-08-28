let template = require('../views/list.html');

module.exports = {
    templateUrl: template,
    controller: 'TitleParcelReceiveListEmbeddedController',
    bindings:{
        onSameIndividual: '&',
        onRenegotiation: '&'
    }
};