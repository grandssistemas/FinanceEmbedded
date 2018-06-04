import template from '../views/list.html';

const component = {
	template,
	controller: 'TitleParcelPayListEmbeddedController',
	bindings: {
		onSameIndividual: '&'
	}
};

export default component;
