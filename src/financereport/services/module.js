import '../../providers/module';
import FinanceReportService from './FinanceReportService';

export default angular.module('finance.stimulsoftembedded.service', ['finance.providers'])
	.service('FinanceReportService', FinanceReportService);

