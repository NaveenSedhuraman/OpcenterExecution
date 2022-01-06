<%-- Copyright Siemens 2019   --%>
<%@ Page Language="C#" AutoEventWireup="true" CodeFile="CrystalReportPage.aspx.cs" Inherits="CrystalReportPage" %>

<%@ Register Assembly="CrystalDecisions.Web, Version=13.0.2000.0, Culture=neutral, PublicKeyToken=692fbea5521e1304"
    Namespace="CrystalDecisions.Web" TagPrefix="CR" %>
<%@ Register Assembly="CrystalDecisions.Shared, Version=13.0.2000.0, Culture=neutral, PublicKeyToken=692fbea5521e1304"
    Namespace="CrystalDecisions.Shared" TagPrefix="CR" %>
<%@ Register Assembly="CrystalDecisions.CrystalReports.Engine, Version=13.0.2000.0, Culture=neutral, PublicKeyToken=692fbea5521e1304"
    Namespace="CrystalDecisions.CrystalReports.Engine" TagPrefix="CR" %>


<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>Crystal Report Internal Page</title>

    <script language="javascript" type="text/javascript">
        function FixReportContentInFloatingFrame(dtb) {
            // Zoom report into current zoom factor.
            var element = document.getElementById('text_CrystalReportViewer1_toptoolbar_zoom');
            if (element) {
                var o = getWidget(element)
                if (o)
                    o.enterCB(e);
            }
            // Hide toolbar (in case DisplayToolbar == true) only after zooming.
            if (!dtb) {
                var tb = document.getElementById('CrystalReportViewer1_toptoolbar');
                if (tb) {
                    tb.nextSibling.style.display = "none";
                    tb.style.display = "none";
                }
            }
        }

        function RunNeighbour()
        {
            var t = getCEP_top();
            for (var i = 0; i < t.frames.length; i++)
            {
                var ifrm = t.frames[i];
                if (ifrm.location.pathname.indexOf("Blank.htm") != -1)
                {
                    var a = ifrm.location.href.replace("Blank.htm", "CrystalReportPage.aspx");
                    ifrm.location = a;
                    break;
                }
            }
        }

        function CloseCrystalReport(frame)
        {
            if (frame != null)
            {
                frame.height = 0;
                frame.width = 0;
                frame.style.position = "absolute";
                frame.frameBorder = 0;
                frame.src = "/StudioPortal/Blank.htm";
            }
        }

    </script>
</head>
<body style="padding: 0px; margin: 0px;">
    <form id="form1" runat="server">
        <table width="100%" style="border-collapse: collapse; border-top: 1 solid black;" cellpadding="1" cellspacing="0" border="1">
            <tr>
            <td>
                    <CR:CrystalReportViewer ID="CrystalReportViewer1" runat="server" AutoDataBind="true" BestFitPage="False" 
                    displaytoolbar="True" ToolPanelView="None" />
                </td>
            </tr>
        </table>
        <asp:Label Text="" runat="server" ID="Message" />
    </form>
</body>
</html>
