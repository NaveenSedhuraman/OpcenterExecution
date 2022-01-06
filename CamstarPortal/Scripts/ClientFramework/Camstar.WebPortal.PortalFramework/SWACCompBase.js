var Component = function () {
    var interface = {
        interfaces: {
            'MOM.UI.Navigable': {
                navigateTo: function (nav) {                       
                    var __page = $find("__Page");
                    switch (nav.value) {
                        case 'LOAD_LINEASSIGNMENT':    
                            var labels = [{ Name: 'Lbl_SetLineAssignment_Title' }, { Name: 'Lbl_PopupLoadingTitle' }];
                            __page.getLabels(labels, function (response) {
                                if ($.isArray(response)) {
                                    var setLineAssignmentText;
                                    var loadingLbl;
                                    $.each(response, function () {
                                        var labelName = this.Name;
                                        var labelText = this.Value;
                                        switch (labelName) {
                                            case 'Lbl_SetLineAssignment_Title':
                                                setLineAssignmentText = labelText;
                                                break;
                                            case 'Lbl_PopupLoadingTitle':
                                                loadingLbl = labelText;
                                                break;
                                            default:
                                                break;
                                        }
                                    });
                                    pop.showAjax('./LineAssignmentPage.aspx?IsFloatingFrame=2', setLineAssignmentText, 520, 662, 0, 0, true, '', '', this, true, '', null, false, false, loadingLbl);
                                }
                                else {
                                    alert(response.Error);
                                }
                            });
                           
                            break;
                        case 'LOAD_FILTERTAGS':
                                var labels = [{ Name: 'Banner_SetFilterTags' }, { Name: 'Lbl_PopupLoadingTitle' }];
                                __page.getLabels(labels, function (response) {
                                    if ($.isArray(response)) {
                                        var setFilterTagsText;
                                        var loadingLbl;
                                        $.each(response, function () {
                                            var labelName = this.Name;
                                            var labelText = this.Value;
                                            switch (labelName) {
                                                case 'Banner_SetFilterTags':
                                                    setFilterTagsText = labelText;
                                                    break;
                                                case 'Lbl_PopupLoadingTitle':
                                                    loadingLbl = labelText;
                                                    break;
                                                default:
                                                    break;
                                            }
                                        });
                                        pop.showAjax('./ModelingDataFilterSessionValuePopup_VP.aspx?IsFloatingFrame=2', setFilterTagsText, 420, 508, 0, 0, true, '', '', this, true, '', null, false, false, loadingLbl);
                                    }
                                    else {
                                        alert(response.Error);
                                    }
                                });
                            break;
                        case 'LOAD_USERPROFILE':                           
                            var labels = [{ Name: 'Lbl_UserAndSystemInfo' }, { Name: 'Lbl_PopupLoadingTitle' }];
                            __page.getLabels(labels, function (response) {
                                if ($.isArray(response)) {
                                    var userProfileText;
                                    var loadingLbl;
                                    $.each(response, function () {
                                        var labelName = this.Name;
                                        var labelText = this.Value;
                                        switch (labelName) {
                                            case 'Lbl_UserAndSystemInfo':
                                                userProfileText = labelText;
                                                break;
                                            case 'Lbl_PopupLoadingTitle':
                                                loadingLbl = labelText;
                                                break;
                                            default:
                                                break;
                                        }
                                    });
                                    pop.showAjax('./UserProfile_VP.aspx?CallStackKey=&IsFloatingFrame=2', userProfileText, 800, 830, 0, 0, true, '', '', this, true, '', null, false, false, loadingLbl);                                

                                }
                                else {
                                    alert(response.Error);
                                }
                            });
                            break;
                        case 'LOAD_CONFIRMLOGOUT':
                            var executeWhenTrue = "KillSession(true);setTimeout( function() {window.top.location = 'default.htm';}, 2000 );";
                            var labels = [{ Name: 'AlertConfirmLogout' }, { Name: 'Lbl_Warning' }];

                            __page.getLabels(labels, function (response) {
                                if ($.isArray(response)) {
                                    var confMessage;
                                    var warningLbl;
                                    $.each(response, function () {
                                        var labelName = this.Name;
                                        var labelText = this.Value;
                                        switch (labelName) {
                                            case 'AlertConfirmLogout':
                                                confMessage = labelText;
                                                break;
                                            case 'Lbl_Warning':
                                                warningLbl = labelText;
                                                break;
                                            default:
                                                break;
                                        }
                                    });
                                    JConfirmationLong(confMessage, null, executeWhenTrue, null, null, null, warningLbl);
                                }
                                else {
                                    alert(response.Error);
                                }
                            });                            
                            break;
                        case 'LOAD_HELPFRAME':
                            __page.getLabel('Lbl_NoHelpFileMessage', function (label) {
                                var noHelpText = 'Online help is currently being developed and will be deployed in a future release.';
                                if ($.isArray(label)) {
                                    noHelpText = label[0].Value;
                                }
                                __page.openHelpframe(noHelpText);
                            });                            

                            break;
                        case 'REDIRECT_TO':                     
                            var redirectPage = getUrlParamVal("redirectToPage", nav.params);
                            var redirectWebpart = getUrlParamVal("redirectToWebpart", nav.params);
                            var redirectPageflow = getUrlParamVal("redirectToPageflow", nav.params);
                            if (!redirectPage) redirectPage = "Main.aspx";
                            
                            var queryString = 'ResetCallStack=true';
                            if (redirectPageflow) {
                                queryString += '&redirectToPageFlow=' + redirectPageflow;
                            }
                            if (redirectWebpart) {
                                queryString += '&WebPart=' + redirectWebpart;                                
                            }                            
                            __toppage.openInTabId(redirectPage, queryString, null, null, null, true);
                            break;
                        default:
                            var queryString = 'ResetCallStack=true';
                            if (nav.queryString) {
                                queryString += '&' + nav.queryString;
                            }
                            var isPageFlow = nav.value.indexOf('PF.') > -1;
                            if (isPageFlow) {
                                __toppage.openInTabId('Main.aspx', queryString + '&redirectToPageFlow=' + nav.value, nav.uiValue, null, null, true);
                            }
                            else {
                                __toppage.openInTabId(nav.value, queryString, nav.uiValue, null, null, true);
                            }
                            break;
                            
                    }                    
                }
            }
        }
    }
    return interface;
}();

