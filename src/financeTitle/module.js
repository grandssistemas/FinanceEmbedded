module.exports = angular.module('finance.title', ['finance.services'])
    .controller('ModalParticipationController', require('./controllers/ModalParticipationController'))
    .controller('ModalLaunchPaidController', require('./controllers/ModalLaunchPaidController'))
    .controller('TitleListEmbeddedController', require('./controllers/TitleListEmbeddedController'))
    .controller('TitleFormEmbeddedController', require('./controllers/TitleFormEmbeddedController'))
    .component('financeTitleList', require('./component/TitleListEmbedded'))
    .component('financeTitleForm', require('./component/TitileFormEmbedded'));


