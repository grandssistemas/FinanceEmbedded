IndividualEmbeddedService.$inject = ['GumgaRest', '$http', 'FinanceEmbeddedService', 'FinanceReportService'];

function IndividualEmbeddedService(GumgaRest, $http, FinanceEmbeddedService, FinanceReportService) {
	let Service = new GumgaRest(`${FinanceEmbeddedService.getDefaultConfiguration().api}/individual`);

	Service.searchIndividual = (param) => {
		let gQuery = new GQuery();
		if (param) {
			gQuery = gQuery.and(new Criteria("obj.name", ComparisonOperator.CONTAINS, param).addIgnoreCase(param).addTranslate())
			gQuery = gQuery.or(new Criteria("obj.primaryDocument", ComparisonOperator.CONTAINS, param).addIgnoreCase(param).addTranslate())
		}
		return Service.searchWithGQuery(gQuery);
	};

	Service.getLabels = function () {
		return $http.get(`${FinanceEmbeddedService.getDefaultConfiguration().api}/individuallabel`);
	};

	Service.searchLabels = function (param) {
		return $http.get(`${FinanceEmbeddedService.getDefaultConfiguration().api}/individuallabel?${param}`);
	};

	Service.getLogged = function () {
		return Service.extend('get', '/getlogged');
	};

	Service.searchEmployees = function (param, page, pageSize) {
		let gQuery = new GQuery()
		gQuery = gQuery.and(new Criteria("obj.individualType", ComparisonOperator.EQUAL, 'EMPLOYEE'))
		if (param) {
			gQuery = gQuery.and(new Criteria("obj.name", ComparisonOperator.CONTAINS, param).addIgnoreCase(param).addTranslate())
			gQuery = gQuery.or(new Criteria("obj.primaryDocument", ComparisonOperator.CONTAINS, param).addIgnoreCase(param).addTranslate())
		}
		return Service.searchWithGQuery(gQuery, pageSize, page);
	};

	Service.getEmployees = function () {
		return Service.extend('get', '/getemployees');
	};

	Service.getCompany = function () {
		return Service.extend('get', '/getcompany');
	};

	Service.variablesReport = () => Service.getCompany().then((data) => {
		return mountVariables(data.data);
	});

	function mountVariables(company) {
		const variables = [];

		variables.add(FinanceReportService.mountVariable('Empresa', 'nome', company.name));
		variables.add(FinanceReportService.mountVariable('Empresa', 'cnpj', company.primaryDocument));
		variables.add(FinanceReportService.mountVariable('Empresa', 'ie', company.secondaryDocument));
		if (company.addressList && company.addressList.length > 0) {
			variables.add(FinanceReportService.mountVariable('Empresa', 'endereco', mountAddress(company.addressList[0].address)));
			variables.add(FinanceReportService.mountVariable('Empresa', 'cidade', mountCity(company.addressList[0].address)));
		}
		if (company.phones && company.phones.length > 0) {
			variables.add(FinanceReportService.mountVariable('Empresa', 'telefone', company.phonesList[0].phone));
		}
		if (company.emails && company.emails.length > 0) {
			variables.add(FinanceReportService.mountVariable('Empresa', 'email', company.emailsList[0].email));
		}
		// if(company.file){
		//     variables.add(FinanceReportService.mountVariable('Empresa', 'logo', StorageService.apiAmazonLocation + company.file.url));
		// }
		return variables;
	}

	function mountAddress(address) {
		return `${address.premisseType} ${address.premisse}, ${address.number} - ${address.neighbourhood}`;
	}

	function mountCity(address) {
		return `${address.localization} - ${address.state}`;
	}


	return Service;
}

module.exports = IndividualEmbeddedService;
