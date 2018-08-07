let template = require('../views/list.html');

module.exports = {
    templateUrl: template,
    controller: 'TitleParcelPayListEmbeddedController',
    bindings:{
        onSameIndividual: '&',
        onSameIndividualReceive: '&'
    }
};