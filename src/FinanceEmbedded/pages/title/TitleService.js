export default function TitleService($http, FinanceEmbeddedService, GumgaRest) {
    const service = new GumgaRest(FinanceEmbeddedService.baseUrl);

    console.log(service)

    const getParamsToken = () => {
        return {
          'gumgaToken' :  FinanceEmbeddedService.token
        }
    }

    service.findTitleWithParticipations = (tipo, page, aqParam) => {
        if (page !== 1) page = (page * 10) - 10;
        if (page === 1) page = 0;
        var aq = `obj.titleType='${tipo}'`;
        if (aqParam) {
            aq = aq + ' AND ' + aqParam;
        }
        return $http.get(`${service._url}/title/joinparticipations?aq=${aq}&start=${page}`, {headers: getParamsToken()});
    };
    return service
}

TitleService.$inject = ['$http', 'FinanceEmbeddedService', 'GumgaRest']
