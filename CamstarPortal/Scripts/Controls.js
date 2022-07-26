// Copyright Siemens 2020  

// JScript File
// Set the focus on the control with a tab index of 1
function SetFocusOnFirstTabIndex() {
    if (document.forms[0] != null) {
        var tables = document.forms[0].getElementsByTagName("table");
        var tableID = "";
        for (var i = 0; i < tables.length; i++) {
            if (tables[i]) {
                if (tables[i].id.indexOf("WebPartTable") >= 0 && tables[i].id.indexOf("ConciergeControl") == -1 &&
                    tables[i].id.indexOf("ButtonsBar") == -1) {
                    WebPartBase_OnActivate(document.getElementById(tables[i].id));
                    tableID = tables[i].id;
                    break;
                }

            }
        }

        var Elements = document.forms[0].elements;
        for (var j = 0; j < Elements.length; j++) {
            if (Elements[j].name != null &&
                Elements[j].name.indexOf(tableID.split("_")[1]) >= 0 &&
                Elements[j].tagName != "table" &&
                Elements[j].tagName != "div") {

                try {
                    Elements[j].focus();
                }
                catch (e) { }
                break;
            }
        } // for        
    } // if
} // SetFocusOnFirstTabIndex


//Checks if "parent" element is a parent of the "child" element
function IsElementChildOf(child, parent) {
    if (child.parentNode != null) {
        if (child.parentNode == parent) {
            return true;
        } //if
        else {
            return IsElementChildOf(child.parentNode, parent);
        } //else
    } //if
    else {
        return false;
    } //if
} //IsElementChildOf

// Given an element id check to see if it is  valid element on the page 
function IsValidElement(doc, elementId) {
    var elem = $(doc).find("#" + elementId);

    if (elem != null && elem.length > 0 && elem[0] != null) {
        return true;
    }
    else {
        return false;
    } // if else
} // IsValidElement

// Upload control
// Hides button from inputLevel1 file control so that user could see our image
function AdjustFileInputWidth(ctrlId, fileCtrlSuffix, childTblLevel3Id, relativeCellID, buttonType) {
    var divLevel1 = document.getElementById(ctrlId + "_DivLevel1");
    var inputLevel1 = document.getElementById(ctrlId + "_" + fileCtrlSuffix);
    var divLevel2 = document.getElementById(ctrlId + "_DivLevel2");
    var inputLevel3Empty = document.getElementById(ctrlId + "_" + fileCtrlSuffix + "_Level3");

    if (divLevel1 == null || inputLevel1 == null || inputLevel3Empty == null)
        return false;

    var percStart = Math.round((inputLevel1.offsetWidth - inputLevel3Empty.offsetWidth) / inputLevel1.offsetWidth * 100 - 1);
    var percEnd = percStart + 1;
    if (buttonType == "Image") {
        var strFilter = "alpha(style=1, opacity=100, finishOpacity=0, startX=" + percStart.toString() + ", startY=0, finishX=" + percEnd.toString() + ", finishY=0)";
        inputLevel1.style.filter = strFilter;
        divLevel1.style.width = inputLevel1.offsetWidth - inputLevel3Empty.offsetWidth + inputLevel3Empty.offsetHeight + 4;
        divLevel2.style.width = inputLevel1.offsetWidth - inputLevel3Empty.offsetWidth;
        var relativeCell = document.getElementById(relativeCellID);
        if (relativeCell != null)
            relativeCell.style.width = divLevel1.offsetWith + 5;
    }
    else {
        divLevel1.style.width = inputLevel1.offsetWidth;
    }

    divLevel1.style.height = inputLevel3Empty.offsetHeight + 1;

    if (childTblLevel3Id != "") {
        var childTblLevel3 = document.getElementById(childTblLevel3Id);
        if (childTblLevel3 == null)
            return false;
        childTblLevel3.style.width = inputLevel1.offsetWidth + 3;
    }

} // AdjustFileInputWidth

// Copies values from one text control to another only if the values are different
function CopyControlValues(controlFromId, controlToId) {
    if ($get([controlFromId]) != null)
        if ($get([controlToId]) != null)
            if ($get([controlToId]).value != $get([controlFromId]).value)
                $get([controlToId]).value = $get([controlFromId]).value;
} //CopyControlValues

//Displays a confirmation message with a given text
function Confirmation(confirmMessage) {
    if (confirm(confirmMessage)) {
        return true;
    }
    else {
        return false;
    }
} //Confirmation

function JConfirmationLong(confirmationMessage, dialogTitle, trueCallFuncion, trueButtonText, falseCallFunction, falseButtonText, alertType) {
    var defaultTrueCaption;
    var defaultFalseCaption;
    var callbackFunction;

    //change buttons` captions
    if (trueButtonText != null) {
        defaultTrueCaption = $.alerts.okButton;
        $.alerts.okButton = '&nbsp;' + trueButtonText + '&nbsp;';
    }//if trueButtonText
    if (falseButtonText != null) {
        defaultFalseCaption = $.alerts.cancelButton;
        $.alerts.cancelButton = '&nbsp;' + falseButtonText + '&nbsp;';
    }// if falseButtonText

    //create callbackFunction
    if (falseCallFunction != null) {
        callbackFunction = function (r) {
            if (r == true) {
                $.isFunction(trueCallFuncion) ? trueCallFuncion() : eval(trueCallFuncion);
            }
            else {
                $.isFunction(falseCallFunction) ? falseCallFunction() : eval(falseCallFunction);
            }
        }
    }//if
    else {
        callbackFunction = function (r) {
            if (r == true) {
                $.isFunction(trueCallFuncion) ? trueCallFuncion() : eval(trueCallFuncion);
            }
        }
    }//else

    if (dialogTitle === null)
        dialogTitle = alertType;

    jConfirm(confirmationMessage, dialogTitle, callbackFunction, alertType);

    //restore buttons` captions
    if (trueButtonText != null) {
        defaultTrueCaption = $.alerts.okButton;
        $.alerts.okButton = '&nbsp;' + trueButtonText + '&nbsp;';
    }//if trueButtonText

    if (falseButtonText != null) {
        defaultFalseCaption = $.alerts.cancelButton;
        $.alerts.cancelButton = '&nbsp;' + falseButtonText + '&nbsp;';
    }// if falseButtonText
}//JConfirmationLong

function JConfirmationShort(confirmationMessage, trueCallFuncion) {
    var callback = function (r) { if (r == true) eval(trueCallFuncion); };
    jConfirm(confirmationMessage, null, callback);
}//JConfirmationShort

// Set the value for the password control
function SetPasswordValue(controlName, controlValue, clientID) {
    var control = document.getElementById(clientID);
    $("input:first", control).val(controlValue);
} //SetPasswordValue


function SwitchImages(event, trueImageSrc, falseImageSrc, checkControlId, autoPostBack) {
    if (IsValidElement(document, checkControlId)) {
        var checkControl = $get([checkControlId]);

        if (autoPostBack != 'true') {
            if (checkControl.checked) {
                event.srcElement.src = falseImageSrc;
            } //if
            else {
                event.srcElement.src = trueImageSrc;
            } //else
        } //if
        checkControl.click();
    } //if
} //SwitchImages

function ViewDocumentHandler(grid, sender, action) {
    var url = sender.parentNode.previousSibling.innerHTML;

    return OpenDocument(url, 'Cannot find document', 'Empty document URI');
}

// Views document's content.
function OpenDocument(docURL, cantFindLabel, emptyURLLabel) {
    try {
        if (docURL != null && docURL != '') {
            var newwindow = window.open(docURL);
            if (newwindow != null)
                newwindow.focus();
        }
        else {
            if (emptyURLLabel != '')
                alert(emptyURLLabel);
        }
    }
    catch (exception) {
        if (cantFindLabel != '')
            alert(exception.description + " " + cantFindLabel + " " + docURL + "");
    }
    return false;
}

