import '../controllers/module';

import financeReportDesignerEmbedded from './FinanceReportDesignerEmbedded';
import financeReportListEmbedded from './FinanceReportListEmbedded';
import financeReportViewerEmbedded from './FinanceReportViewerEmbedded';

export default angular.module('finance.stimulsoftembedded.components', ['finance.stimulsoftembedded.controllers'])
	.component('financeReportDesignerEmbedded', financeReportDesignerEmbedded)
	.component('financeReportListEmbedded', financeReportListEmbedded)
	.component('financeReportViewerEmbedded', financeReportViewerEmbedded);
