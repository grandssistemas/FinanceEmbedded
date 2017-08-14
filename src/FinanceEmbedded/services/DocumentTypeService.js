export default function DocumentTypeService($http, FinanceEmbeddedService, GumgaRest) {
    const service = new GumgaRest(`${FinanceEmbeddedService.baseUrl}/documenttype?gumgaToken=${FinanceEmbeddedService.token}`);
    
    const getParamsToken = () => {
        return {
            'gumgaToken': FinanceEmbeddedService.token
        }
    }

    
    service.save = (documenttype) => {
        return $http.post(`${service._url}/documenttype`, documenttype, { headers: getParamsToken() });
    };



    return service
}

DocumentTypeService.$inject = ['$http', 'FinanceEmbeddedService', 'GumgaRest']
