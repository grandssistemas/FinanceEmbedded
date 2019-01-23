TitleEmbeddedService.$inject = [
	'GumgaRest',
	'$http',
	'FinanceEmbeddedService'];
function TitleEmbeddedService(
	GumgaRest,
	$http,
	FinanceEmbeddedService
) {
	const service = new GumgaRest(`${FinanceEmbeddedService.getDefaultConfiguration().api}/title`);
	service.renegociationParcels = [];

	service.searchTitleBySale = (id) => {
		let gQuery = new GQuery(new Criteria('obj.idIntegracao', ComparisonOperator.EQUAL, id));
		return service.searchWithGQuery(gQuery);
	};

	service.setRenegociationParcels = function (values) {
		service.renegociationParcels = values;
	};

	service.getTitleByIdTitleParcel = function () {
		const gQuery = new GQuery();
		return service.searchWithGQuery(gQuery);
	};

	service.searchTypeCategorys = function (param, type) {
		let gQuery = new GQuery();
		if (param) {
			gQuery = gQuery.and(new Criteria('category', ComparisonOperator.CONTAINS, param));
		}
		if (type) {
			gQuery = gQuery.and(new Criteria('type', ComparisonOperator.EQUAL, type.toUpperCase()));
		}
		const obj = {
			gQuery
		};

		return $http.post(`${FinanceEmbeddedService.getDefaultConfiguration().api}/title/typecategorys`, obj);
	};

	service.findTitleWithParticipations = function (tipo, page, aqParam) {
		if (page !== 1) page = (page * 10) - 10;
		if (page === 1) page = 0;
		let aq = `obj.titleType='${tipo}'`;
		if (aqParam) {
			aq = `${aq} AND ${aqParam}`;
		}
		return $http.get(`${FinanceEmbeddedService.getDefaultConfiguration().api}/title/joinparticipations?aq=${aq}&sortField=id&sortDir=desc&start=${page}`);
	};

	service.getRenegociationParcels = function () {
		return service.renegociationParcels;
	};

	service.getParcelsDTO = function (idParcels) {
		return $http.post(`${FinanceEmbeddedService.getDefaultConfiguration().api}/title/parcelsdto`, idParcels);
	};

	service.readBarCode = function (barcode) {
		return $http.get(`${FinanceEmbeddedService.getDefaultConfiguration().api}/boleto/${barcode}`);
	};

	service.getInstance = function () {
		return $http.get(`${FinanceEmbeddedService.getDefaultConfiguration().api}/title/new`);
	};

	service.saveReplecement = function (entity) {
		return $http.post(`${FinanceEmbeddedService.getDefaultConfiguration().api}/title/replacement`, entity);
	};

	service.saveRenegotiation = function (entity) {
		return $http.post(`${FinanceEmbeddedService.getDefaultConfiguration().api}/title/renegotiation`, entity);
	};

	service.getPlanTree = function () {
		return $http.get(`${FinanceEmbeddedService.getDefaultConfiguration().api}/plan/plantree`);
	};

	service.getLabels = function () {
		return $http.get(`${FinanceEmbeddedService.getDefaultConfiguration().api}/titlelabel`);
	};
	service.saveLabel = function (label) {
		return $http.post(`${FinanceEmbeddedService.getDefaultConfiguration().api}/titlelabel`, label);
	};
	service.searchLabels = function (param) {
		return $http.get(`${FinanceEmbeddedService.getDefaultConfiguration().api}/titlelabel?${param}`);
	};
	service.searchTags = function (label, typeTitle) {
		return $http.get(`${FinanceEmbeddedService.getDefaultConfiguration().api}/title/findbylabel/${label}/${typeTitle}`);
	};

	return service;
}

module.exports = TitleEmbeddedService;
