TitleParcelPayService.$inject = ['GumgaRest', '$http', 'FinanceEmbeddedService'];

function TitleParcelPayService(GumgaRest, $http, FinanceEmbeddedService) {
	var Service = new GumgaRest(FinanceEmbeddedService.getDefaultConfiguration().api + '/titleparcel');

	var installmentsPayable = [];

	Service.getInstallmentsPayable = function () {
		return installmentsPayable;
	};

	Service.setInstallmentsPayable = function (arr) {
		installmentsPayable = arr;
	};


	Service.grouped = function (type) {
		return $http.get(Service._url + '/grouped/' + type);
	};

	Service.individualSearch = function (idIndividual, type) {
		return $http.get(Service._url + '/grouped/' + type + '/' + idIndividual)
	};

	let format = function date2str(x, y) {
		var z = {
			M: x.getMonth() + 1,
			d: x.getDate(),
			h: x.getHours(),
			m: x.getMinutes(),
			s: x.getSeconds()
		};
		y = y.replace(/(M+|d+|h+|m+|s+)/g, function (v) {
			return ((v.length > 1 ? "0" : "") + eval('z.' + v.slice(-1))).slice(-2);
		});

		return y.replace(/(y+)/g, function (v) {
			return x.getFullYear().toString().slice(-v.length);
		});
	};

	Service.findOpenByMaxDate = function (date, type, page, individual, paidOut, aqFilterSelected) {
		if (aqFilterSelected !== null) {
			return $http.get(Service._url + "?start=" + page + "&aq="
				+ aqFilterSelected);
		} else {
			if (page !== 1) page = (page * 10) - 10;
			if (page === 1) page = 0;
			var searchDate = date ? " AND obj.expiration <= '" + format(date, 'yyyy-MM-dd') + "'" : "";
			var searchIndividual = individual ? ' AND obj.individual.id = ' + individual.id : '';
			return $http.get(Service._url
				+ "?start=" + page + "&aq=obj.title.titleType='" + type + "' AND (obj.fullPaid = " + paidOut + " OR obj.fullPaid is null)"
				+ searchDate
				+ searchIndividual);
		}
	};

	Service.getByGQueryMaxDate = function (date, type, page, individual, paidOut, gQuery, pageSize, sortField, sortDir) {
		if (gQuery === null) {
			gQuery = new GQuery();

			if (date) {
				gQuery = gQuery.and(new Criteria('expiration', ComparisonOperator.LOWER_EQUAL, format(date, 'yyyy-MM-dd') + "'"));
			}
			if (individual) {
				gQuery = gQuery.and(new Criteria('individual.id', ComparisonOperator.EQUAL, individual.id));
			}

			// .join(new Join('obj.individual as individual', JoinType.INNER));

			gQuery = gQuery.and(new Criteria('title.titleType', ComparisonOperator.EQUAL, type))
				.and(new Criteria('title.isReversed', ComparisonOperator.EQUAL, false))
				.and(new GQuery(new Criteria('obj.fullPaid', ComparisonOperator.EQUAL, paidOut)));

			// .or(new Criteria('obj.fullPaid', ComparisonOperator.IS, new CriteriaField("null")))
			// ABERTO ISSUE NA GUMGA
		} else {
			gQuery = gQuery.and(new Criteria('title.isReversed', ComparisonOperator.EQUAL, false));
		}

		if (!page || page === 1) {
			page = 0;
		} else {
			page = (page * 10) - 10;
		}

		let qo = {
			gQuery: gQuery,
			start: page || 0,
			pageSize: pageSize || 10,

		};

		if (sortField) {
			qo.sortField = sortField,
				qo.sortDir = sortDir
		}

		return Service.sendQueryObject(qo);
	}

	Service.getPaymentsByParcel = function (id) {
		return Service.extend('get', `/getpaymentsbyparcel/${id}`);
	};

	return Service;
}

module.exports = TitleParcelPayService;