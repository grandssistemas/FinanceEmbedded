FinanceEmbeddedService.$inject = ['apiLocation'];

function FinanceEmbeddedService(apiLocation) {
    const configuration = {
        api: apiLocation + '/api'
    }

    const getDefaultConfiguration = () => {
        return configuration;
    }

    const setDefaultConfiguration = config => {
        Object.keys(config).forEach(key => configuration[key] = config[key]);
    }

    return {
        getDefaultConfiguration : getDefaultConfiguration,
        setDefaultConfiguration : setDefaultConfiguration,
        $get : function(){
            return {
                getDefaultConfiguration : getDefaultConfiguration,
                setDefaultConfiguration : setDefaultConfiguration
            }
        }
    };
}


module.exports = FinanceEmbeddedService;