function radioClick(clickedElement, radioButtonId) {
    if (!$(clickedElement).is('[clicked]')) {
        $(clickedElement).attr('clicked', '');
        $('#' + radioButtonId).click();
        $(clickedElement).removeAttr('clicked');
    }
}


function OpenDocumentRef(docName, docRev) {
    var iframe = $("#DownloadIframe");
    if (iframe.length < 1)
        iframe = $("<iframe id=\"DownloadIframe\"/>");
    iframe.attr("src", "DownloadFile.aspx?docMaintName=" + encodeURIComponent(docName) + "&docMaintRev=" + encodeURIComponent(docRev));
    iframe.hide();
    iframe.appendTo(document.body);
}

function OpenDocumentUrl(docURL, auth, cantFindLabel, emptyURLLabel) {
    if (!auth || auth.toLowerCase() === "none")
        OpenDocument(docURL, "", cantFindLabel, emptyURLLabel);
    else // authentication was specified.
    {
        var iframe = $("#DownloadIframe");
        if (iframe.length < 1)
            iframe = $("<iframe id=\"DownloadIframe\"/>");
        iframe.attr("src", "DownloadFile.aspx?docMaintURL=" + encodeURIComponent(docURL) + "&docMaintAuth=" + encodeURIComponent(auth));
        iframe.hide();
        iframe.appendTo(document.body);
    }
}

function DurationTimer() {
    this.MAXTIME = 3153600000;
}

