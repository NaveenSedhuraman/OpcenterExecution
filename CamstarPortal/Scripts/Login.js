// Copyright Siemens 2019  

$(function ($) {
    $(".ui-login").login();
    $("#UsernameTextbox").focus();
});

(function ($)
{
    var isOptionsVisible = false;
    $.fn.login = function (options)
    {
        var $optionLink = $(".ui-login-options");
        var $optionContainer = $(".ui-login-optioncontainer");
        var $timeZoneDropDown = $("#TimeZoneDropDown")[0];
        var $usernameTextbox = $("#UsernameTextbox");
        var $passwordTextbox = $("#PasswordTextbox");
        var $loginButton = $("#LoginButton");
        var $errorContainer = $(".ui-login-error");
        var $errorLabel = $("#ErrorLabel");
        
        var isOptionsVisible = false;

        if ($timeZoneDropDown.options[0].value == 'isnotpostback')
        {
            $timeZoneDropDown.remove(0);
            var data = new Date();
            var time = -data.getTimezoneOffset();
            for (var i = 0; i < $timeZoneDropDown.options.length; i++)
            {
                if ($timeZoneDropDown.options[i].value == time)
                {
                    $timeZoneDropDown.selectedIndex = i;
                }
            }

            if ($timeZoneDropDown.selectedIndex == -1)
                $timeZoneDropDown.selectedIndex = 0;
        }

        if($errorLabel.html().length > 0)
            $errorContainer.slideDown();
            

        // event handlers
        $optionLink.click(function() 
        { 
            $optionContainer.slideToggle(); 
            isOptionsVisible = !isOptionsVisible;
            $optionLink.toggleClass('option-link-contract').toggleClass('option-link-expand');
        });

        $loginButton.click(function(e)
        {
            var username = $usernameTextbox.val();
            var password = $passwordTextbox.val();
            var isValid = true;
            var message = "";
            
            if (username.length == 0 && password.length == 0)
            {
                $usernameTextbox.removeClass("ui-state-active").addClass("ui-state-error");
                $passwordTextbox.removeClass("ui-state-active").addClass("ui-state-error");
                message = "Username and password required.";
                isValid = false;
            }

            if (username.length == 0 && password.length > 0 && isValid)
            {
                $usernameTextbox.addClass("ui-state-error").removeClass("ui-state-active");
                $passwordTextbox.removeClass("ui-state-error").addClass("ui-state-active");
                message = "Username required.";
                isValid = false;
            }

            if (password.length == 0 && username.length > 0 && isValid)
            {
                $usernameTextbox.removeClass("ui-state-error").addClass("ui-state-active");
                $passwordTextbox.removeClass("ui-state-active").addClass("ui-state-error");
                message = "Password required.";
                isValid = false;
            }

            if (isValid)
            {
                $usernameTextbox.removeClass("ui-state-error").addClass("ui-state-active");
                $passwordTextbox.removeClass("ui-state-error").addClass("ui-state-active");

                //disable the button to prevent multiple clicks and multiple active user sessions being created
                setTimeout(function () {
                    $loginButton.attr('disabled', 'disabled');
                }, 100);

            }
            else
            {
                e.preventDefault();
                $errorLabel.html(message);
                $errorContainer.slideDown();

                //if validation failed (eg: emtpy username, pw, etc..) then re-enable the button
                $loginButton.removeAttr('disabled');
            }
        });
    };

})(jQuery);
