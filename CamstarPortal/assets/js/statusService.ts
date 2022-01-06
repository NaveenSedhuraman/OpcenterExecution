class StatusService {
    constructor(private eventBus: any) {
        this.eventBus.subscribe('mom.swac.screen.loadStart', () => {
            eventBus.publish( 'modal.progress.start' );
        });
        this.eventBus.subscribe('mom.swac.screen.loadEnd', () => {
            eventBus.publish( 'modal.progress.end' );
        });
    }
    private showLoader() {
        this.eventBus.publish( 'modal.progress.start' );
    }
    private hideLoader() {
        this.eventBus.publish( 'modal.progress.end' );
    }
}

define(['app', 'js/eventBus'], function (app, eventBus) {
    'use strict';
    app.factory('statusService', [() => new StatusService(eventBus)]);
    return {
        moduleServiceNameToInject: 'statusService'
    };

});