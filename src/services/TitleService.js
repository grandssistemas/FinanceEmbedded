TitleEmbeddedService.$inject = [
    'GumgaRest',
    '$http',
    'FinanceEmbeddedService'];
function TitleEmbeddedService(
    GumgaRest,
    $http,
    FinanceEmbeddedService) {
        var Service = new GumgaRest(FinanceEmbeddedService.getDefaultConfiguration().api + '/title');
        Service.renegociationParcels = [];

        Service.setRenegociationParcels = function (values) {
            Service.renegociationParcels = values;
        };

        Service.findTitleWithParticipations = function (tipo, page, aqParam) {
            if (page !== 1) page = (page * 10) - 10;
            if (page === 1) page = 0;
            var aq = "obj.titleType='" + tipo + "'";
            if (aqParam) {
                aq = aq + " AND " + aqParam;
            }
            return $http.get(FinanceEmbeddedService.getDefaultConfiguration().api + "/title/joinparticipations?aq=" + aq + "&sortField=emissionDate&sortDir=desc&start=" + page);
        };

        Service.getRenegociationParcels = function () {
            return Service.renegociationParcels;
        };

        Service.getParcelsDTO = function (idParcels) {
            return $http.post(FinanceEmbeddedService.getDefaultConfiguration().api + '/title/parcelsdto', idParcels);
        };

        Service.readBarCode = function (barcode) {
            return $http.get(FinanceEmbeddedService.getDefaultConfiguration().api + '/boleto/' + barcode);
        };

        Service.getInstance = function () {
            return $http.get(FinanceEmbeddedService.getDefaultConfiguration().api + '/title/new');
        };

        Service.saveReplecement = function (entity) {
            return $http.post(FinanceEmbeddedService.getDefaultConfiguration().api + '/title/replacement', entity);
        };

        Service.saveRenegotiation = function (entity) {
            return $http.post(FinanceEmbeddedService.getDefaultConfiguration().api + '/title/renegotiation', entity);
        };

        Service.getPlanTree = function () {
            return $http.get(FinanceEmbeddedService.getDefaultConfiguration().api + '/plan/plantree');
        };

        Service.getLabels = function () {
            return $http.get(FinanceEmbeddedService.getDefaultConfiguration().api + '/titlelabel');
        };
        Service.saveLabel = function (label) {
            return $http.post(FinanceEmbeddedService.getDefaultConfiguration().api + '/titlelabel', label)
        };
        Service.searchLabels = function (param) {
            return $http.get(FinanceEmbeddedService.getDefaultConfiguration().api + '/titlelabel?' + param)
        };
        Service.searchTags = function (label, typeTitle) {
            return $http.get(FinanceEmbeddedService.getDefaultConfiguration().api + '/title/findbylabel/' + label + '/' + typeTitle)
        };

    return Service;
}

module.exports =  TitleEmbeddedService;