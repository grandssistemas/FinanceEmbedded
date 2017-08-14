export default function PlanLeafService($http, FinanceEmbeddedService, GumgaRest) {
    const service = new GumgaRest(`${FinanceEmbeddedService.baseUrl}/planleaf`);
    
    const getParamsToken = () => {
        return {
            'gumgaToken': FinanceEmbeddedService.token
        }
    }

    service.advancedSearch = (value)=> {
        return $http.get(`${service._url}?aq=${value}`, { headers: getParamsToken() } )
    }

    service.getAutomaticRatio = (plan, total) => {
        return $http.get(`${service._url}/automaticratio/${plan}/${total}`, { headers: getParamsToken() } );
    };
    return service
}

PlanLeafService.$inject = ['$http', 'FinanceEmbeddedService', 'GumgaRest']
