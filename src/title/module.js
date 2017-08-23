module.exports = angular.module('finance.title.list', [])
    .controller('TitleListController', require('./controllers/titlelistcontroller'))
    .service('TitleEmbeddedService', require('./services/titleembeddedservice'))
    .component('financeTitleList', require('./component/title'));


