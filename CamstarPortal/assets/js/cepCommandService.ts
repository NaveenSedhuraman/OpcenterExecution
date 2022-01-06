class CmdDefinition {
    "iconId": string;
    "title": string;
}

class MenuDef {
    "propertyDisplayName": string;
    "isHomePage": boolean;
}

class CommandService {
    headerTitle: string;
    lineAssignement: any;
    menuItems: any;
    translations: any;
    openedMenuItems: any[] = [];
    selectedTopMenu: string;
    isHomePageButtonClicked: boolean;

    constructor(
        private iconSvc: IIconService,
        private cepLabelSvc: ICepLabelService,
        private cepViewModelSvc: ICepViewModelService) {

    }

    getTopLevelMenuItems() {
        if (this.selectedTopMenu) {
            let selectedMenu = this.menuItems.menu.find(m => m.propertyDisplayName == this.selectedTopMenu);
            if (selectedMenu && selectedMenu.children) {
                return {
                    selectedMenu: this.selectedTopMenu,
                    menu: selectedMenu.children
                };
            }
            return {};
        }
        else {
            console.warn("No Items selected");
            return {};
        }
    }

    getMenuItem(name: string) {
        let item;
        const selectedItem = this.menuItems.menu.find(m => m.propertyDisplayName == this.selectedTopMenu);
        if (selectedItem.children && selectedItem.children.length) {
            selectedItem.children.forEach(c => {
                if (c.value == name) {
                    item = c;
                }
            });
        }
        else {
            item = selectedItem;
        }
        return item;
    }

    initializeMenu(menuItems: any) {
        if (!menuItems) {
            return false;
        }
        return this.cepViewModelSvc.getViewModel('commandsViewModel').then(commandsVM => {
            const commandViewModel = this.cepLabelSvc.getTranslatedViewModel('commands', commandsVM);
            return this.cepViewModelSvc.updateViewModel('commandsViewModel', commandViewModel).then(() => {
                // dynamic menus
                this.buildMenu(commandViewModel, menuItems);
                this.menuItems = menuItems;
                return true;
            });
        });
    }

    addToOpenedMenuItem(item: any) {
        const commandLabels = this.cepLabelSvc.getCommandLabels();

        if (item.isHomePage && item.propertyDisplayName == commandLabels.momCmdGoToHomePage) {
            this.isHomePageButtonClicked = true;
        }

        // add to openedMenuItems
        const selectedMenuItem = {
            topLevelMenu: this.selectedTopMenu,
            menuItem: item
        }
        if (typeof this.openedMenuItems === "undefined") {
            this.openedMenuItems = [selectedMenuItem];
        }
        else {
            const select = this.openedMenuItems.filter(i => i.menuItem.propertyDisplayName == item.propertyDisplayName);
            if (select.length == 0) {
                this.openedMenuItems = [...this.openedMenuItems, selectedMenuItem];
            }
        }
    }

    selectTopMenu(menu: any) {
        this.selectedTopMenu = menu;
        const selectedMenu = this.menuItems.menu.find(m => m.propertyDisplayName == menu);
        if (!selectedMenu || !selectedMenu.children || !selectedMenu.children.length) {
            return true;
        }
        return false;
    }

    setHeader(header: any, key: any) {
        if (key) {
            var menuItem;
            var differentiatedMenuItem;

            if (header) {
                menuItem = this.openedMenuItems.filter(i => i.menuItem.value == header);

                if(menuItem.length > 1) {
                    var item;
                    const commandLabels = this.cepLabelSvc.getCommandLabels();
                    var homePageLabel = commandLabels.momCmdGoToHomePage;
                    var differentiatedMenuItem;

                    if (this.isHomePageButtonClicked) {
                        differentiatedMenuItem = menuItem.filter(function (i) {
                            return i.menuItem.propertyDisplayName == homePageLabel;
                        });
          
                        item = differentiatedMenuItem[0];
                        item.key = key;
                        this.headerTitle = item.topLevelMenu;
                    }
                    else {
                        differentiatedMenuItem = menuItem.filter(function (i) {
                            return i.menuItem.propertyDisplayName != homePageLabel;
                        });
          
                        item = differentiatedMenuItem[0];
                        item.key = key;
                        this.headerTitle = item.topLevelMenu;
                    }
                }
                else if (menuItem.length == 1) {
                    let item = menuItem[0];
                    item.key = key;
                    this.headerTitle = item.topLevelMenu;
                }
            }
            else {
                // What' the frequency, Kenneth?
                menuItem = this.openedMenuItems.filter(i => i.key == key);
                if (menuItem[0]) {
                    let item = menuItem[0];
                    this.headerTitle = item.topLevelMenu;
                }
            }
        }
        else {
            this.headerTitle = " ";
        }
        this.isHomePageButtonClicked = false;
    }

    private buildMenu(commands: any, mItems: any) {
        let priority = 200;
        let items = mItems.menu;
        items.forEach(i => {
            // do not add to command bar if is home page
            if (!i.isHomePage) {
                let cmdName = i.propertyDisplayName;
                commands['commands'][cmdName] = this.convertToCommands(i);
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
                this.addAction(commands, cmdName);
            }
            else { // update title for home page          
                commands['commands']['momCmdGoToHomePage'].title = i.propertyDisplayName;
                var homePageLabel = this.getHomePageLabelFromViewModel(i, items);
                if (homePageLabel) {
                    i.uiValue = homePageLabel;
                    
                }
        
            }
        });
    }

    private getHomePageLabelFromViewModel(homePageItem: any, menuItems: any) {
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
    }

    private convertToCommands(menuItem: any): CmdDefinition {
        let cmd: CmdDefinition;
        // commands         
        const cmdIconName = menuItem.apolloIcon ? menuItem.apolloIcon.replace('cmd', '') : '';
        // returns svg string (to use later possibly)
        let iconId = this.iconSvc.getCmdIcon(cmdIconName);
        if (!iconId) {
            menuItem.apolloIcon = 'cmdFocusOn';
        }
        cmd = {
            "iconId": menuItem.apolloIcon,
            "title": menuItem.propertyDisplayName
        };
        return cmd;
    }

    private addAction(curDeclModel: any, eventToAdd: string) {
        let actions: any[] = curDeclModel['actions'];
        let newAction = {
            "actionType": "JSFunction",
            "inputData": {
                "menu": eventToAdd
            },
            "method": "updateToplevelMenu",
            "events": {
                "success": [
                    {
                        "name": "topLevelCtxUpdated"
                    }
                ]
            },
            "deps": "js/cepPortalService"
        };
        actions[eventToAdd] = newAction;
        curDeclModel['actions'] = actions;
    }
}

define(['app', 'js/iconService', 'js/cepLabelService', 'js/cepViewModelService'], function (app) {
    'use strict';
    app.factory('cepCommandService', ['iconService', 'cepLabelService', 'cepViewModelService', (iconSvc, cepLabelSvc, cepViewModelSvc) => new CommandService(iconSvc, cepLabelSvc, cepViewModelSvc)]);
    return {
        moduleServiceNameToInject: 'cpmCommandService'
    };
});