let template = require('../views/list.html');

module.exports = {
    templateUrl: template,
    controller: 'TitleListController',
    bindings:{
        titleType: '@',
        onNewTitle: '&',
        onEditTitle: '&',
        onReplacement: '&'
    }
};