var contextServicePromise;
var errorServicePromise;
var eventbusServicePromise;
var notificationServicePromise;

SWACBoot.start(    
    function (e) {
        contextServicePromise = new SWAC.Defer();
        errorServicePromise = new SWAC.Defer();
        eventbusServicePromise = new SWAC.Defer();
        notificationServicePromise = new SWAC.Defer();

        Component.Hub = new SWAC.Hub(Component);
        Component.Hub.beginExpose().then(
            function (value) {
                Component.Hub.services.beginGet('MOM.UI.Error').then(function (value) {
                    errorServicePromise.fulfill(value);
                }, function (error) {
                    errorServicePromise.reject();
                });
                Component.Hub.services.beginGet('MOM.UI.Notification').then(function (value) {
                    notificationServicePromise.fulfill(value);
                }, function (error) {
                    notificationServicePromise.reject();
                });
                Component.Hub.services.beginGet('MOM.UI.Context').then(function (value) {
                    contextServicePromise.fulfill(value);
                }, function (error) {
                    contextServicePromise.reject();
                    });
                Component.Hub.services.beginGet('MOM.UI.EventBus').then(function (value) {
                    eventbusServicePromise.fulfill(value);                    
                }, function (error) {
                    eventbusServicePromise.reject();
                });
            },
            function (reason) { }
        );
    },
    function (e) { }, '1.0.2', 'no', 3000);

function setApolloHeader(title, key) {
    if (eventbusServicePromise && eventbusServicePromise.promise) {
        let eventBusSvc = eventbusServicePromise.promise.value;
        if (eventBusSvc) {
            eventBusSvc.publish('cep.header.update', {
                name: title,
                key: key
            });
        }
    }
}
function setApolloLineAssignement(workcenter, operation, resource, workstation) {
    if (eventbusServicePromise && eventbusServicePromise.promise) {
        let eventBusSvc = eventbusServicePromise.promise.value;
        if (eventBusSvc) {
            eventBusSvc.publish('cep.line.assignment.update', {
                workcenter: workcenter,
                operation: operation,
                resource: resource,
                workstation: workstation
            });
        }
    }
}

function showApolloError(msg) {
    errorServicePromise.promise.value.show("Error", msg, {});
}

function showApolloInfo(msg) {
    notificationServicePromise.promise.value.show("Status", msg, {});
}

function getUrlParamVal(paramName, params) {
    let param = params.match(paramName + "=([^&?]+)");
    if (param)
        return param[1];
    return null;
}