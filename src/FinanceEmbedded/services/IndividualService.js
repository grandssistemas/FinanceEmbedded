export default function IndividualService($http, FinanceEmbeddedService, GumgaRest) {
    const service = new GumgaRest(`${FinanceEmbeddedService.baseUrl}/individual?gumgaToken=${FinanceEmbeddedService.token}`);
        
    return service
}

IndividualService.$inject = ['$http', 'FinanceEmbeddedService', 'GumgaRest']
