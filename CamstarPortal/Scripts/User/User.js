/*
***************************************************************************
Copyright Siemens 2020  
This file should include all user-defined javascript functions. 
Functions defined in this file will over-ride any functions of the
same name written in any of the Camstar supplied javascript files.
***************************************************************************
*/

function UpdateSideBarIcons() {
    setTimeout(addIcons, 250);
}

function addIcons() {
    if (__page.get_isResponsive()) {
        var bar = $('#ctl00_sidebar');
        if (bar.length) {
            var icons = bar.find('span.item-icon');
            var actionToggleData = $('#ctl00_WebPartManager_OperationalViewWP_ActionToggle').find('input[type=text]').val();
            if (actionToggleData != undefined) {
                var actionSettingsList = new Array(1);
                if (actionToggleData.indexOf(',') > -1) {
                    actionSettingsList = actionToggleData.split(',');
                }
                else {
                    actionSettingsList[0] = actionToggleData;
                }

                if (actionSettingsList.length) {
                    for (var x = 0; x < actionSettingsList.length; x++) {
                        var actionSetting = actionSettingsList[x].split(':');
                        if (actionSetting[1] == "F") {
                            bar.find('div[title=' + actionSetting[0] + '').attr('style', 'pointer-events: none; opacity: 0.4;')
                        }
                        else {
                            bar.find('div[title=' + actionSetting[0] + '').attr('style', 'pointer-events: all; opacity: 1;')
                        }
                    }
                }
            }

        }
    }
}
//Trailing Space Fix Record Device SN - Start 

function remove_whitespace() {
//var me = gridObject;
var grid = $(this.GridID);
var rowData = grid.getRowData();
for (var i = 0; i < rowData.length; i++) {
var record = rowData[i];
var currentRow;

if (record._id_column != undefined)
currentRow = $('tr[id="' + record._id_column + '"]', grid);
else
currentRow = $('tr.jqgrow', grid).eq(i);



// dexTXSN- column name which we need to check
if (record["dexTXSN"] != null && record["dexTXSN"] != "") {
var TXSN = record["dexTXSN"].toString().trim();
// dexTXSN - instead of this give column which u need update the value
var tdCnt = $(currentRow).find("td[aria-describedby$='_dexTXSN']");
tdCnt.text(TXSN);
}
}
}
//Trailing Space Fix Record Device SN - End


function ObjectDataValue_Change() {
    //ctl00_WebPartManager_ParametricDataWP_ParamDataField_ParametricDataControl_1x1xObjectNDO_Edit
    $("#ctl00_WebPartManager_EProcDCWP_DCParamDataField_ParametricDataControl_1x1xObjectNDO").bind('change', function () {
        __doPostBack('ctl00_WebPartManager_EProcDCWP_DCParamDataField_ParametricDataControl_1x1xObjectNDO', '');
       // setTimeout(function () { __doPostBack('ctl00_WebPartManager_ParametricDataWP_ParamDataField_ParametricDataControl_1x1xObjectNDO', '') }, 500);
      
    })

}


//Added for Verify Cal Due Dates Render Completed event -- Start
function dexGrdVerifyCalDueDates_ServiceDetails_renderCompleted() {
    var grid = $(this.GridID);
    var rowData = grid.getRowData();
    var rowElems = grid.find('tr');

    if (rowElems != null) {
        $.each(rowElems, function (index, element) {
            if (element != null) {
                var DEX_CalDueReqd = $(element).find('td[aria-describedby*=dexCalDueRequired]').text().trim();
                if (DEX_CalDueReqd == '' || DEX_CalDueReqd == 'No') {
                    $(element).bind('click', DEX_NoClick);
                }
                else {
                    $(element).unbind('click', DEX_NoClick);
                }

            }
        });

    }
}

function DEX_NoClick() {
    return false;
}
//Added for Verify Cal Due Dates Render Completed event -- End

//Added for Manage Pallet Render Completed event -- Start
function dexStartPallet_dexChildLots_renderCompleted() {
	if($('input[id*=""]').attr('checked')=='checked')
	{
		$('.cmdbar-ManagePalletButton').attr('title','Start Pallet');
		$('.cmdbar-ManagePalletButton').find('.caption-text').html('Start Pallet');
	}
	else
	{
		$('.cmdbar-ManagePalletButton').attr('title','Update Pallet');
		$('.cmdbar-ManagePalletButton').find('.caption-text').html('Update Pallet');
	}
    var grid = $(this.GridID);
    var rowData = grid.getRowData();
    var rowElems = grid.find('tr');

    if (rowElems != null) {
        $.each(rowElems, function (index, element) {
            if (element != null) {
                var DEX_ChildLots = $(element).find('td[aria-describedby*=dexChildLots_Name]').text().trim();
                if (DEX_ChildLots != '') {
                    $(element).find('td:eq(2)').bind('click',  (function(){ $(element).find('td:eq(1)').click(); }));
                }
            }
        });
    }
}

//Added for Manage Pallet Render Completed event -- End
function ValidateCell() {
    //var me = gridObject;
    console.log('test');
    var grid = $(this.GridID);
    var rowData = grid.getRowData();
    for (var i = 0; i < rowData.length; i++) {
        var record = rowData[i];
        var currentRow;

        if (record._id_column != undefined)
            currentRow = $('tr[id="' + record._id_column + '"]', grid);
        else
            currentRow = $('tr.jqgrow', grid).eq(i);
        var tdRev = $(currentRow).find("td[aria-describedby$='_dexRevision']");
        // dexTXRev- column name which we need to check

        if (record["dexName"] != "") {
            if (record["dexRevision"] == null || record["dexRevision"] == "") {
                var TXRev = record["dexRevision"].toString().trim();
                tdRev.text(TXRev);
                tdRev.attr('cell-not-entered', 'cell-not-entered');
            }
            else {
                tdRev.removeAttr('cell-not-entered');
            }
        }
    }
}


