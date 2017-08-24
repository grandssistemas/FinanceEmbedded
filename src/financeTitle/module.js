module.exports = angular.module('finance.title', ['finance.services'])
    .controller('TitleListEmbeddedController', require('./controllers/TitleListEmbeddedController'))
    .controller('TitleFormEmbeddedController', require('./controllers/TitleFormEmbeddedController'))
    .component('financeTitleList', require('./component/TitleListEmbedded'))
    .component('financeTitleForm', require('./component/TitileFormEmbedded'));