DurationTimer.prototype = {

    initialize: function (durationControlId) {
        this.durationControlId = durationControlId;
        this.timersGridId = 'ctl00_WebPartManager_TimersView_WP_TimersGrid';
        this.timers = null;
        this.interval = null;
        this._timeout = null;
        this.isGridInit = false;
    },

    dispose: function () {
        this.timers = null;
        this.interval = null;
        clearTimeout(this._timeout);
        this._timeout = null;

        var $dc = $('.container-timer > input');
        if ($dc.length) {
            if ($('#ctl00_WebPartManager_ContainerStatus_WP_TimerViewer').css('display') == 'none')
                $dc.hide();
        }
    },

    update: function () {
        var me = this;
        if (this._timeout)
            clearTimeout(this._timeout);
        this._timeout = setTimeout(function () { me.update(); }, me.interval * 1000);

        var timerValue = '';
        var timerColor = '';
        if (this.timers && this.timers.length) {
            this.updateTimers();
            var t = this.timers[0];
            var timerToDisplay = t.max.active ? t.max : t.min;
            if (timerToDisplay) {
                timerValue = this.formatDurationRel(timerToDisplay.endTime);
                timerColor = timerToDisplay.actualColor;
            }
        }
        else {
            timerValue = '';
            timerColor = null;
        }

        var dc = $find(this.durationControlId);
        if (dc) {
            dc.setValue(timerValue);
            $('input', dc.get_element()).css('background-color', timerColor);
        }

        if (!timerValue) {
            this.dispose();
            return;
        }

        var timersGrid = $find(this.timersGridId);
        if (!timersGrid) {
            this.timersGridId = $('[id$="TimersGrid"]').prop('id');
            if (this.timersGridId)
                timersGrid = $find(this.timersGridId);
        }
        if (timersGrid) {
            this.updateTimersGrid(timersGrid, this.timers);
        }
    },

    loadTimersFromContainer: function (tmrs) {

        this.timers = [];
        var tmrsLength = tmrs.length;
        for (var i = 0; i < tmrsLength; i++) {
            this.timers.push(this.getTimerFromContainer(tmrs[i]));
        }

        this.sortTimers(this.timers);
        return this.timers;
    },

    getTimerFromColumns: function (g, $tr) {
        var dtFormat = this.cellDateTimeFormat();
        var parseTime = function (s) {
            var v;
            if (s) {
                v = Date.parseLocale(s, dtFormat);
                if (v == null)
                    console.error("Error dateTime parsing", s);
            }
            return v;
        };

        return {
            name: this.getItem('ProcessTimerName', g, $tr) + ':' + this.getItem('ProcessTimerRevision', g, $tr),
            min: {
                active: this.getItem('MinEndTimeGMT', g, $tr) ? true : false,
                endTime: parseTime(this.getItem('MinEndTimeGMT', g, $tr)),
                endColor: this.getItem('MinTimeColor', g, $tr),
                warning: this.getItem('MinEndWarningTimeGMT', g, $tr) ? true : false,
                warningTime: parseTime(this.getItem('MinEndWarningTimeGMT', g, $tr)),
                warningColor: this.getItem('MinWarningTimeColor', g, $tr),
                actualColor: ''
            },

            max: {
                active: this.getItem('MaxEndTimeGMT', g, $tr) ? true : false,
                endTime: parseTime(this.getItem('MaxEndTimeGMT', g, $tr)),
                endColor: this.getItem('MaxTimeColor', g, $tr),
                warning: this.getItem('MaxEndWarningTimeGMT', g, $tr) ? true : false,
                warningTime: parseTime(this.getItem('MaxEndWarningTimeGMT', g, $tr)),
                warningColor: this.getItem('MaxWarningTimeColor', g, $tr),
                actualColor: ''
            }
        };
    },

    getItem: function (colName, grid, $tr) {
        return $('td[aria-describedby="' + grid._gridID + '_' + colName + '"]', $tr).text().trimEnd();
    },

    getItemTime: function (colName, grid, $tr) {
        var dateTimeFormat = this.cellDateTimeFormat();
        // get time from column
        var s = this.getItem(colName, grid, $tr);
        if (s) {
            var d = Date.parseLocale(s, dateTimeFormat);
            return Math.floor(((d - (new Date(d).getTimezoneOffset() /* offset in minutes */ * 1000 * 60)) - new Date()) / 1000);
        }
        return null;
    },

    getTimerFromContainer: function (tc) {
        var cc = Sys.CultureInfo.CurrentCulture.dateTimeFormat;
        var self = this;
        var parseTime = function (s) {
            if (s && s.Value) {
                return (typeof s.Value == "string") ? Date.parseLocale(s.Value.substring(0, 19), cc.SortableDateTimePattern) : self.convertLocalDateToUTCDate(s.Value) /*Date*/;
            }
            else
                return NaN;
        };
        return {
            name: tc.ProcessTimerName.Value + ':' + tc.ProcessTimerRevision.Value,
            min: {
                active: tc.MinEndTimeGMT ? true : false,
                endTime: parseTime(tc.MinEndTimeGMT),
                endColor: tc.MinTimeColor ? tc.MinTimeColor.Value : null,
                warning: tc.MinEndWarningTimeGMT ? true : false,
                warningTime: parseTime(tc.MinEndWarningTimeGMT),
                warningColor: tc.MinWarningTimeColor ? tc.MinWarningTimeColor.Value : null,
                actualColor: ''
            },

            max: {
                active: tc.MaxEndTimeGMT ? true : false,
                endTime: parseTime(tc.MaxEndTimeGMT),
                endColor: tc.MaxTimeColor ? tc.MaxTimeColor.Value : '',
                warning: tc.MaxEndWarningTimeGMT ? true : false,
                warningTime: parseTime(tc.MaxEndWarningTimeGMT),
                warningColor: tc.MaxWarningTimeColor ? tc.MaxWarningTimeColor.Value : null,
                actualColor: ''
            }
        };
    },

    getSoonerTimer: function (timers) {
        var timerToDisplay = null;
        var rest = this.MAXTIME; // 100 years

        // Assuming the timers are sorted correctly
        if (timers && timers.length) {
            var tx = timers[0];
            Array.forEach([tx.min, tx.max], function (tm) {
                if (tm.active) {
                    if (tm.endTime < rest) {
                        rest = tm.endTime;
                        timerToDisplay = tm;
                    }
                }
            });
        }
        return timerToDisplay;
    },

    setTimerColors: function (t) {
        var now = new Date(this.getNowGMT());
        // Get actual color
        Array.forEach([t.min, t.max], function (tm) {
            if (tm.active) {
                if (tm.warning) {
                    if (now >= tm.warningTime)
                        tm.actualColor = tm.warningColor;   // warning time overdue
                }
                if (now >= tm.endTime)
                    tm.actualColor = tm.endColor;           // end time overdue
            }
        });
    },

    formatDurationRel: function (t /* milliseconds */) {
        if (!isNaN(t)) {
            var n = new Date(this.getNowGMT());
            var tillTimeSeconds = (t - n) / 1000;
            return this.formatDuration(tillTimeSeconds);
        }
        else
            return '';
    },

    formatDuration: function (seconds) {
        if (seconds == null)
            return '';

        var plus = ' ';
        if (seconds < 0) {
            plus = '+';
            seconds = -seconds;
        }
        var days = Math.floor(seconds / 86400);
        var hours = Math.floor(seconds / 3600) % 24;

        return plus + this.zeroPad(days, 2) + '.' +
            this.zeroPad(hours, 2) + ':' +
            this.zeroPad(Math.floor((seconds % 3600) / 60), 2) + ':' +
            this.zeroPad(Math.floor(seconds % 60), 2);
    },

    zeroPad: function (num, places) {
        var zero = places - num.toString().length + 1;
        return Array(+(zero > 0 && zero)).join("0") + num;
    },

    getNowGMT: function () {
        var n = Date.now();
        return n + new Date().getTimezoneOffset() * 60000;
    },

    updateTimers: function (tmrs) {
        if (!tmrs)
            tmrs = this.timers;

        var now = new Date(this.getNowGMT());
        Array.forEach(tmrs, function (tx) {
            Array.forEach([tx.min, tx.max], function (tm) {
                if (tm.active) {
                    if (tm.warning) {
                        if (now >= tm.warningTime)
                            tm.actualColor = tm.warningColor;
                    }
                    if (now >= tm.endTime)
                        tm.actualColor = tm.endColor;
                }
            });
        });
    },

    sortTimers: function (tmrs) {
        var endless = new Date(9999, 12);
        var getEndTime = function (tm) {
            return tm.active ? tm.endTime : endless;
        };
        // The timers are sorted by Time to Max first (with the longest timer over max at the top), 
        tmrs.sort(function (tm1, tm2) {

            if (getEndTime(tm1.max) < getEndTime(tm2.max))
                return -1;
            else if (getEndTime(tm1.max) == getEndTime(tm2.max)) {
                if (getEndTime(tm1.min) < getEndTime(tm2.min))
                    return -1;
                else if (getEndTime(tm1.min) > getEndTime(tm2.min))
                    return 1;
                else
                    return 0;
            }
            else
                return 1;
        });
    },

    updateTimersGrid: function (grid, timers) {
        if (!grid)
            grid = $find(this.timersGridId);

        if (!timers)
            timers = this.timers;

        timers = timers || [];

        if (!grid)
            return;

        var theGrid = jQuery(grid.GridID);
        if (!theGrid.length)
            return;

        if (!this.isGridInit)
            var refreshBtn = $('#refresh_' + grid.GridID.substring(1) + " .ui-icon-refresh")
        if (refreshBtn) {
            var me = this;

            refreshBtn.off('click').on('click', function () {
                me.refreshTimers();
            });
            this.isGridInit = true;
        }

        for (var i = 0; i < timers.length; i++) {
            var t = timers[i];
            var rowid = this.zeroPad(i, 6);
            theGrid.setCell(rowid, 'MinTime', this.formatDurationRel(t.min.endTime), t.min.actualColor ? { 'backgroundColor': t.min.actualColor } : null);
            theGrid.setCell(rowid, 'MaxTime', this.formatDurationRel(t.max.endTime), t.max.actualColor ? { 'backgroundColor': t.max.actualColor } : null);
            theGrid.setCell(rowid, 'Name', t.name);
        }

        // Add total items into the footer
        var $ftr = $('#ctl00_WebPartManager_ContainerStatus_WP_TimerViewer .ui-flyout .ui-flyout-container .ui-flyout-footer');
        if ($ftr.length) {
            if (!$('.total-items', $ftr).length) {
                // Add total items 
                var inp = $('input', $ftr).detach();
                $ftr.prepend('<div class="total-items"><span class="value"></span></div><div class="close-button"></div>');
                inp.appendTo($('.close-button', $ftr));
                var $lblItems = $('#ctl00_WebPartManager_TimersView_WP_ItemsLabel');
                $('span.value', $ftr).text($lblItems.text());
            }

            var $totalSpan = $('span.value', $ftr);
            var txt = $totalSpan.text();
            // Replace first word with total number
            txt = timers.length.toString() + txt.substring(txt.indexOf(' '));
            $totalSpan.text(txt);
        }
    },

    refreshTimers: function () {
        var grid = $find(this.timersGridId);
        grid.DataLoaded = function () {
            var theGrid = jQuery(grid.GridID);
            var gridRecords = theGrid.getRowData();
            if (timersWatcher.timers && gridRecords.length != timersWatcher.timers.length) {
                // Remove stopped timers
                var timersNew = [];
                for (var i = 0; i < gridRecords.length; i++) {
                    var n = gridRecords[i].Name;
                    var t = null;
                    timersWatcher.timers.forEach(function (tx) {
                        if (tx.name === n) { t = tx; return false; }
                    });
                    if (t)
                        timersNew.push(t);
                }
                timersWatcher.sortTimers(timersNew);
                timersWatcher.timers = timersNew;
            }

            if (timersWatcher) {
                setTimeout(function () { timersWatcher.updateTimersGrid(); }, 100);
            }
        }
        grid.Reload(true);
        return;
    },

    forceTimersUpdate: function (durationClass) {
        var $durationCtl = $('.' + durationClass);
        if ($durationCtl.length) {
            // Fix ui-flyout-header - add refresh icon
            var $ui = $('#ctl00_WebPartManager_ContainerStatus_WP_TimerViewer .ui-flyout');
            if ($ui.length && $ui.css('display') != 'none') {
                var $hdr = $('.ui-flyout-container .ui-flyout-header', $ui);
                if (!$('.refresh-button', $hdr).length) {
                    var $sp = $('span', $hdr);
                    $sp.after('<div class="delimiter"></div><span class="refresh-button" onclick="timersWatcher.refreshTimers()"> </span>');
                }
            }

            // This is for correction of left offset in case of EProcedure
            var $prodEvBtn = $('#ctl00_WebPartManager_ContainerStatus_WP_CreateProdEventButton:visible', $ui.closest('table'));
            if ($prodEvBtn.length)
                $ui.addClass('leftshift');
            else
                $ui.removeClass('leftshift');

            if (timersWatcher) {
                setTimeout(function () { timersWatcher.updateTimersGrid(); }, 10);
            }
        }
    },

    convertLocalDateToUTCDate: function (dt) {
        var localTime = dt.getTime();
        var localOffset = dt.getTimezoneOffset() * 60000;
        return new Date(localTime + localOffset);
    },

    cellDateTimeFormat: function () {
        var cult = getCEP_top().__page.get_pageCulture();
        return cult.ShortDatePattern + ' ' + cult.LongTimePattern;
    }
}

timersWatcher = new DurationTimer();

function CommandBarBase_Deco() {
    return this;
}

