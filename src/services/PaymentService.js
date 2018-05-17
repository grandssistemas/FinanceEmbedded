PaymentService.$inject = ['GumgaRest', 'FinanceEmbeddedService'];

function PaymentService(GumgaRest, FinanceEmbeddedService) {
    var Service = new GumgaRest(FinanceEmbeddedService.getDefaultConfiguration().api + '/payment');

    Service.pay = function (payment) {
        return Service.extend('post', '/pay', payment);
    };

    Service.receive = function (payment) {
        return Service.extend('post', '/receive', payment);
    };

    Service.getById = (id) => Service.extend('get', '/' + id);

    return Service;
}

module.exports = PaymentService;