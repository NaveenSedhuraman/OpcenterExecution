define( [ 'app', 'js/declUtils' ], function( app, declUtils ) {
    'use strict';

    app.factory( 'cepAuthenticatorService', [ '$q', '$injector', function( $q, $injector ) {
        var exports:any = {};
        exports.getAuthenticator = function() {
            return declUtils.loadDependentModule( 'js/cepAuthenticator', $q, $injector );
        };

        return exports;
    } ] );
    return {
        moduleServiceNameToInject: 'cepAuthenticatorService'
    };
} );