CommandBarBase_Deco.prototype = {
    initialize: function (commandBarObj) {
    },

    get_instance: function () {
        return this;
    },

    /* public virtual */
    GetCommandBarItems: function () {
        return [];
    },

    GetCommandBarGlobals: function () {
        return this._commandBarGlobals;
    },

    _commandBarGlobals: {
        transactionThreshold: 7,
        showMobileMenu: false,
        //onUpdated: function (commandBarElement) { return; },
        //onCommandsLoaded: function (cmdItemElements) { return true; },
        onTransactionsLoaded: function (transactionArray) {
            return this.transactionsLoad(transactionArray);
        },
        getLabels: function (cmdObj) {
            return cmdObj.labels;
        },
        //onCmdClick: function (clickedElement, menuItem) { return true; },
        //onRedirectClick: function (clickedElement, menuItem) { return true; },
    },

    labels: {
        submitLbl: { Name: "SubmitButton", Value: null }
    },

    /* public virtual */
    CollectLabels: function (labels) {
        var addedCount = 0;
        this.GetCommandBarItems().forEach(function (m) {
            if (!m.Name.Text && labels.filter(function (l) { return l.Name == m.Name.Label; }).length == 0) {
                labels.push({ Name: m.Name.Label });
                addedCount++;
            }
        });

        // Add extra labels
        var gbl = this.GetCommandBarGlobals();
        if (typeof gbl.getLabels == "function") {
            var lbls = gbl.getLabels(this);
            if (lbls) {
                Object.keys(lbls).forEach(function (k) {
                    if (!lbls[k].Value) {
                        labels.push(lbls[k]);
                        addedCount++;
                    }
                });
            }
        }
        return addedCount;
    },

    /* public virtual */
    PopulateLabels: function (labels) {
        var getDefaultLabel = labels.Error || false;
        this.GetCommandBarItems().forEach(function (m) {
            if (!getDefaultLabel) {
                var lbl = labels.filter(function (l) { return l.Name == m.Name.Label; });
                if (lbl.length)
                    m.Name.Text = lbl[0].Value;
            }
        });

        // Save extra labels
        var gbl = this.GetCommandBarGlobals();
        if (typeof gbl.getLabels == "function") {
            var lbls = gbl.getLabels(this);
            if (lbls) {
                Object.keys(lbls).forEach(function (k) {
                    var lblName = lbls[k].Name;
                    if (!getDefaultLabel) {
                        var lbl = labels.filter(function (l) { return l.Name == lblName; });
                        if (lbl.length)
                            lbls[k].Value = lbl[0].Value;
                    }
                    else {
                        if (lbls[k].DefaultValue)
                            lbls[k].Value = lbls[k].DefaultValue;
                    }
                });
            }
        }
    },

    transactionsLoad: function (trButtons) {
        var submitText = this.labels.submitLbl.Value;
        var btnFiltered = trButtons.filter(".action-redirect-button:not(.origin-invisible)");

        btnFiltered.each(function () {
            var $btn = $(this);
            if (!$btn.hasClass("cmdbar-custom-button")) {
                var menu = $btn.data("menuitem");
                if (menu) {
                    if ($btn.hasClass("cmd-submit") || $btn.hasClass("cmd-primary")) {
                        $(".caption-text", $btn).text(submitText);
                        $btn.addClass("cmd-submit");
                    }
                    else {
                        if ($btn.hasClass("cmd-reset") || menu.CustomMethod === "ShopfloorReset" || (btnFiltered.length == 2 && !menu.IsPrimary)) {
                            $btn.addClass("cmd-reset");
                            if ($btn.attr("order") >= 100)
                                $btn.attr("order", 30);
                        }
                    }
                }
            }
        });
    }
}

function ContainerStatusWebPart_Deco() {
    CommandBarBase_Deco.call(this);
}

