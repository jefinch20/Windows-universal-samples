﻿//*********************************************************
//
// Copyright (c) Microsoft. All rights reserved.
// This code is licensed under the MIT License (MIT).
// THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF
// ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY
// IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR
// PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.
//
//*********************************************************

(function () {
    "use strict";
    var page = WinJS.UI.Pages.define("/html/Scenario2_ErrorHandling.html", {

        ready: function (element, options) {

            WinJS.log("Find and claim the printer to begin.", "sample", "status");

            document.getElementById("findClaimEnableButton").disabled = false;
            document.getElementById("printLineButton").disabled = true;
            document.getElementById("scenarioEndButton").disabled = true;

            document.getElementById("findClaimEnableButton").addEventListener("click", findClaimEnable, false);
            document.getElementById("scenarioEndButton").addEventListener("click", endScenario, false);
            document.getElementById("printLineButton").addEventListener("click", printLine, false);
        },

        unload: function () {
            if (_claimedPrinter !== null) {
                _claimedPrinter.close();
                _claimedPrinter = null;
            }

            if (_printer !== null)
            {
                _printer.close();
                _printer = null;
            }
        }
    });

    var _printer = null;
    var _claimedPrinter = null;
    var _isImportantTransaction = true;

    //
    //Creates multiple tasks, first to find a receipt printer, then to claim the printer and then to enable and add releasedevicerequested event handler.
    //
    function findClaimEnable() {

        WinJS.log("Finding printer...", "sample", "status");

        if (_printer == null) {

            SdkSample.getFirstReceiptPrinterAsync().then(function (printer) {

                if (printer != null) {
                    _printer = printer;

                    //Claim
                    _printer.claimPrinterAsync().done(function (claimedPrinter) {

                        if (claimedPrinter !== null) {

                            _claimedPrinter = claimedPrinter;

                            //Enable printer
                            _claimedPrinter.enableAsync().done(function (success) {

                                if (success) {
                                    WinJS.log("Enabled printer. Device ID: " + _claimedPrinter.deviceId, "sample", "status");

                                    document.getElementById("findClaimEnableButton").disabled = true;
                                    document.getElementById("printLineButton").disabled = false;
                                    document.getElementById("scenarioEndButton").disabled = false;
                                } else {
                                    WinJS.log("Could not enable printer.", "sample", "error");
                                }
                            });
                        } else {
                            WinJS.log("Could not claim the printer.", "sample", "error");
                        }
                    });
                } else {
                    WinJS.log("No printer found", "sample", "error");
                }
            });
        }
    }

    function endScenario() {

        if (_claimedPrinter !== null) {
            _claimedPrinter.close();
            _claimedPrinter = null;
        }

        if (_printer !== null) {
            _printer.close();
            _printer = null;
        }

        WinJS.log("Scenario ended.", "sample", "status");

        document.getElementById("findClaimEnableButton").disabled = false;
        document.getElementById("printLineButton").disabled = true;
        document.getElementById("scenarioEndButton").disabled = true;
    }

    //
    //Prints the line that is in the textbox and checks for error conditions.
    //
    function printLine() {

        if (_claimedPrinter == null) {
            WinJS.log("Claimed printer instance is null. Cannot print.", "sample", "error");
            return false;
        }
        else {

            var job = _claimedPrinter.receipt.createJob();
            job.printLine(document.getElementById("txtPrintLine").value);

            job.executeAsync().done(function () {
                WinJS.log("Printed line.", "sample", "status");

            }
            , function error(e) {
                if (_claimedPrinter.receipt.isCartridgeEmpty) {
                    WinJS.log("Printer is out of ink. Please replace cartridge.", "sample", "status");
                }
                else if (_claimedPrinter.receipt.isCartridgeRemoved) {
                    WinJS.log("Printer cartridge is missing. Please replace cartridge.", "sample", "status");
                }
                else if (_claimedPrinter.receipt.isCoverOpen) {
                    WinJS.log("Printer cover is open. Please close it.", "sample", "status");
                }
                else if (_claimedPrinter.receipt.isHeadCleaning) {
                    WinJS.log("Printer is currently cleaning the cartridge. Please wait until cleaning has completed.", "sample", "status");
                }
                else if (_claimedPrinter.receipt.isPaperEmpty) {
                    WinJS.log("Printer is out of paper. Please insert a new roll.", "sample", "status");
                }
                else {
                    WinJS.log("Was not able to print line: " + e.message, "sample", "error");
                }
            });
        }
    }
})();