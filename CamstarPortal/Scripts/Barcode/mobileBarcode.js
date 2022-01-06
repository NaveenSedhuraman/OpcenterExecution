// Copyright Siemens 2019

function InitBarcodeIcons() {

    if (BarcodeReader === undefined) return;  // if the script have not been loaded do not attempt to initailze

    // select all input type text that are not readonly
    let inputSelector = "input[type=text][readonly!='readonly']";
    let inputDatePickerSelector = "input[class='hasDatepicker'][readonly!='readonly']";
    let popoverOptions = {
        html: true,
        trigger: 'focus',
        content: function () {
            return "<img id='popoverImage' src='Themes/Horizon/Images/cmdBarcode24.svg' class='barcode-icon-popover'>";
        }
    };
    let popoverDatePickerOptions = {
        html: true,
        trigger: 'focus',
        content: function () {      
            return "<img id='popoverImageDate' src='Themes/Horizon/Images/cmdBarcode24.svg' class='barcode-icon-popover-date'>";
        }
    };
    // init the popover
    $(inputSelector).popover(popoverOptions);
    $(inputDatePickerSelector).popover(popoverDatePickerOptions);
    $(inputSelector).on('shown.bs.popover', function () {
        $(".barcode-icon-popover").attr("target", $(this).attr("name"))
    });
    $(inputDatePickerSelector).on('shown.bs.popover', function () {
        $(".barcode-icon-popover-date").attr("target", $(this).attr("name"))
    });
    $(inputDatePickerSelector).on('inserted.bs.popover', function () {
        $(".barcode-icon-popover-date")
            .on("mousedown", function () {
                startScan(this);
            });
    });
    $(inputSelector).on('inserted.bs.popover', function () {
        $(".barcode-icon-popover")
            .on("mousedown", function () {
                startScan(this);
            });
    });

} // InitBarcodeIcons

function startScan(target) {
    console.log("start scan");

    // get the input target name
    target = $(target).attr("target");

    // Dynamsoft barcode key
    BarcodeReader.licenseKey = "f0068NQAAAEYe2Eo9wov81Bv5armCRe//5v52yJaFZ9e3AmDjU7qll4RQickg0lk41+wBgpswVexTGvp8s7oi38YSFCNDTNg=";

    // create the scanner object and set the configuration settings
    scanner = new BarcodeReader.Scanner({
        onNewCodeRead: function (txt, result) { scanComplete(target, txt); } //(txt, result) => { scanComplete(target, txt); }
    });

    // additional configuration settings (could be set in the initial call)
    scanner.duplicateForgetTime = 0;
    scanner.onFrameRead = undefined;
    scanner.runtimeSettings.mBarcodeFormatIds = BarcodeReader.EnumBarcodeFormat.All;

    // open the scanner
    scanner.open().catch(function (ex) {
        console.log(ex);
        scanner.close();
    });

    console.log("end scan");
} // startScan

function stopScan(target) {
    scanner.close();
} // stopScan

function scanComplete(target, txt) {
    console.log(target + ": " + txt);
    $("input[name='" + target + "']").val(txt);
    $("input[name='" + target + "']").focus();
    stopScan();
} // scanComplete

// global variables
var scanner;
