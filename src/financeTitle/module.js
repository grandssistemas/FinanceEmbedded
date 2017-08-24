module.exports = angular.module('finance.title', ['finance.services'])
    .controller('TitleListEmbeddedController', require('./controllers/TitleListEmbeddedController'))
    .component('financeTitleList', require('./component/TitleListEmbedded'));


