export default function RatioPlanService($http, FinanceEmbeddedService, GumgaRest) {
    const service = new GumgaRest(`${FinanceEmbeddedService.baseUrl}/ratioplan`);
    
    const getParamsToken = () => {
        return {
            'gumgaToken': FinanceEmbeddedService.token
        }
    }

    service.advancedSearch = (value)=> {
        let aq = value || ''
        return $http.get(`${service._url}?pageSize=10&q=${aq}&searchFields=label&start=0`, { headers: getParamsToken() } )
    }

    service.getAutomaticRatio = (plan, total) => {
        return $http.get(`${service._url}/automaticratio/${plan}/${total}`, { headers: getParamsToken() } );
    };
    return service
}

RatioPlanService.$inject = ['$http', 'FinanceEmbeddedService', 'GumgaRest']
