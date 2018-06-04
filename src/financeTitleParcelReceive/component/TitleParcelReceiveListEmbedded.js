import template from '../views/list.html';

const component = {
	template,
	controller: 'TitleParcelReceiveListEmbeddedController',
	bindings: {
		onSameIndividual: '&',
		onRenegotiation: '&'
	}
};

export default component;
