import template from '../views/list.html';

const component = {
	template,
	controller: 'FinanceReportListEmbeddedController',
	bindings: {
		viewReport: '&',
		editReport: '&',
		insertReport: '&'
	}
};

export default component;
