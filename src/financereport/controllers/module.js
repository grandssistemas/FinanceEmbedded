import '../services/module';
import DesignerEmbeddedController from './DesignerEmbeddedController';
import FinanceReportListEmbeddedController from './FinanceReportListEmbeddedController';
import ReportTypeModalEmbeddedController from './ReportTypeModalEmbeddedController';
import ViewerEmbeddedController from './ViewerEmbeddedController';

export default angular.module('finance.stimulsoftembedded.controllers', ['finance.stimulsoftembedded.service'])
	.controller('DesignerEmbeddedController', DesignerEmbeddedController)
	.controller('FinanceReportListEmbeddedController', FinanceReportListEmbeddedController)
	.controller('ReportTypeModalEmbeddedController', ReportTypeModalEmbeddedController)
	.controller('ViewerEmbeddedController', ViewerEmbeddedController);
