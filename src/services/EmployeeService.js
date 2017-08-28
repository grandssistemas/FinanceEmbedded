EmployeeService.$inject = ['GumgaRest', 'FinanceEmbeddedService'];

function EmployeeService(GumgaRest, FinanceEmbeddedService){
    let Service = new GumgaRest(FinanceEmbeddedService.getDefaultConfiguration().api + '/employee');

    Service.getLogged = function(){
        return Service.extend('get', '/getlogged');
    };

    return Service;
};

module.exports = EmployeeService;