ContainerStatusWebPart_Deco.prototype = $.extend(Object.create(CommandBarBase_Deco.prototype), {

    initialize: function (commandBarObj) {
        CommandBarBase_Deco.prototype.initialize.apply(this, commandBarObj);
    },

    /* public virtual */
    GetCommandBarItems: function () {
        var me = this;
        this._commandBarItems.forEach(function (c) {
            if (c.Action && c.Action.Visible === undefined) {
                c.Action.Visible = me._isContainerDefined;
            }
        });
        return this._commandBarItems;
    },

    GetCommandBarGlobals: function () {
        var me = this;
        return $.extend(CommandBarBase_Deco.prototype.GetCommandBarGlobals.call(this),
            {
                transactionThreshold: function () { return 2; },
                onTransactionsLoaded: function (transactionArray) {
                    return this.transactionsLoaded(transactionArray);
                },
                getLabels: function (cmdObj) {
                    var baseLabels = CommandBarBase_Deco.prototype.get_instance().labels || {};
                    $.extend(cmdObj._labels, baseLabels);
                    return cmdObj._labels;
                },

                showMobileMenu: true
            });
    },

    _commandBarItems: [
        {
            Action: {
                PanelBuilder: function () { return this._getContainerInfo('all'); },
                Visible: function () { return this._isContainerDefined(); }
            },
            Icon: { CSS: "container-status" },
            Name: { Label: "Constants_ContainerStatus" }
        },
        {
            Action: {
                PanelBuilder: function () { return this._getContainerInfo('documents'); },
                Visible: function () { return this._isContainerDefined(); }
            },
            Icon: { CSS: "container-documents" },
            Name: { Label: "DocumentSet_DocumentEntries" },
        },
        {
            Action: {
                PanelBuilder: function () { return this._attachDocument(); },
                Visible: function () { return this._isContainerDefined(); }
            },
            Icon: { CSS: "container-attachments" },
            Name: { Label: "Lbl_AttachDocument" },
            CSS: { Bar: [], Panel: [] }
        },
        {
            Action: {
                Page: "MfgAuditTrailVP_R2",
                PanelBuilder: function () { return this._mfgAudit(); },
                GetDataContracts: function () { return this._getContainerNameObj(); },
                OpenMode: function() {
                    if ($(document.body).hasClass("mobile-device"))
                        return $(document.body).is(".mobile-device:not(.wide)") ? "slideout" : "popup";
                    return "newtab";
                },
                Visible: function () { return this._isContainerDefined(); }
            },
            Icon: { CSS: "container-audit-trail" },
            Name: { Label: "LblMenuMfgAuditTrail" }
        },
        {
            Action: { PanelBuilder: function () { return this._viewTimers(); }, Visible: false },
            Name: { Label: "ContainerStatus_ActiveTimers" },
            CSS: { Bar: ["active-timers"], Panel: ["extended-width"] },
        },
        {
            Action: {
                PanelBuilder: function () { return this._getContainerInfo('workflow'); },
                OpenMode: function () { return $(document.body).is(".mobile-device:not(.wide)") ? "slideout" : "popup"; },
                Visible: function () { return this._isContainerDefined(); }
            },
            Icon: { CSS: "container-workflow" },
            Name: { Label: "Container_Workflow" },
            CSS: { Bar: [], Panel: ["workflow"] }
        }
    ],

    _labels: {
        attributeColumnLbl: { Name: "AttributeTitle", Value: null },
        valueColumnLbl: { Name: "SelVal_Value", Value: null }
    },

    /* public virtual */
    setCallbackData: function (objData) {
        switch (objData.__fun) {
            case "getContainerInfo":
                return this._renderContainerStatusInfo(objData);
            case "openDocument":
                return this._openDocument(objData);
            case "attachDocument":
                return this._attachDocument(objData);
            case "viewTimers":
                return this._viewTimers(objData);
            default:
                break;
        }
    },

    getContainer: function () {
        return this._getContainer();
    },

    _isContainerDefined: function () {
        return !!this._getContainer();
    },

    transactionsLoaded: function (trButtons) {
        // Call base method
        CommandBarBase_Deco.prototype.transactionsLoad.apply(CommandBarBase_Deco.prototype.get_instance(), [trButtons]);

        var containerValue = this.getContainer();
        var isHidden = !containerValue;

        if (!containerValue && $(document.body).hasClass("common-search-r2") && trButtons.length > 0)
            isHidden = false;

        trButtons.each(function () {
            var $btn = $(this);
            if (isHidden)
                $btn.toggleClass("hidden", !$btn.hasClass("transaction-button"));
        });
        return containerValue;
    },

    _getContainerInfo: function (filter) {
        // ContainerList control
        var containerName = this._getContainer();

        if (containerName) {
            CallServer(JSON.stringify(
                {
                    serverType: "Camstar.WebPortal.Helpers.ContainerStatusInquiry",
                    clientType: "ContainerStatusWebPart_Deco",
                    fun: "getContainerInfo",
                    containerName: containerName,
                    filter: filter
                }), null);
        }
        else
            return this._containerIsNotSelected();

        return this._processing();
    },

    _containerIsNotSelected: function () {
        return [$("<div class=error> Container is not selected </div>")];
    },

    _processing: function () {
        return [$("<div>processing...</div>")];
    },

    _getContainer: function () {
        var containerControl = $get("ctl00_WebPartManager_ContainerStatusWP_ContainerStatus_ContainerName_Edit") ||
            $get("ctl00_WebPartManager_ContainerStatus_WP_ContainerStatus_ContainerName_Edit") ||
            $get("ctl00_WebPartManager_ContainerStatusWP_R2_ContainerStatus_ContainerName_Edit") ||
            $get("ctl00_WebPartManager_QuickLinksWP_ContainerStatus_ContainerName_Edit");

        if (containerControl) {
            return containerControl.value;
        }
        return null;
    },

    _renderContainerStatusInfo: function (data) {
        var div_list = [];
        if (data.Error) {
            div_list.push($("<div class=error>" + data.Error + "</div>"));
        }

        else if (data["DocumentSets"]) {
            var dss = data["DocumentSets"];
            var getIcon = this._getDocIconPath;

            Array.forEach(dss, function (d) {
                // Document Set name
                var $hdr = $("<div class='header-content-row cs-docset'></div>");
                $hdr.text(d.Name);
                div_list.push($hdr);

                // Doc entries
                Array.forEach(d.DocumentEntries, function (de) {
                    var $entry = $(
                        "<div class='content-row doc-entry'>" +
                        "<img class=icon></img>" +
                        "<div class=info><div class=name></div><div class=desc></div></div>" +
                        "</div>");
                    $entry.attr("browse-mode", de.BrowseMode);
                    $entry.prop("title", de.Description);
                    $('.icon', $entry).prop("src", getIcon(de.FileType));
                    $('.name', $entry).text(de.Name);
                    $('.desc', $entry).text(de.Description);
                    $entry.click(function () {

                        CallServer(JSON.stringify({
                            fun: 'openDocument',
                            serverType: "Camstar.WebPortal.Helpers.ContainerStatusInquiry",
                            clientType: "ContainerStatusWebPart_Deco",
                            documentName: de.Document.Name,
                            documentRev: de.Document.Revision
                        }), null);
                    });
                    div_list.push($entry);
                });
            });
        }
        else if (data["WorkflowRef"]) {
            var wf = data["WorkflowRef"];
            var title = wf.Name + ":" + wf.Revision;
            var step = data["StepName"];
            var dc = JSON.stringify({ "WorkflowCtl": title });
            var url = $(document.body).is(".mobile-device:not(.wide)") ?
                "WorkflowViewPopup_VP.aspx?IsFloatingFrame=2&responsive=true&StepName=" + step + "&DataContracts=" + dc :
                location.href.substr(0, location.href.lastIndexOf("/")) +
                "/WorkflowViewPopup_VP.aspx?IsFloatingFrame=2&IsChild=true&StepName=" + step + "&DataContracts=" + dc;

            if (!(div_list = this._buildPanelContent(url, div_list, name = "WorkflowSlideOut", slideOutAttr = "workflow", 600, 800 )))
                div_list = [];
        }
        else {
            var $root = $("<div class=content-tbl></div>");
            var nodes = [];
            Object.keys(data).forEach(function (k) {
                if (!k.startsWith("__") && k.toLowerCase() !== 'attributes') {
                    var d = data[k];
                    if (d)
                        d = d.Value || "";
                    else
                        d = "";

                    var $r = $("<div class='content-row'><span class='name'></span><span class='val'></span></div>");
                    $(".name", $r).text(k);
                    $(".val", $r).text(d);
                    nodes.push($r);
                }
            });
            $root.html(nodes);
            div_list.push($root);

            if (data["Attributes"]) {
                var attrs = data["Attributes"];
                var $attHdr = $("<div class='header-content-row'><span class='header-name'></span><span class='header-value'></span></div>");
                $(".header-name", $attHdr).text(this._labels.attributeColumnLbl.Value);
                $(".header-value", $attHdr).text(this._labels.valueColumnLbl.Value);

                div_list.push($attHdr);
                var $column = $("<div class=content-tbl></div>");
                var rows = [];
                attrs.forEach(function (ap) {
                    var d = $("<div class='attribute-row content-row'><span class=attribute-name></span><span class=attribute-val></span></div>");
                    $(".attribute-name", d).text(ap.Name);
                    $('.attribute-val', d).text(ap.AttributeValue);
                    rows.push(d);
                });
                $column.html(rows);
                div_list.push($column);
            }
        }
        return div_list;
    },

    _attachDocument: function () {
        var div_list = [];
        var $di = $("<div class=iframe-container></div>");
        $di.append("<iframe></iframe>");
        var dc = encodeURIComponent(JSON.stringify({ "SelectedContainerNameDM": this.getContainer() }));
        var url = "AttachDocument_VP.aspx?IsFloatingFrame=2&responsive=true&DataContracts=" + dc;

        $('iframe', $di)
            .prop("src", url)
            .prop("name", "AttachDocumentSlideOut")
            .attr("slideout", "attachDocument")
            .on("load", function () {
                // "this" is an iframe
                $('body', this.contentDocument)
                    .addClass("commandbar-panel")
                    .addClass("cs-responsive");
            });

        $('iframe', $di).css('width', "100%").css("height", "100%");
        div_list.push($di);
        return div_list;
    },

    _viewTimers: function () {
        var div_list = [];
        var dc = encodeURIComponent(JSON.stringify({ "SelectedContainerNameDM": this.getContainer() }));
        var url = "TimersListPopup_VP.aspx?IsFloatingFrame=2&IsChild=true&responsive=true&slideout=timers&DataContracts=" + dc;
        var $di = $("<div class=iframe-container></div>");
        $di.append("<iframe></iframe>");
        $('iframe', $di)
            .prop("src", url)
            .prop("name", "TimersSlideOut")
            .attr("slideout", "timers")
            .css('width', "100%").css("height", "100%");
        div_list.push($di);
        return div_list;
    },

    _getDocIconPath: function (fileType) {
        var theme = "Camstar";
        var extension = ".png";
        if ($("body").hasClass("Horizon-theme")) {
            theme = "Horizon";
            extension = ".svg";
        }

        var path = "Themes/" + theme + "/images/icons/";
        var icon;
        switch (fileType.toLowerCase()) {
            case ".bmp":
                icon = "typeBMP48"; break;
            case ".rtf":
                icon = "typeRTF48"; break;
            case ".pdf":
                icon = "icon-pdf-32x32"; break;
            case ".docx":
            case ".doc":
                icon = "icon-word-32x32"; break;
            case ".xml":
                icon = "typeXml48"; break;
            case ".exe":
                icon = "typeExe48"; break;
            case ".exel":
                icon = "typeMsExcel48"; break;
            case ".gif":
                icon = "typeGif48"; break;
            case ".jpg":
            case ".jpeg":
                icon = "icon-jpg-32x32"; break;
            case ".txt":
                icon = "typeTxt48"; break;
            case ".zip":
                icon = "typeZipFile48"; break;
            case ".png":
                icon = "typePng48"; break;
            case ".pptx":
            case ".pptm":
            case ".ppt":
                icon = "typeMsPowerpoint48"; break;
            case ".html":
            case ".htm":
                icon = "HTML_32_32"; break;

            case ".jt":
                switch (theme.toLowerCase()) {
                    case "camstar":
                        icon = "3D_32_32"; break;
                    case "horizon":
                        icon = "Type3D48"; break;
                }
                break;
            case "url":
                icon = "HTML_32_32"; break;
            default:
                icon = "icon-unknown-32x32"; break;
        }
        path += icon + extension;

        return path;
    },

    _mfgAudit: function () {
        var div_list = [];
        var dc = JSON.stringify({ "AddContainerDM": this.getContainer() });
        var dcEncoded;

        if (dc) {
            dcEncoded = "DataContracts=" + encodeURI(dc);
        }

        var url = "MfgAuditTrailVP.aspx?IsFloatingFrame=2&IsChild=true&responsive=true&" + dcEncoded + "&CallStackKey=" + __page.generateQuickGuid();

        return this._buildPanelContent(url, div_list, "MfgAuditTrailSlideOut", "mfgaudit", null, null);
    },

    _buildPanelContent: function (url, div_list, name, slideOutAttr, height, width) {

        if ($(document.body).is(".mobile-device:not(.wide)")) {
            // slideout
            var $di = $("<div class=iframe-container></div>");
            $di.append("<iframe></iframe>");

            $('iframe', $di)
                .prop("src", url)
                .prop("name", name)
                .attr("slideout", slideOutAttr)
                .on("load", function () {
                    // "this" is an iframe
                    $('body', this.contentDocument)
                        .addClass("commandbar-panel")
                        .addClass("cs-responsive");
                });

            $('iframe', $di).css('width', "100%").css("height", "100%");
            div_list.push($di);
        }
        else {
            // Popup

            pop.showAjax(url, null,
                this.isResponsive = height || screen.availHeight/*height*/,
                this.isResponsive = width || screen.availWidth /*width*/,
                this.isResponsive ? 0 : 100/*top*/,
                this.isResponsive ? 0 : 100/*left*/, true /*showButtons*/,
                "" /*okButtonText*/, ""/*closeButtonText*/,
                this /*element*/, true /*closeOnCancel*/,
                ''/*optionArgs*/, null /*cancelConfirmMsg*/, false, false /*display reset*/);
        }

        return div_list;
    },

    _getContainerNameObj: function () {
        var containerName = this.getContainer();
        if (containerName)
            return "{\"AddContainerDM\":\"" + containerName + "\"}";

        return "";
    }
    
});


