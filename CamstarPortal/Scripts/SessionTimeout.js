// Copyright Siemens 2019  

var camstar = camstar || {};

camstar.sessionTimeout = function () {
    //private members     
    var sessionTimeoutCountdownId = 'sessionTimeoutCountdown',
    expiredMessageLabel,
    loginLabel,
    redirectAfter = 60, // number of seconds to wait before redirecting the user
    redirectTo = 'Default.htm', // URL to relocate the user to once they have timed out
    keepAliveUrl = 'SessionHandler.ashx?', // URL to call to keep the session alive
    running = false, // var to check if the countdown is running
    idleTime, // miniutes converted to milliseconds
    timer, // reference to the setInterval timer so it can be stopped
    timeout, // reference to the setTimeout timer so it can be stopped
    warning,
        init = function (type, time, initialSessionTimeoutMessage, expiredMessage, sessionExpirationWarning, keepMeLoggedIn, logMeOut, logIn) {
            if (!($("body").hasClass("Horizon-theme"))) {
                redirectTo = 'Default.htm?mode=classic';
            }
            idleTime = (time * 60000) - 60000; // miniutes converted to milliseconds
            if (type == "warn")
            {
                var w = 460;
                if (__page && __page.isMobilePage())
                    w = 310;
                initTimeoutWarning(initialSessionTimeoutMessage, sessionExpirationWarning, keepMeLoggedIn, logMeOut, logIn, expiredMessage, w);
                window.addEventListener("resize", function () { camstar.sessionTimeout.centerDialog() });
            }
            if (type == "alive")
            {
                keepSessionAlive();
            }       
            return;
    },
        initTimeoutWarning = function (initialSessionTimeoutMessage, sessionExpirationWarning, keepMeLoggedIn, logMeOut, logIn, expiredMessage, w) {
        //add session timeout warning and hidden time to body
        $("body").append('<div id="sessionTimeoutWarning" style="display: none" class=""></div>')
                    .append($('<input/>', { type: 'hidden', id: 'sessionTimeoutStartTime', value: $.now() }));

        warning = $("#sessionTimeoutWarning").html(initialSessionTimeoutMessage);
        expiredMessageLabel = expiredMessage;
        loginLabel = logIn;
        timeout = setTimeout(createTimer, idleTime);
       
        //set up session timeout dialg
        warning.dialog({            
            title: sessionExpirationWarning,
            autoOpen: false,	// set this to false so we can manually open it
            dialogClass: 'ui-dialog-session-timeout-warning dialog ui-draggable',
            closeOnEscape: false,
            draggable: false,
            width: w || 460,
            minHeight: 50,
            modal: true,
            resizable: false,
            beforeClose: function () { // bind to beforeclose so if the user clicks on the "X" or escape to close the dialog, it will work too
                // stop countdown
                running = false;

                // ajax call to keep the server-side session alive
                $.ajax({
                    url: keepAliveUrl + "refresh=1",
                    contentType: "html"
                });

            },
            buttons:
            [
                {                    
                    text: keepMeLoggedIn,
                    click: function () {
                        $(this).dialog('close');
                        reset(idleTime);
                    },
                    'class': 'cs-button'
                },
                {                   
                    text: logMeOut,
                    click: function () {
                        redirectToStart();
                    },
                    'class': 'cs-button-secondary'
                }
            ],
            open: function () {
                // scrollbar fix for IE
                $('body').css('overflow', 'hidden');
            },
            close: function () {
                // reset overflow
                $('body').css('overflow', 'auto');
                reset(idleTime);
            }
        }); // end of dialog
        $(".ui-dialog")
            .css("z-index", 2)
            .removeClass("ui-widget")
            .removeClass("ui-widget-content");
        $(".ui-dialog-content").removeClass("ui-widget-content");        
    },
    keepSessionAlive = function () {
        setInterval(function () {
            $.ajax({
                url: keepAliveUrl + "refresh=1",
                contentType: "html"
            });
        }, idleTime);
    },
    createTimer = function () {
        var time = $('#sessionTimeoutStartTime').val();
        var timediff = ($.now() - time); //-minute
        var timedout = ((idleTime - timediff) < 1);

        if (!timedout) {
            reset(idleTime-timediff);
        }
        else {
            var counter = redirectAfter;
            running = true;

            // intialisze timer
            $('#' + sessionTimeoutCountdownId).html(redirectAfter);

            // open dialog
            warning.dialog('open');

            // create a timer that runs every second
            timer = setInterval(function () {
                counter -= 1;

                // if the counter is 0, redirect the user
                if (counter === 0) {
                    displayLogin();
                } else {
                    $('#' + sessionTimeoutCountdownId).html(counter);
                }

            }, 1000);

        }
    },
    reset = function(time) {
        clearInterval(timer);
        clearTimeout(timeout);

        if (time > 0)
            timeout = setTimeout(createTimer, time);
        else
            KillSession();
    },
    resetSessionTime = function () {
        $('#sessionTimeoutStartTime').val($.now());
    },
    redirectToStart = function () {
        reset();
        window.top.location = redirectTo;
    },
        displayLogin = function () {
            reset();
            $(warning).html(expiredMessageLabel);

            $(warning).dialog("option", "buttons", [{            
                text: loginLabel,
                click: function () {
                    window.top.location = redirectTo;
                },
                'class': 'cs-button'
            }]);
            $(".ui-icon-closethick").hide();
    },
    center = function() {
        if (warning && warning.dialog("isOpen")) {
            warning.dialog("option", "position", warning.dialog("option", "position"));
        }
    },
    dispose = function() {
        clearInterval(timer);
        clearTimeout(timeout);
    };
    //public members
    return {
        init: init,
        reset: reset,
        resetSessionTime: resetSessionTime,
        centerDialog: center
    };
}();

$(function () {
    var timeoutTime = $("#SessionTimeoutTime").val();
    var timeoutType = $("#SessionTimeoutType").val();   
    // Get Labels for page
    var labels = [{ Name: 'Lbl_SessionAboutToExpire' }, { Name: 'Lbl_ExpiredMessage' }, { Name: 'Lbl_SessionExpirationWarning' }, { Name: 'Lbl_KeepMeLoggedIn' }, { Name: 'Lbl_LogMeOut' }, { Name: 'Lbl_Login' }];
    var initialSessionTimeoutMessage, expiredMessage, sessionExpirationWarning, keepMeLoggedIn, logMeOut, logIn;
    if (typeof __page !== 'undefined') {
        __page.getLabels(labels, function (response) {
            if ($.isArray(response)) {
                $.each(response, function () {
                    var labelName = this.Name;
                    var labelText = this.Value;
                    switch (labelName) {
                        case 'Lbl_SessionAboutToExpire':
                            initialSessionTimeoutMessage = labelText;
                            break;
                        case 'Lbl_ExpiredMessage':
                            expiredMessage = labelText;
                            break;
                        case 'Lbl_SessionExpirationWarning':
                            sessionExpirationWarning = labelText;
                            break;
                        case 'Lbl_KeepMeLoggedIn':
                            keepMeLoggedIn = labelText;
                            break;
                        case 'Lbl_LogMeOut':
                            logMeOut = labelText;
                            break;
                        case 'Lbl_Login':
                            logIn = labelText;
                            break;
                        default:
                            break;
                    }
                });
                camstar.sessionTimeout.init(timeoutType, timeoutTime, initialSessionTimeoutMessage, expiredMessage, sessionExpirationWarning, keepMeLoggedIn, logMeOut, logIn);
            }
            else {
                alert(response.Error);
            }
        });
    }
});
