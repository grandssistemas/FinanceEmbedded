export default function TitleService($http, FinanceEmbeddedService, GumgaRest) {
    const service = new GumgaRest(FinanceEmbeddedService.baseUrl);
    let selection;
    let idSelection;

    this.setSelection = (selected) => {
        this.selection = selected
    }

    this.setIdSelection = (id) => {
        this.idSelection = id
    }

    this.getSelection = () => {
        return this.selection
    }

    this.getIdSelection = () => {
        return this.idSelection;
    }

    const getParamsToken = () => {
        return {
            'gumgaToken': FinanceEmbeddedService.token
        }
    }

    service.findTitleWithParticipations = (tipo, page, aqParam) => {
        if (page !== 1) page = (page * 10) - 10;
        if (page === 1) page = 0;
        var aq = `obj.titleType='${tipo}'`;
        if (aqParam) {
            aq = aq + ' AND ' + aqParam;
        }
        return $http.get(`${service._url}/title/joinparticipations?aq=${aq}&start=${page}`, { headers: getParamsToken() });
    }

    service.getPlanTree = () => {
        return $http.get(`${service._url}/plan/plantree`, { headers: getParamsToken() });
    };

    service.saveTitle = (title) => {
        console.log(title)
        return $http.post(`${service._url}/title`, title , { headers: getParamsToken() });
    }
    
    service.getLabels = () => {
        return $http.get(`${service._url}/titlelabel`,  { headers: getParamsToken() } );
    };




    return service
}

TitleService.$inject = ['$http', 'FinanceEmbeddedService', 'GumgaRest']