function EProcedureCommandBar() {
    ContainerStatusWebPart_Deco(this);
}

EProcedureCommandBar.prototype = $.extend(Object.create(ContainerStatusWebPart_Deco.prototype), {

    initialize: function (commandBarObj) {
        ContainerStatusWebPart_Deco.prototype.initialize.apply(this, commandBarObj);
        if (this._commandBarItems.length < 8) {
            var baseCmdItems = this._commandBarItems;
            // Solid copy
            this._commandBarItems = $.merge([], this._eproc_commandBarItems);

            // Eproc buttons should be first
            $.merge(this._commandBarItems, baseCmdItems);
        }
    },

    GetCommandBarGlobals: function () {
        var me = this;
        return $.extend(ContainerStatusWebPart_Deco.prototype.GetCommandBarGlobals.call(this),
            {
                onTransactionsLoaded: function (transactionArray) {
                    return this._onTransactions(transactionArray);
                }
            });
    },

    _onTransactions: function (trButtons) {

        var containerValue = ContainerStatusWebPart_Deco.prototype.transactionsLoaded.call(this, trButtons);

        $(document.body)
            .addClass("page-eproc-m")
            .toggleClass("empty-container", !containerValue)
            .toggleClass("eproc-panel-page", $(".body-eproc-txn").length != 0);     // if the transaction page is displayed
    },

    _eproc_commandBarItems: [
        {
            Action: {
                PanelBuilder: function () {
                    return this._openTasklistSummary();
                },
                Visible: function () {
                    return this._isEprocDefined();
                }
            },
            Icon: { CSS: 'eproc-tasklist-summary' }, // TODO: Update when we get icon from product management
            Name: { Label: 'TaskListSummary_Title' }
        },
        {
            Action: {
                Page: "ProductionEventRecord_VPR2",
                GetDataContracts: function () { return this._getContainerNameObj(); },
                PanelBuilder: function () { return this._recordProdEvent(); },
                OpenMode: function () {
                    if ($(document.body).hasClass("mobile-device"))
                        return $(document.body).is(".mobile-device:not(.wide)") ? "slideout" : "popup";
                    return "newtab";
                },
                Visible: function () {
                    return this._isEprocDefined();
                }
            },
            Icon: { CSS: 'record-prod-event' },
            Name: { Label: 'Lbl_RecordProductionEvent' }
        }
    ],

    _openTasklistSummary: function () {

        var taskObj = this._getTxnTask();

        CallServer(JSON.stringify(
            {
                serverType: "Camstar.WebPortal.Helpers.ContainerStatusInquiry",
                clientType: "EProcedureCommandBar",
                containerName: this.getContainer(),
                tasklistName: taskObj.taskList,
                taskName: taskObj.task,
                fun: "openTasklistSummary"
            })
        );
    },

    _getTxnTask: function () {
        var $tasklistItem = $('#ctl00_WebPartManager_TaskListWP_TaskListMenu_AccordionMenu_Div .active');
        var $taskItem = $('#ctl00_WebPartManager_TaskMenuWP_TaskMenu_ScrollableMenu_Container_Div.selected .taskitem-m');

        return { taskList: $tasklistItem.text(), task: $taskItem.text().replace('*', '') };
    },

    _isEprocDefined: function () {
        return $('#ctl00_WebPartManager_TaskListWP_TaskListMenu_AccordionMenu_Div').length > 0;
    },

    _getContainerInfo: function (filter) {

        // ContainerList control
        var containerName = this._getContainer();

        var taskObj = this._getTxnTask();

        if (containerName) {
            CallServer(JSON.stringify(
                {
                    serverType: "Camstar.WebPortal.Helpers.ContainerStatusInquiry",
                    clientType: "EProcedureCommandBar",
                    fun: "getContainerInfo",
                    containerName: containerName,
                    tasklistName: taskObj.taskList,
                    taskName: taskObj.task,
                    filter: filter
                }), null);
        }
        else
            return this._containerIsNotSelected();

        return this._processing();
    },

    _recordProdEvent: function () {
        var div_list = [];
        var dcEncoded = "DataContracts=" + encodeURI(JSON.stringify({ "AddContainerDM": this.getContainer() }));

        var url = "ProductionEventRecord_VPR2.aspx?IsFloatingFrame=2&IsChild=true&responsive=true&" +
            dcEncoded + "&CallStackKey=" + __page.generateQuickGuid();

        return this._buildPanelContent(url, div_list, name = "RecordProdEvntSlideOut", slideOutAttr = "recprodevnt", null, null);
    },

    setCallbackData: function (objData) {

        var baseData = ContainerStatusWebPart_Deco.prototype.setCallbackData.call(this, objData);
        if (baseData)
            return baseData;

        switch (objData.__fun) {
            case "openTasklistSummary":
                return this._viewTasklistSummary(objData);
            default:
                return null;
                break;
        }
    },

    _viewTasklistSummary: function (objData) {
        var div_list = [];

        var tasklistSummaryDM = objData.OpenTaskListSummary;       
        var taskCDO = tasklistSummaryDM.TaskCDO;
        //var popupTitle = tasklistSummaryDM.TasklistSummaryLabel;

        var containerRef = taskCDO.ExecuteTask_Container;
        var dc = JSON.stringify({ "cdmTaskListSummary": containerRef.Name, "cdmIsResponsive": 'true' });
        var url = location.href.substr(0, location.href.lastIndexOf("/")) +
            "/EProcTaskListSummaryVP.aspx?IsFloatingFrame=2&responsive=true&DataContracts=" + dc;

        return this._buildPanelContent(url, div_list, "EProcTaskListSummary", "eproc-tasklist-summary", null, null);
    }
});

