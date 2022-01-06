<%-- Copyright Siemens 2020   --%>

<%@ Page Language="c#" CodeFile="Default.aspx.cs" AutoEventWireup="false" Inherits="Camstar.Portal.Default" %>

<!doctype html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">

<head>
    <title>Opcenter Execution</title>
    <asp:PlaceHolder runat="server">
        <%= this.styleSheetString %>
    </asp:PlaceHolder>

</head>
<body>
    <%: Scripts.Render("~/bundles/login") %>
    <form id="form1" runat="server" method="post">
        <div class="ui-login">
            <div class="ui-login-signin">
                <div class="ui-login-title ui-rounded ui-shadow">Log On</div>
                <div class="ui-login-main ui-shadow">
                    <div class="ui-login-border"></div>
                    <ul>
                        <li>
                            <asp:Label ID="UsernameLabel" runat="server">Username</asp:Label></li>
                        <li>
                            <asp:TextBox ID="UsernameTextbox" runat="server"></asp:TextBox></li>
                        <li>
                            <asp:Label ID="PasswordLabel" runat="server">Password</asp:Label></li>
                        <li>
                            <asp:TextBox ID="PasswordTextbox" runat="server" TextMode="Password" autocomplete="new-password"></asp:TextBox>
                            <input type="password" style="display:none" /></li>
                        <li>
                            <asp:Label ID="DomainLabel" runat="server"></asp:Label>Domain</li>
                        <li>
                            <asp:DropDownList ID="DomainDropDown" runat="server"></asp:DropDownList></li>
                        <li>
                            <asp:Button ID="LoginButton" runat="server" Text="Log On" OnClick="LoginButton_Click" CssClass="cs-button" /></li>
                    </ul>
                    <div class="ui-login-error">
                        <asp:Label ID="ErrorLabel" runat="server"></asp:Label>
                    </div>
                    <a class="ui-login-options option-link-expand">Options</a>
                    <div class="ui-login-optioncontainer">
                        <ul>
                            <li>
                                <asp:Label ID="LanguageLabel" runat="server">Language</asp:Label></li>
                            <li>
                                <asp:DropDownList ID="LanguageDropDown" runat="server" />
                            </li>
                            <li>
                                <asp:Label ID="TimeZoneLabel" runat="server">Time Zone</asp:Label></li>
                            <li>
                                <asp:DropDownList ID="TimeZoneDropDown" runat="server" />
                            </li>
                        </ul>
                    </div>
                    <div class="ui-login-border"></div>
                </div>
            </div>
            <div class="ui-login-legal">
                <span>Copyright Siemens
                    <asp:Label ID="Year" runat="server" />
                </span>
            </div>
        </div>
    </form>
</body>
</html>
