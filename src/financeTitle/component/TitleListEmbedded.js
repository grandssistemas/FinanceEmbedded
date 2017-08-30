let template = require('../views/list.html');

module.exports = {
    templateUrl: template,
    controller: 'TitleListEmbeddedController',
    bindings:{
        titleType: '@',
        onNewTitle: '&',
        onEditTitle: '&',
        onReplacement: '&'
    }
};