//Added to replace remove details grid header checkbox with "scrap" text
function RemovalDetailsGridRenderCompleted(isAtTheEndOfProcessing, rowid, prm2) {
var gridElement = this.GridID;
    var HeaderChkBox = $('#gbox_' + gridElement.replace('#', '')).find('table:eq(0)').find('thead > tr > th:eq(0)').attr('id');
    $('#' + HeaderChkBox).find('div').css('display', 'none');
    $('#' + HeaderChkBox).find('span.sGridSelect').remove();
    $('#' + HeaderChkBox).append("<span class='sGridSelect' style='width:50px !important; margin-top:-2px !important;'>Scrap</span>");
    $('#' + HeaderChkBox).css('padding', '0px 25px 0px 0px');
     $('#' + HeaderChkBox).css('font-weight', '600');
    var grid = $(gridElement);
    var objRows = grid.find('tr');
    if (objRows.length > 1) {
        for (var i = 0; i < objRows.length; i++) {
            $(objRows[i]).find('td:eq(0)').attr('style', 'width: 55px !important; min-width: 53px !important; text-align: center;');
        }
    }
}

/* Remove selected sample from shop floor DC control -- start */
function deleteShopFloorCtrl() {
    var DCParam = $('.ParametricDataControl').find('.ShopFloorDCHeaderResp');
    $('.ParametricDataControl').find('.ShopFloorDCHeaderResp').find('#imgSampleTrash').remove();
    //Add trace icon in grid header
    $('<input />', { type: 'image', id: 'imgSampleTrash', value: 'imgSampleTrash', src: '/CamstarPortal/Themes/Horizon/images/grids/cmdTrash24.svg', style: 'margin-top:4px;', onclick: 'RemoveDCSamples()' }).appendTo(DCParam);
    //Checking iteration grid type horizontal
    if ($('.ParametricDataControlMainTableResp').attr('horizontal') == 'true') {
        //Adding checkbox for each samples and adding samplenum attribute
        $('.ShopFloorDCTable_MainResp > tbody > tr > td> table > tbody > tr:not(:first-child)').each(function () {
            $(this).find('td:eq(0)').find('div').css('margin-left', '35px');
            $('<input />', {
                type: 'checkbox', id: 'cbDeleteSample', value: 'cbDeleteSample', style: 'float: left; margin-top: -21px; margin-left: 5px; width: 20px; height: 20px;'
            }).attr('samplenum', $(this).find('td:eq(0)').attr('samplenum')).appendTo($(this).find('td:eq(0)'));
        });
    }
    else {
        //Adding checkbox for each samples and adding samplenum attribute
        $('.ShopFloorDCTableResp > tbody > tr:eq(0) > td').each(function () {
            $(this).find('.ShopFloorDCVerticalSampleResp').css('margin-left', '20px');
            $('<input />', {
                type: 'checkbox', id: 'cbDeleteSample', value: 'cbDeleteSample', style: 'float: left; margin-top: -21px; margin-left: 5px; width: 20px; height: 20px;'
            }).attr('samplenum', $(this).attr('samplenum')).appendTo($(this));
        });
    }

}

function RemoveDCSamples() {
    var sampleRow = '';
    //Checking iteration grid type horizontal
    if ($('.ParametricDataControlMainTableResp').attr('horizontal') == 'true') {
        //Removing the tags for selected checkbox sample row
        $('.ShopFloorDCTable_MainResp > tbody > tr > td> table > tbody > tr:not(:first-child)').each(function () {
            if ($(this).find('td:eq(0)  > input[type="checkbox"]').prop('checked')) {
                var sampleNum = $(this).find('td:eq(0)  > input[type="checkbox"]').attr("samplenum");
                $('.ShopFloorDCTable_MainResp > tbody > tr > td> table > tbody > tr:not(:first-child)').each(function () {
                    $(this).find('td[samplenum="' + sampleNum + '"]').parent().remove();
                })
                $('.ShopFloorDCTableResp > tbody > tr').each(function () {
                    $(this).find('td[samplenum="' + sampleNum + '"]').parent().remove();
                });
                if (sampleRow != '')
                    sampleRow += ',';
                sampleRow += sampleNum;
            }
        });
    }
    else {
        //Removing the tags for selected checkbox sample column
        $('.ShopFloorDCTableResp > tbody > tr:eq(0) > td > input[type="checkbox"]').each(function () {
            if ($(this).prop('checked')) {
                $('.ShopFloorDCTableResp > tbody > tr > td[samplenum="' + $(this).attr("samplenum") + '"]').each(function () {
                    $(this).remove();
                });
                if (sampleRow != '')
                    sampleRow += ',';
                sampleRow += $(this).attr("samplenum");
            }
        });
    }
    //Assign deleted sample num in textbox
    if (sampleRow != '') {
        $('[id*="DeleteSampleRow"]').find('input[type="text"]').val(sampleRow);
    }
}


function ReDefineShopFloorDC() {
   setTimeout(function () { __doPostBack('ctl00_WebPartManager_EProcDCWP_DCParamDataField_ParametricDataControl_1x1xObjectNDO', ''); }, 1000);
}
/* Remove selected sample from shop floor DC control -- end */