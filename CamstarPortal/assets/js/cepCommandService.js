"use strict";

var __spreadArrays = void 0 && (void 0).__spreadArrays || function () {
  for (var s = 0, i = 0, il = arguments.length; i < il; i++) {
    s += arguments[i].length;
  }

  for (var r = Array(s), k = 0, i = 0; i < il; i++) {
    for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++) {
      r[k] = a[j];
    }
  }

  return r;
};

var CmdDefinition =
/** @class */
function () {
  function CmdDefinition() {}

  return CmdDefinition;
}();

var MenuDef =
/** @class */
function () {
  function MenuDef() {}

  return MenuDef;
}();

var CommandService =
/** @class */
function () {
  function CommandService(iconSvc, cepLabelSvc, cepViewModelSvc) {
    this.iconSvc = iconSvc;
    this.cepLabelSvc = cepLabelSvc;
    this.cepViewModelSvc = cepViewModelSvc;
    this.openedMenuItems = [];
  }

  CommandService.prototype.getTopLevelMenuItems = function () {
    var _this = this;

    if (this.selectedTopMenu) {
      var selectedMenu = this.menuItems.menu.find(function (m) {
        return m.propertyDisplayName == _this.selectedTopMenu;
      });

      if (selectedMenu && selectedMenu.children) {
        return {
          selectedMenu: this.selectedTopMenu,
          menu: selectedMenu.children
        };
      }

      return {};
    } else {
      console.warn("No Items selected");
      return {};
    }
  };

  CommandService.prototype.getMenuItem = function (name) {
    var _this = this;

    var item;
    var selectedItem = this.menuItems.menu.find(function (m) {
      return m.propertyDisplayName == _this.selectedTopMenu;
    });

    if (selectedItem.children && selectedItem.children.length) {
      selectedItem.children.forEach(function (c) {
        if (c.value == name) {
          item = c;
        }
      });
    } else {
      item = selectedItem;
    }

    return item;
  };

  CommandService.prototype.initializeMenu = function (menuItems) {
    var _this = this;

    if (!menuItems) {
      return false;
    }

    return this.cepViewModelSvc.getViewModel('commandsViewModel').then(function (commandsVM) {
      var commandViewModel = _this.cepLabelSvc.getTranslatedViewModel('commands', commandsVM);

      return _this.cepViewModelSvc.updateViewModel('commandsViewModel', commandViewModel).then(function () {
        // dynamic menus
        _this.buildMenu(commandViewModel, menuItems);

        _this.menuItems = menuItems;
        return true;
      });
    });
  };

  CommandService.prototype.addToOpenedMenuItem = function (item) {
    var commandLabels = this.cepLabelSvc.getCommandLabels();

    if (item.isHomePage && item.propertyDisplayName == commandLabels.momCmdGoToHomePage) {
      this.isHomePageButtonClicked = true;
    } // add to openedMenuItems


    var selectedMenuItem = {
      topLevelMenu: this.selectedTopMenu,
      menuItem: item
    };

    if (typeof this.openedMenuItems === "undefined") {
      this.openedMenuItems = [selectedMenuItem];
    } else {
      var select = this.openedMenuItems.filter(function (i) {
        return i.menuItem.propertyDisplayName == item.propertyDisplayName;
      });

      if (select.length == 0) {
        this.openedMenuItems = __spreadArrays(this.openedMenuItems, [selectedMenuItem]);
      }
    }
  };

  CommandService.prototype.selectTopMenu = function (menu) {
    this.selectedTopMenu = menu;
    var selectedMenu = this.menuItems.menu.find(function (m) {
      return m.propertyDisplayName == menu;
    });

    if (!selectedMenu || !selectedMenu.children || !selectedMenu.children.length) {
      return true;
    }

    return false;
  };

  CommandService.prototype.setHeader = function (header, key) {
    if (key) {
      var menuItem;
      var differentiatedMenuItem;

      if (header) {
        menuItem = this.openedMenuItems.filter(function (i) {
          return i.menuItem.value == header;
        });

        if (menuItem.length > 1) {
          var item;
          var commandLabels = this.cepLabelSvc.getCommandLabels();
          var homePageLabel = commandLabels.momCmdGoToHomePage;
          var differentiatedMenuItem;

          if (this.isHomePageButtonClicked) {
            differentiatedMenuItem = menuItem.filter(function (i) {
              return i.menuItem.propertyDisplayName == homePageLabel;
            });
            item = differentiatedMenuItem[0];
            item.key = key;
            this.headerTitle = item.topLevelMenu;
          } else {
            differentiatedMenuItem = menuItem.filter(function (i) {
              return i.menuItem.propertyDisplayName != homePageLabel;
            });
            item = differentiatedMenuItem[0];
            item.key = key;
            this.headerTitle = item.topLevelMenu;
          }
        } else if (menuItem.length == 1) {
          var item_1 = menuItem[0];
          item_1.key = key;
          this.headerTitle = item_1.topLevelMenu;
        }
      } else {
        // What' the frequency, Kenneth?
        menuItem = this.openedMenuItems.filter(function (i) {
          return i.key == key;
        });

        if (menuItem[0]) {
          var item_2 = menuItem[0];
          this.headerTitle = item_2.topLevelMenu;
        }
      }
    } else {
      this.headerTitle = " ";
    }

    this.isHomePageButtonClicked = false;
  };

  CommandService.prototype.buildMenu = function (commands, mItems) {
    var _this = this;

    var priority = 200;
    var items = mItems.menu;
    items.forEach(function (i) {
      // do not add to command bar if is home page
      if (!i.isHomePage) {
        var cmdName = i.propertyDisplayName;
        commands['commands'][cmdName] = _this.convertToCommands(i);
        commands['commandHandlers'][cmdName + 'Handler'] = {
          "id": cmdName,
          "action": cmdName,
          "activeWhen": {
            "condition": "conditions.true"
          },
          "visibleWhen": {
            "condition": "conditions.true"
          }
        };
        commands["commandPlacements"][cmdName] = {
          "id": cmdName,
          "uiAnchor": "aw_globalNavigationbar",
          "priority": priority
        };
        commands["_viewModelId"] = "'commandsViewModel_aw_globalNavigationbar'";
        priority++;

        _this.addAction(commands, cmdName);
      } else {
        // update title for home page          
        commands['commands']['momCmdGoToHomePage'].title = i.propertyDisplayName;

        var homePageLabel = _this.getHomePageLabelFromViewModel(i, items);

        if (homePageLabel) {
          i.uiValue = homePageLabel;
        }
      }
    });
  };

  CommandService.prototype.getHomePageLabelFromViewModel = function (homePageItem, menuItems) {
    var returnLabel;

    for (var i = 0; i < menuItems.length; ++i) {
      returnLabel = searchDescendants(menuItems[i]);

      if (returnLabel) {
        break;
      }
    }

    function searchDescendants(menuItem) {
      for (var i = 0; i < menuItem.children.length; i++) {
        var child = menuItem.children[i];

        if (child.dbValue == homePageItem.dbValue) {
          return child.uiValue;
        }

        searchDescendants(child);
      }
    }

    return returnLabel;
  };

  CommandService.prototype.convertToCommands = function (menuItem) {
    var cmd; // commands         

    var cmdIconName = menuItem.apolloIcon ? menuItem.apolloIcon.replace('cmd', '') : ''; // returns svg string (to use later possibly)

    var iconId = this.iconSvc.getCmdIcon(cmdIconName);

    if (!iconId) {
      menuItem.apolloIcon = 'cmdFocusOn';
    }

    cmd = {
      "iconId": menuItem.apolloIcon,
      "title": menuItem.propertyDisplayName
    };
    return cmd;
  };

  CommandService.prototype.addAction = function (curDeclModel, eventToAdd) {
    var actions = curDeclModel['actions'];
    var newAction = {
      "actionType": "JSFunction",
      "inputData": {
        "menu": eventToAdd
      },
      "method": "updateToplevelMenu",
      "events": {
        "success": [{
          "name": "topLevelCtxUpdated"
        }]
      },
      "deps": "js/cepPortalService"
    };
    actions[eventToAdd] = newAction;
    curDeclModel['actions'] = actions;
  };

  return CommandService;
}();

define(['app', 'js/iconService', 'js/cepLabelService', 'js/cepViewModelService'], function (app) {
  'use strict';

  app.factory('cepCommandService', ['iconService', 'cepLabelService', 'cepViewModelService', function (iconSvc, cepLabelSvc, cepViewModelSvc) {
    return new CommandService(iconSvc, cepLabelSvc, cepViewModelSvc);
  }]);
  return {
    moduleServiceNameToInject: 'cpmCommandService'
  };
});