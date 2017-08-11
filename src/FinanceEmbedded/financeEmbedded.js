let template = require('./views/base.html')

import templateTitleReceive from './pages/title/titleReceive/titleReceiveListLayout.html'

const financeEmbedded = ($sce, FinanceEmbeddedService) => {
    return {
        restrict: 'E',
        templateUrl: template,
        scope: {
            configuration: '='
        },
        link: function (scope, el, attr) {
            scope.initConfiguration = () => {
                scope.initSuccess = 'loading';
                let user = JSON.parse(sessionStorage.getItem('user'))
                if (!scope.configuration || typeof scope.configuration != 'object') {
                    throw 'Atenção, o FinanceEmbedded precisa de um objeto de configuração'
                }

                if (!scope.configuration.proxyUrl || typeof scope.configuration.proxyUrl != 'string') {
                    throw 'Atenção, o FinanceEmbedded precisa que no objeto de configuração tenha o atributo proxyUrl informando a rota da sua api'
                }

                FinanceEmbeddedService.baseUrl = scope.configuration.proxyUrl;

                const getToken = () => {
                    if (scope.configuration.eternalToken) {
                        return scope.configuration.eternalToken;
                    }
                    if (!user || !user.token) {
                        throw 'Atenção, não foi encontrado o token na configuração e nem na sessão';
                    }
                    return user.token;
                }
                const getOrganizationHierarchyCode = () => {
                    if (scope.configuration.organizationHierarchyCode) {
                        return scope.configuration.organizationHierarchyCode;
                    }
                    if (!user || !user.organizationHierarchyCode) {
                        throw `Atenção, o FinanceEmbedded precisa do código de hierarquia de uma organização adicione no objeto de configuração ou insira na sua sessão.`;
                    }
                    return user.organizationHierarchyCode
                }

                FinanceEmbeddedService.token = getToken();
                FinanceEmbeddedService.oi = getOrganizationHierarchyCode();

                scope.tabLayout = {
                    titlePay: {
                        title: 'Titulo a Pagar',
                        content: '<title-pay></title-pay>',
                    },
                    titleReceive: {
                        title: 'Titulo a Receber',
                        content: templateTitleReceive,
                        controller: 'TitleReceiveListController'
                    },
                    // parcelPay: {
                    //     title: 'Contas a Pagar',
                    //     content: templateParcelPay,
                    //     controller: 'ParcelPayListController'
                    // },
                    // parcelPay: {
                    //     title: 'Contas a Receber',
                    //     content: templateParcelReceive,
                    //     controller: 'ParcelReceiveListController'
                    // },
                    // checkin: {
                    //     title: 'Abertura de Caixa',
                    //     content: templateCheckin,
                    //     controller: 'CheckinListController'
                    // },
                    // checkout: {
                    //     title: 'Fechamento de Caixa',
                    //     content: templateCheckout,
                    //     controller: 'CheckoutListController'
                    // }
                }

                const mountLayout = () => {
                    return !scope.configuration.layout ? ['titlePay', 'titleReceive', 'parcelPay', 'parcelReceive', 'checkin', 'checkout'] : scope.configuration.layout.split(',')
                }
                scope.layout = mountLayout();
                scope.initSuccess = 'success';
                console.log(scope.layout)
            };

            scope.initConfiguration();
        }
    }
}
financeEmbedded.$inject = ['$sce', 'FinanceEmbeddedService'];

module.exports = financeEmbedded;