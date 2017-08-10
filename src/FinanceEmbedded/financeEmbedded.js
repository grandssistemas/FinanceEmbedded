let template = require('./views/base.html')

const financeEmbedded = ($sce, $window, FinanceEmbeddedService) => {
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
                    console.log('entrou')
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

                getToken();
                getOrganizationHierarchyCode();

                const mountLayout = () => {
                    return !scope.configuration.layout ? ['title', 'payment', 'checking', 'checkout'] : scope.configuration.layout.split(',')
                }
                console.log(mountLayout())


            };

            scope.initConfiguration();
        }
    }
}
financeEmbedded.$inject = ['$sce', '$window', 'FinanceEmbeddedService'];

module.exports = financeEmbedded;