//Created the function to move Document icon to bottom
function ContainerStatusWebPartV2_Deco() {
    CommandBarBase_Deco.call(this);
}

ContainerStatusWebPartV2_Deco.prototype = $.extend(Object.create(CommandBarBase_Deco.prototype), {

    initialize: function (commandBarObj) {
        CommandBarBase_Deco.prototype.initialize.apply(this, commandBarObj);
    },

    /* public virtual */
    GetCommandBarItems: function () {
        var me = this;
        this._commandBarItems.forEach(function (c) {
            if (c.Action && c.Action.Visible === undefined) {
                c.Action.Visible = me._isContainerDefined;
            }
        });
        return this._commandBarItems;
    },

    GetCommandBarGlobals: function () {
        var me = this;
        return $.extend(CommandBarBase_Deco.prototype.GetCommandBarGlobals.call(this),
            {
                transactionThreshold: function () { return 2; },
                onTransactionsLoaded: function (transactionArray) {
                    return this.transactionsLoaded(transactionArray);
                },
                getLabels: function (cmdObj) {
                    var baseLabels = CommandBarBase_Deco.prototype.get_instance().labels || {};
                    $.extend(cmdObj._labels, baseLabels);
                    return cmdObj._labels;
                },

                showMobileMenu: true
            });
    },

    _commandBarItems: [
        {
            Action: {
                PanelBuilder: function () { return this._getContainerInfo('all'); },
                Visible: function () { return this._isContainerDefined(); }
            },
            Icon: { CSS: "container-status" },
            Name: { Label: "Constants_ContainerStatus" }
        },
        {
            Action: {
                PanelBuilder: function () { return this._attachDocument(); },
                Visible: function () { return this._isContainerDefined(); }
            },
            Icon: { CSS: "container-attachments" },
            Name: { Label: "Lbl_AttachDocument" },
            CSS: { Bar: [], Panel: [] }
        },
        {
            Action: {
                Page: "MfgAuditTrailVP_R2",
                PanelBuilder: function () { return this._mfgAudit(); },
                GetDataContracts: function () { return this._getContainerNameObj(); },
                OpenMode: function () {
                    if ($(document.body).hasClass("mobile-device"))
                        return $(document.body).is(".mobile-device:not(.wide)") ? "slideout" : "popup";
                    return "newtab";
                },
                Visible: function () { return this._isContainerDefined(); }
            },
            Icon: { CSS: "container-audit-trail" },
            Name: { Label: "LblMenuMfgAuditTrail" }
        },
        {
            Action: { PanelBuilder: function () { return this._viewTimers(); }, Visible: false },
            Name: { Label: "ContainerStatus_ActiveTimers" },
            CSS: { Bar: ["active-timers"], Panel: ["extended-width"] },
        },
        {
            Action: {
                PanelBuilder: function () { return this._getContainerInfo('workflow'); },
                OpenMode: function () { return $(document.body).is(".mobile-device:not(.wide)") ? "slideout" : "popup"; },
                Visible: function () { return this._isContainerDefined(); }
            },
            Icon: { CSS: "container-workflow" },
            Name: { Label: "Container_Workflow" },
            CSS: { Bar: [], Panel: ["workflow"] }
        },
        {
            Action: {
                PanelBuilder: function () { return this._getContainerInfo('documents'); },
                Visible: function () { return this._isContainerDefined(); }
            },
            Icon: { CSS: "container-documents" },
            Name: { Label: "DocumentSet_DocumentEntries" },
        }
    ],

    _labels: {
        attributeColumnLbl: { Name: "AttributeTitle", Value: null },
        valueColumnLbl: { Name: "SelVal_Value", Value: null }
    },

    /* public virtual */
    setCallbackData: function (objData) {
        switch (objData.__fun) {
            case "getContainerInfo":
                return this._renderContainerStatusInfo(objData);
            case "openDocument":
                return this._openDocument(objData);
            case "attachDocument":
                return this._attachDocument(objData);
            case "viewTimers":
                return this._viewTimers(objData);
            default:
                break;
        }
    },

    getContainer: function () {
        return this._getContainer();
    },

    _isContainerDefined: function () {
        return !!this._getContainer();
    },

    transactionsLoaded: function (trButtons) {
        // Call base method
        CommandBarBase_Deco.prototype.transactionsLoad.apply(CommandBarBase_Deco.prototype.get_instance(), [trButtons]);

        var containerValue = this.getContainer();
        var isHidden = !containerValue;

        if (!containerValue && $(document.body).hasClass("common-search-r2") && trButtons.length > 0)
            isHidden = false;

        trButtons.each(function () {
            var $btn = $(this);
            if (isHidden)
                $btn.toggleClass("hidden", !$btn.hasClass("transaction-button"));
        });
        return containerValue;
    },

    _getContainerInfo: function (filter) {
        // ContainerList control
        var containerName = this._getContainer();

        if (containerName) {
            CallServer(JSON.stringify(
                {
                    serverType: "Camstar.WebPortal.Helpers.ContainerStatusInquiry",
                    clientType: "ContainerStatusWebPartV2_Deco",
                    fun: "getContainerInfo",
                    containerName: containerName,
                    filter: filter
                }), null);
        }
        else
            return this._containerIsNotSelected();

        return this._processing();
    },

    _containerIsNotSelected: function () {
        return [$("<div class=error> Container is not selected </div>")];
    },

    _processing: function () {
        return [$("<div>processing...</div>")];
    },

    _getContainer: function () {
        var containerControl = $get("ctl00_WebPartManager_ContainerStatusWP_ContainerStatus_ContainerName_Edit") ||
            $get("ctl00_WebPartManager_ContainerStatus_WP_ContainerStatus_ContainerName_Edit") ||
            $get("ctl00_WebPartManager_ContainerStatusWP_R2_ContainerStatus_ContainerName_Edit") ||
            $get("ctl00_WebPartManager_QuickLinksWP_ContainerStatus_ContainerName_Edit");

        if (containerControl) {
            return containerControl.value;
        }
        return null;
    },

    _renderContainerStatusInfo: function (data) {
        var div_list = [];
        if (data.Error) {
            div_list.push($("<div class=error>" + data.Error + "</div>"));
        }

        else if (data["DocumentSets"]) {
            var dss = data["DocumentSets"];
            var getIcon = this._getDocIconPath;

            Array.forEach(dss, function (d) {
                // Document Set name
                var $hdr = $("<div class='header-content-row cs-docset'></div>");
                $hdr.text(d.Name);
                div_list.push($hdr);

                // Doc entries
                Array.forEach(d.DocumentEntries, function (de) {
                    var $entry = $(
                        "<div class='content-row doc-entry'>" +
                        "<img class=icon></img>" +
                        "<div class=info><div class=name></div><div class=desc></div></div>" +
                        "</div>");
                    $entry.attr("browse-mode", de.BrowseMode);
                    $entry.prop("title", de.Description);
                    $('.icon', $entry).prop("src", getIcon(de.FileType));
                    $('.name', $entry).text(de.Name);
                    $('.desc', $entry).text(de.Description);
                    $entry.click(function () {

                        CallServer(JSON.stringify({
                            fun: 'openDocument',
                            serverType: "Camstar.WebPortal.Helpers.ContainerStatusInquiry",
                            clientType: "ContainerStatusWebPartV2_Deco",
                            documentName: de.Document.Name,
                            documentRev: de.Document.Revision
                        }), null);
                    });
                    div_list.push($entry);
                });
            });
        }
        else if (data["WorkflowRef"]) {
            var wf = data["WorkflowRef"];
            var title = wf.Name + ":" + wf.Revision;
            var step = data["StepName"];
            var dc = JSON.stringify({ "WorkflowCtl": title });
            var url = $(document.body).is(".mobile-device:not(.wide)") ?
                "WorkflowViewPopup_VP.aspx?IsFloatingFrame=2&responsive=true&StepName=" + step + "&DataContracts=" + dc :
                location.href.substr(0, location.href.lastIndexOf("/")) +
                "/WorkflowViewPopup_VP.aspx?IsFloatingFrame=2&IsChild=true&StepName=" + step + "&DataContracts=" + dc;

            if (!(div_list = this._buildPanelContent(url, div_list, name = "WorkflowSlideOut", slideOutAttr = "workflow", 600, 800)))
                div_list = [];
        }
        else {
            var $root = $("<div class=content-tbl></div>");
            var nodes = [];
            Object.keys(data).forEach(function (k) {
                if (!k.startsWith("__") && k.toLowerCase() !== 'attributes') {
                    var d = data[k];
                    if (d)
                        d = d.Value || "";
                    else
                        d = "";

                    var $r = $("<div class='content-row'><span class='name'></span><span class='val'></span></div>");
                    $(".name", $r).text(k);
                    $(".val", $r).text(d);
                    nodes.push($r);
                }
            });
            $root.html(nodes);
            div_list.push($root);

            if (data["Attributes"]) {
                var attrs = data["Attributes"];
                var $attHdr = $("<div class='header-content-row'><span class='header-name'></span><span class='header-value'></span></div>");
                $(".header-name", $attHdr).text(this._labels.attributeColumnLbl.Value);
                $(".header-value", $attHdr).text(this._labels.valueColumnLbl.Value);

                div_list.push($attHdr);
                var $column = $("<div class=content-tbl></div>");
                var rows = [];
                attrs.forEach(function (ap) {
                    var d = $("<div class='attribute-row content-row'><span class=attribute-name></span><span class=attribute-val></span></div>");
                    $(".attribute-name", d).text(ap.Name);
                    $('.attribute-val', d).text(ap.AttributeValue);
                    rows.push(d);
                });
                $column.html(rows);
                div_list.push($column);
            }
        }
        return div_list;
    },

    _attachDocument: function () {
        var div_list = [];
        var $di = $("<div class=iframe-container></div>");
        $di.append("<iframe></iframe>");
        var dc = encodeURIComponent(JSON.stringify({ "SelectedContainerNameDM": this.getContainer() }));
        var url = "AttachDocument_VP.aspx?IsFloatingFrame=2&responsive=true&DataContracts=" + dc;

        $('iframe', $di)
            .prop("src", url)
            .prop("name", "AttachDocumentSlideOut")
            .attr("slideout", "attachDocument")
            .on("load", function () {
                // "this" is an iframe
                $('body', this.contentDocument)
                    .addClass("commandbar-panel")
                    .addClass("cs-responsive");
            });

        $('iframe', $di).css('width', "100%").css("height", "100%");
        div_list.push($di);
        return div_list;
    },

    _viewTimers: function () {
        var div_list = [];
        var dc = encodeURIComponent(JSON.stringify({ "SelectedContainerNameDM": this.getContainer() }));
        var url = "TimersListPopup_VP.aspx?IsFloatingFrame=2&IsChild=true&responsive=true&slideout=timers&DataContracts=" + dc;
        var $di = $("<div class=iframe-container></div>");
        $di.append("<iframe></iframe>");
        $('iframe', $di)
            .prop("src", url)
            .prop("name", "TimersSlideOut")
            .attr("slideout", "timers")
            .css('width', "100%").css("height", "100%");
        div_list.push($di);
        return div_list;
    },

    _getDocIconPath: function (fileType) {
        var theme = "Camstar";
        var extension = ".png";
        if ($("body").hasClass("Horizon-theme")) {
            theme = "Horizon";
            extension = ".svg";
        }

        var path = "Themes/" + theme + "/images/icons/";
        var icon;
        switch (fileType.toLowerCase()) {
            case ".bmp":
                icon = "typeBMP48"; break;
            case ".rtf":
                icon = "typeRTF48"; break;
            case ".pdf":
                icon = "icon-pdf-32x32"; break;
            case ".docx":
            case ".doc":
                icon = "icon-word-32x32"; break;
            case ".xml":
                icon = "typeXml48"; break;
            case ".exe":
                icon = "typeExe48"; break;
            case ".exel":
                icon = "typeMsExcel48"; break;
            case ".gif":
                icon = "typeGif48"; break;
            case ".jpg":
            case ".jpeg":
                icon = "icon-jpg-32x32"; break;
            case ".txt":
                icon = "typeTxt48"; break;
            case ".zip":
                icon = "typeZipFile48"; break;
            case ".png":
                icon = "typePng48"; break;
            case ".pptx":
            case ".pptm":
            case ".ppt":
                icon = "typeMsPowerpoint48"; break;
            case ".html":
            case ".htm":
                icon = "HTML_32_32"; break;

            case ".jt":
                switch (theme.toLowerCase()) {
                    case "camstar":
                        icon = "3D_32_32"; break;
                    case "horizon":
                        icon = "Type3D48"; break;
                }
                break;
            case "url":
                icon = "HTML_32_32"; break;
            default:
                icon = "icon-unknown-32x32"; break;
        }
        path += icon + extension;

        return path;
    },

    _mfgAudit: function () {
        var div_list = [];
        var dc = JSON.stringify({ "AddContainerDM": this.getContainer() });
        var dcEncoded;

        if (dc) {
            dcEncoded = "DataContracts=" + encodeURI(dc);
        }

        var url = "MfgAuditTrailVP.aspx?IsFloatingFrame=2&IsChild=true&responsive=true&" + dcEncoded + "&CallStackKey=" + __page.generateQuickGuid();

        return this._buildPanelContent(url, div_list, "MfgAuditTrailSlideOut", "mfgaudit", null, null);
    },

    _buildPanelContent: function (url, div_list, name, slideOutAttr, height, width) {

        if ($(document.body).is(".mobile-device:not(.wide)")) {
            // slideout
            var $di = $("<div class=iframe-container></div>");
            $di.append("<iframe></iframe>");

            $('iframe', $di)
                .prop("src", url)
                .prop("name", name)
                .attr("slideout", slideOutAttr)
                .on("load", function () {
                    // "this" is an iframe
                    $('body', this.contentDocument)
                        .addClass("commandbar-panel")
                        .addClass("cs-responsive");
                });

            $('iframe', $di).css('width', "100%").css("height", "100%");
            div_list.push($di);
        }
        else {
            // Popup

            pop.showAjax(url, null,
                this.isResponsive = height || screen.availHeight/*height*/,
                this.isResponsive = width || screen.availWidth /*width*/,
                this.isResponsive ? 0 : 100/*top*/,
                this.isResponsive ? 0 : 100/*left*/, true /*showButtons*/,
                "" /*okButtonText*/, ""/*closeButtonText*/,
                this /*element*/, true /*closeOnCancel*/,
                ''/*optionArgs*/, null /*cancelConfirmMsg*/, false, false /*display reset*/);
        }

        return div_list;
    },

    _getContainerNameObj: function () {
        var containerName = this.getContainer();
        if (containerName)
            return "{\"AddContainerDM\":\"" + containerName + "\"}";

        return "";
    }

});

