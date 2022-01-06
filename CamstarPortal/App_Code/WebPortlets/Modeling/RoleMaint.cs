// Copyright Siemens 2019  
using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Reflection;
using System.Web;
using Camstar.WCF.ObjectStack;
using Camstar.WebPortal.FormsFramework;
using Camstar.WebPortal.FormsFramework.WebGridControls;
using Camstar.WebPortal.Personalization;
using Camstar.WebPortal.Utilities;
using Camstar.WebPortal.PortalFramework;

/// <summary>
/// Summary description for RoleMaint
/// </summary>

namespace Camstar.WebPortal.WebPortlets.Modeling
{
    public class RoleMaintenance : MatrixWebPart
    {
        protected override void OnLoad(EventArgs e)
        {
            base.OnLoad(e);

            PermissionTypeFilter.DataChanged += PermissionTypeFilter_DataChanged;
            AddPermissionButton.Click += AddPermissionButton_Click;
            RemovePermissionButton.Click += RemovePermissionButton_Click;
        }

        protected override void OnPreRender(EventArgs e)
        {
            //singe page - to be similar to IWA & to avoid potential
            //problems with passing data between grids with paging
            AssignedPermissionsGrid.GridContext.RowsPerPage = AssignedPermissionsGrid.TotalRowCount;
            AvailablePermissionsGrid.GridContext.RowsPerPage = AvailablePermissionsGrid.TotalRowCount;
            base.OnPreRender(e);
        }
        protected virtual void RemovePermissionButton_Click(object sender, EventArgs e)
        {
            var selectedPermissions = AssignedPermissionsGrid.GridContext.GetSelectedItems(true);
            if (selectedPermissions == null)
                return;
            var permissionCode = (Page.Session["RoleMaintPermissionTypes"] as DataTable).Rows.OfType<DataRow>().First(r =>
                r["Description"].Equals(PermissionTypeFilter.TextEditControl.Text));
            var permissionType = int.Parse(permissionCode.Field<string>("Value"));
            var assignedPermissions = (AssignedPermissionsGrid.Data as object[]).ToList();
            var allRecordsAssign = AssignedPermissionsGrid.GridContext.DataWindow.Rows;

            var availablePermissions = (AvailablePermissionsGrid.Data as AvailablePermissionsGridRow[]).ToList();
            var storedPermissions = Page.Session["RoleMaintPermissions"] as List<AssignedPermissionsGridRow>;
            foreach (AssignedPermissionsGridRow row in selectedPermissions)
            {
                for (int i = 0; i < allRecordsAssign.Count; i++)
                {
                    string DisplayName = allRecordsAssign[i].ItemArray[4].ToString();
                    if(permissionType == 210)
                        DisplayName = allRecordsAssign[i].ItemArray[5].ToString();
                    string Id = allRecordsAssign[i].ItemArray[3].ToString();
                    if (permissionType == 200)
                        Id = allRecordsAssign[i].ItemArray[5].ToString();
                    if (row.StoredPermissionChanges.ObjectMetaId != null)
                    {
                        if (Id == row.StoredPermissionChanges.ObjectMetaId.Value.ToString())
                        {
                            var newAvailablePermission = new AvailablePermissionsGridRow()
                                {
                                    EntityID = row.StoredPermissionChanges.ObjectMetaId.Value.ToString(),
                                    EntityDisplayName = DisplayName,
                                    EntityName = row.Name.Value
                                };
                            assignedPermissions.Remove(row);
                            availablePermissions.Add(newAvailablePermission);
                            var storedRow = storedPermissions.Find(r => r.Name.Equals(row.Name));
                            if (storedRow.IsAdded)
                                storedPermissions.Remove(row);
                            else
                                storedRow.IsRemoved = true;
                        }
                    }
                    else if (Id == row.StoredPermissionChanges.Name.Value.ToString())
                    {
                        var newAvailablePermission = new AvailablePermissionsGridRow()
                                {
                                    EntityID = row.StoredPermissionChanges.ObjectInstanceIdString.Value,
                                    EntityDisplayName = row.Name.Value,
                                    EntityName = row.Name.Value
                                };
                        assignedPermissions.Remove(row);
                        availablePermissions.Add(newAvailablePermission);
                        var storedRow = storedPermissions.Find(r => r.Name.Equals(row.Name));
                        if (storedRow.IsAdded)
                            storedPermissions.Remove(row);
                        else
                            storedRow.IsRemoved = true;
                    }
                }
            }
            Page.Session["RoleMaintPermissions"] = storedPermissions;
            AssignedPermissionsGrid.Data = assignedPermissions.ToArray();
            AvailablePermissionsGrid.Data = availablePermissions.ToArray();

        }

        protected virtual void AddPermissionButton_Click(object sender, EventArgs e)
        {
            if (AssignedPermissionsGrid.Data == null || AvailablePermissionsGrid.Data == null)
                return;
            var permissionCode = (Page.Session["RoleMaintPermissionTypes"] as DataTable).Rows.OfType<DataRow>().First(r =>
                r["Description"].Equals(PermissionTypeFilter.TextEditControl.Text));
            var permissionType = int.Parse(permissionCode.Field<string>("Value"));
            var selectedPermissions = AvailablePermissionsGrid.GridContext.GetSelectedItems(false);
            if (selectedPermissions == null)
                return;
            var assignedPermissions = (AssignedPermissionsGrid.Data as object[]).ToList();
            var availablePermissions = (AvailablePermissionsGrid.Data as AvailablePermissionsGridRow[]).ToList();
            var newAssignedPermissions = new List<AssignedPermissionsGridRow>();
            var storedPermissions = Page.Session["RoleMaintPermissions"] as List<AssignedPermissionsGridRow>;
            foreach (AvailablePermissionsGridRow row in selectedPermissions)
            {
                var permissionRow = assignedPermissions.OfType<AssignedPermissionsGridRow>().FirstOrDefault(p =>
                    {
                        if (p.Name.Value.Equals(row.EntityName))
                            return true;
                        if (p.ObjectInstanceId != null && p.ObjectInstanceId.ID.Equals(row.EntityID.ToString()))
                            return true;
                        if (p.ObjectMetaId != null && p.ObjectMetaId.Value.Equals(row.EntityID))
                            return true;
                        return false;
                    });
                if (permissionRow == null)
                {
                    var modesList = new List<Primitive<int>>();
                    var newRolePermissionChanges = new RolePermissionChanges()
                        {
                            PermissionType = new Enumeration<PermissionTypeEnum, int>(permissionType),
                            Name = row.EntityName,
                            DisplayName = row.EntityDisplayName,
                        };
                    if (permissionType == 200)
                        newRolePermissionChanges.ObjectInstanceIdString = row.EntityID;
                    else
                        newRolePermissionChanges.ObjectMetaId = int.Parse(row.EntityID);
                    var newAssignedPermissionGridRow = new AssignedPermissionsGridRow(newRolePermissionChanges);
                    foreach (var column in AssignedPermissionsGrid.Settings.Columns.OfType<JQFieldCheckBox>())
                    {
                        var mode = (Page.Session["RoleMaintPermissionModes"] as DataTable).Rows.OfType<DataRow>().FirstOrDefault(r => r["PermissionType"].Equals(permissionCode.Field<string>("Value")) && r["Name"].Equals(column.BindPath));
                        if (mode == null)
                            continue;
                        var propInfo = newAssignedPermissionGridRow.GetType().GetProperties().First(info => info.Name.Equals(column.BindPath));
                        propInfo.SetValue(newAssignedPermissionGridRow, new Primitive<bool>(true), null);
                        modesList.Add(new Primitive<int>(int.Parse((string)mode["Value"])));
                    }
                    //populates modes values for submit Txn
                    newAssignedPermissionGridRow.StoredPermissionChanges.Modes = modesList.ToArray();
                    var storedRow = storedPermissions.FirstOrDefault(r => r.Name.Equals(newRolePermissionChanges.Name));
                    if (storedRow != null && storedRow.IsRemoved)
                        storedRow.IsAdded = storedRow.IsRemoved = false;
                    else
                    {
                        newAssignedPermissionGridRow.IsRemoved = false;
                        newAssignedPermissionGridRow.IsAdded = true;
                        newAssignedPermissions.Add(newAssignedPermissionGridRow);
                    }
                    assignedPermissions.Add(newAssignedPermissionGridRow);
                    availablePermissions.Remove(row);
                }
            }
            var newStoredPermissions = storedPermissions.Concat(newAssignedPermissions).ToList();
            Page.Session["RoleMaintPermissions"] = newStoredPermissions;
            AssignedPermissionsGrid.Data = assignedPermissions.ToArray();
            AvailablePermissionsGrid.Data = availablePermissions.ToArray();
            //temp solution, to avoid clearing selected rows references, but clean selection
            AvailablePermissionsGrid.GridContext.GetSelectedItems(true);
        }
        protected virtual void PermissionTypeFilter_DataChanged(object sender, EventArgs e)
        {
            if ((sender as FormsFramework.WebControls.DropDownList).TextEditControl.Text != "")
            {
                var permissionCode = (Page.Session["RoleMaintPermissionTypes"] as DataTable).Rows.OfType<DataRow>().First(r =>
                    r["Description"].Equals((sender as FormsFramework.WebControls.DropDownList).TextEditControl.Text));
                var permissionType = int.Parse(permissionCode.Field<string>("Value"));
                PermissionTypeCode.TextControl.Text = permissionType.ToString();
                TogglePermissionRows(permissionType);

                var data = new WCF.ObjectStack.RoleMaint() { ObjectChanges = new RoleChanges() { PermissionType = new Enumeration<PermissionTypeEnum, int>(permissionType) } };
                var info = new RoleMaint_Info() { ObjectChanges = new RoleChanges_Info() { FilteredPermissions = new RolePermissionChanges_Info() { RequestSelectionValues = true, RequestValue = true } } };
                var request = new WCF.Services.RoleMaint_Request() { Info = info };
                var service = new WCF.Services.RoleMaintService(FormsFramework.Utilities.FrameworkManagerUtil.GetFrameworkSession().CurrentUserProfile);
                WCF.Services.RoleMaint_Result result;
                var rs = service.GetEnvironment(data, request, out result);
                if (!rs.IsSuccess)
                {
                    Page.DisplayMessage(rs);
                    return;
                }
                var assignedPermissions = AssignedPermissionsGrid.Data as AssignedPermissionsGridRow[];
                var newAvailablePermissions = new List<AvailablePermissionsGridRow>();
                var availablePermissions = (result.Environment as RoleMaint_Environment).ObjectChanges.FilteredPermissions.SelectionValues;
                if (availablePermissions.Rows != null)
                {
                    for (int i = 0; i < availablePermissions.Rows.Length; i++)
                    {
                        if (assignedPermissions.FirstOrDefault(p =>
                        {
                            if (p.Name.Value.Equals(availablePermissions.Rows[i].Values[1]))//EntityName
                                return true;
                            if (p.ObjectInstanceId != null && p.ObjectInstanceId.ID.Equals(availablePermissions.Rows[i].Values[0]))//EntityID
                                return true;
                            if (availablePermissions.Headers[0].TypeCode == TypeCode.String &&
                                p.StoredPermissionChanges.Self.ID.Equals(availablePermissions.Rows[i].Values[0]))
                                return true;
                            if (availablePermissions.Headers[0].TypeCode == TypeCode.Int32 && p.ObjectMetaId != null && p.ObjectMetaId.Value.Equals(int.Parse(availablePermissions.Rows[i].Values[0])))
                                return true;
                            return false;
                        }) == null)
                        {
                            newAvailablePermissions.Add(new AvailablePermissionsGridRow()
                                {
                                    EntityID = availablePermissions.Rows[i].Values[0],
                                    EntityName = availablePermissions.Rows[i].Values[1], //Name
                                    EntityDisplayName = availablePermissions.Rows[i].Values[2]
                                });
                        }
                    }
                }
                AvailablePermissionsGrid.Data = newAvailablePermissions.ToArray();
                Page.Session["RoleMaintAvailablePermissions"] = availablePermissions;
            }
        }
        //Pass permission code, when using AvailablePermissionsGrid paging
        public override void GetSelectionData(Service serviceData)
        {
            var data = serviceData as WCF.ObjectStack.RoleMaint;
            if (data != null)
            {
                var permissionCode = PermissionTypeCode.TextControl.Text;
                if (!string.IsNullOrEmpty(permissionCode) && serviceData.IsEmpty)
                {
                    if (data.ObjectChanges == null)
                        data.ObjectChanges = new RoleChanges();
                    
                    (data.ObjectChanges as RoleChanges).PermissionType = new Enumeration<PermissionTypeEnum, int>(int.Parse(permissionCode));
                }
            }
            base.GetSelectionData(serviceData);
        }

        public override void RequestValues(Info serviceInfo, Service serviceData)
        {
            base.RequestValues(serviceInfo, serviceData);
            var info = (RoleMaint_Info)serviceInfo;
            if (info.ObjectChanges != null && info.ObjectChanges.Permissions == null)
                info.ObjectChanges.Permissions = new RolePermissionChanges_Info() { Modes = FieldInfoUtil.RequestValue() };

        }

        public override void DisplayValues(Service serviceData)
        {
            base.DisplayValues(serviceData);
            PermissionTypeFilter.TextEditControl.Text = "";
            CamstarWebControl.SetRenderToClient(PermissionTypeFilter);
            Page.Session["RoleMaintPermissions"] = new List<AssignedPermissionsGridRow>();
            AssignedPermissionsGrid.Data = new List<AssignedPermissionsGridRow>().ToArray();

            //if ((Page.PortalContext as MaintenanceBehaviorContext).State == MaintenanceBehaviorContext.MaintenanceState.New)
            //    return;

            var roleChanges = (serviceData as Camstar.WCF.ObjectStack.RoleMaint).ObjectChanges;
            if (roleChanges == null || roleChanges.Permissions == null)
                return;
            var gridRows = new List<AssignedPermissionsGridRow>(roleChanges.Permissions.Length);
            for (int i = 0; i < roleChanges.Permissions.Length; i++)
                gridRows.Add(new AssignedPermissionsGridRow(roleChanges.Permissions[i]));
            Page.Session["RoleMaintPermissions"] = gridRows;
            AssignedPermissionsGrid.Data = gridRows.ToArray();
            foreach (var permission in roleChanges.Permissions)
            {
                var row = (AssignedPermissionsGrid.Data as AssignedPermissionsGridRow[]).FirstOrDefault(r => r.Name.Value.Equals(permission.Name.Value)
                    && r.PermissionType.Equals(permission.PermissionType.Value));
                if (permission.Modes == null || row == null)
                    continue;
                foreach (var mode in permission.Modes)
                {
                    if (Page.Session["RoleMaintPermissionModes"] == null)
                        continue;
                    var modes = (Page.Session["RoleMaintPermissionModes"] as DataTable).Rows.OfType<DataRow>().First(r => int.Parse(r.Field<string>("PermissionType")).Equals(row.PermissionType) && r["Value"].Equals(mode.Value.ToString()));
                    var propInfo = row.GetType().GetProperties().First(info => info.Name.Equals(modes["Name"]));
                    propInfo.SetValue(row, new Primitive<bool>(true), null);
                }
            }
            PermissionTypeFilter.TextEditControl.Text = "";
            AvailablePermissionsGrid.ClearData();
            TogglePermissionRows(0);
        }

        public override void DisplaySelectionValues(WCF.ObjectStack.Environment environment)
        {
            base.DisplaySelectionValues(environment);
            if (environment is RoleMaint_Environment)
            {
                if ((environment as RoleMaint_Environment).ObjectChanges.Permissions == null || (environment as RoleMaint_Environment).ObjectChanges.PermissionType == null)
                    return;
                var modes = (environment as RoleMaint_Environment).ObjectChanges.Permissions.Modes.SelectionValues.GetAsDataTable();
                var permissionTypes = (environment as RoleMaint_Environment).ObjectChanges.PermissionType.SelectionValues.GetAsDataTable();
                if (modes == null)
                    return;
                Page.Session["RoleMaintPermissionModes"] = modes;
                Page.Session["RoleMaintPermissionTypes"] = permissionTypes;    
            }
            
            
        }
        //Iterate through stored permissions and processes added/removed permissions and modified permission modes'
        //by comparing them with initial permissions, retrieved in DisplayValues().
        //Adds them to submit Txn, in case permissions are marked as added/removed or modes are changed.
        public override void GetInputData(Service serviceData)
        {
            base.GetInputData(serviceData);
            var newRolePermissionChanges = new List<RolePermissionChanges>();
            var storedPermissions = (Page.Session["RoleMaintPermissions"] as List<AssignedPermissionsGridRow>);
            var storedModes = (Page.Session["RoleMaintPermissionModes"] as DataTable);
            var permissionCode = (Page.Session["RoleMaintPermissionTypes"] as DataTable).Rows.OfType<DataRow>().FirstOrDefault(r =>
                    r["Description"].Equals(PermissionTypeFilter.TextEditControl.Text));
            if (permissionCode != null)
            {
                var type = permissionCode.Field<string>("Value");
                //descending order of modified items indexes in "request" XML is required by BL side
                for (int i = storedPermissions.Count - 1; i >= 0; i--)
                {
                    //removed permissions
                    if (storedPermissions[i].IsRemoved)
                    {
                        var permissionToDelete = new RolePermissionChanges() { ListItemIndex = i, ListItemAction = ListItemAction.Delete };
                        newRolePermissionChanges.Add(permissionToDelete);
                        continue;
                    }
                   
                    var modifiedModes = new List<Primitive<int>>();
                    //added permissions
                    var permissionToAdd = new RolePermissionChanges();
                    if (storedPermissions[i].IsAdded)
                    {
                        var modes = storedPermissions[i].StoredPermissionChanges.Modes;
                        var addmodes = modes.ToList();
                       
                        foreach (var propInfo in storedPermissions[i].GetType().GetProperties().Where(pi => pi.PropertyType.Equals(typeof(Primitive<bool>))))
                        {
                            foreach (var correspondentMode in storedModes.Rows.OfType<DataRow>().Where(row => row["PermissionType"].Equals(type)))
                            {
                                if (propInfo.Name == correspondentMode.Field<string>("Name"))
                                {
                                   var modeValue = int.Parse(correspondentMode.Field<string>("Value"));
                                    var permissionType = int.Parse(correspondentMode.Field<string>("PermissionType"));
                                    var propertyValue = (propInfo.GetValue(storedPermissions[i], null) as Primitive<bool>);
                                    var containsMode = storedPermissions[i].StoredPermissionChanges.Modes != null
                                        && storedPermissions[i].StoredPermissionChanges.Modes.Any(m => m.Value == modeValue);
                                   
                                     if (permissionType.Equals(storedPermissions[i].PermissionType) && propertyValue != null && !propertyValue.Value && (storedPermissions[i].StoredPermissionChanges.Modes == null || containsMode))
                                    {
                                        storedPermissions[i].StoredPermissionChanges.ListItemAction = ListItemAction.Add;
                                        var index = Array.FindIndex(storedPermissions[i].StoredPermissionChanges.Modes, primitive => primitive.Value.Equals(modeValue));
                                        addmodes.Remove(index+1);
                                        permissionToAdd.Name = storedPermissions[i].StoredPermissionChanges.Name;
                                        permissionToAdd.Modes = addmodes.ToArray();
                                        permissionToAdd.PermissionType = storedPermissions[i].StoredPermissionChanges.PermissionType;
                                        permissionToAdd.ListItemAction = ListItemAction.Add;
                                      
                                    }
                                     else
                                     {
                                        permissionToAdd.Name = storedPermissions[i].StoredPermissionChanges.Name;
                                        permissionToAdd.Modes = addmodes.ToArray();
                                        permissionToAdd.PermissionType = storedPermissions[i].StoredPermissionChanges.PermissionType;
                                        permissionToAdd.ListItemAction = ListItemAction.Add;
                                     }
                                     
                                }
                            }
                        }
                    
                        
                        if (storedPermissions[i].StoredPermissionChanges.ObjectMetaId != null)
                            permissionToAdd.ObjectMetaId = storedPermissions[i].StoredPermissionChanges.ObjectMetaId;
                        if (storedPermissions[i].StoredPermissionChanges.ObjectInstanceId != null)
                            permissionToAdd.ObjectInstanceId = storedPermissions[i].StoredPermissionChanges.ObjectInstanceId;
                        if (storedPermissions[i].StoredPermissionChanges.ObjectInstanceIdString != null)
                            permissionToAdd.ObjectInstanceIdString = storedPermissions[i].StoredPermissionChanges.ObjectInstanceIdString;
                        newRolePermissionChanges.Add(permissionToAdd);
                        continue;
                    }
                    bool wasModified = false;
                    foreach (var propInfo in storedPermissions[i].GetType().GetProperties().Where(pi => pi.PropertyType.Equals(typeof(Primitive<bool>))))
                    {
                      foreach (var correspondentMode in storedModes.Rows.OfType<DataRow>().Where(row => row["PermissionType"].Equals(type)))
                        {
                           if (propInfo.Name == correspondentMode.Field<string>("Name"))
                            {
                                var modeValue = int.Parse(correspondentMode.Field<string>("Value"));
                                var permissionType = int.Parse(correspondentMode.Field<string>("PermissionType"));
                                var propertyValue = (propInfo.GetValue(storedPermissions[i], null) as Primitive<bool>);
                                var containsMode =storedPermissions[i].StoredPermissionChanges.Modes != null
                                    && storedPermissions[i].StoredPermissionChanges.Modes.Any(m => m.Value == modeValue);
                                //added/checked permission mode (addition is made by value)
                                if (permissionType.Equals(storedPermissions[i].PermissionType) && propertyValue != null && propertyValue.Value && (storedPermissions[i].StoredPermissionChanges.Modes == null || !containsMode))
                                {
                                    storedPermissions[i].StoredPermissionChanges.ListItemAction = ListItemAction.Change;
                                    modifiedModes.Add(new Primitive<int>(modeValue) { ListItemAction = ListItemAction.Add });
                                    wasModified = true;
                                }
                                    //deleted/unchecked permission mode (deletion is made by index/position in descending order)
                                else if (permissionType.Equals(storedPermissions[i].PermissionType) && propertyValue != null && !propertyValue.Value && (storedPermissions[i].StoredPermissionChanges.Modes == null || containsMode))
                                {
                                    storedPermissions[i].StoredPermissionChanges.ListItemAction = ListItemAction.Change;
                                    var index = Array.FindIndex(storedPermissions[i].StoredPermissionChanges.Modes, primitive => primitive.Value.Equals(modeValue));
                                    modifiedModes.Add(new Primitive<int>() { ListItemAction = ListItemAction.Delete, ListItemIndex = index });
                                    wasModified = true;
                                }
                            }
                        }
                }
                    if (!wasModified)
                        continue;
                    //descending order of modified items indexes in "request" XML is required by BL side
                    var sortedModifiedModes = modifiedModes.OrderByDescending(m => m.ListItemIndex);
                    if (storedPermissions[i].StoredPermissionChanges.Modes == null)
                        storedPermissions[i].StoredPermissionChanges.Modes = new Primitive<int>[sortedModifiedModes.Count()];
                    storedPermissions[i].StoredPermissionChanges.Modes = sortedModifiedModes.ToArray();
                    storedPermissions[i].StoredPermissionChanges.ListItemIndex = i;
                    storedPermissions[i].StoredPermissionChanges.Self = null;
                    (storedPermissions[i].StoredPermissionChanges as NamedSubentityChanges).IsFrozen = null;
                    newRolePermissionChanges.Add(storedPermissions[i].StoredPermissionChanges);
                }
            }
            if (newRolePermissionChanges.Count == 0)
                return;
            (serviceData as WCF.ObjectStack.RoleMaint).ObjectChanges.Permissions = newRolePermissionChanges.ToArray();
        }
        //Populate grid with data according to selected PermissionType value
        protected virtual void TogglePermissionRows(int permissionType)
        {
            var rows = Page.Session["RoleMaintPermissions"] as List<AssignedPermissionsGridRow>;
            AssignedPermissionsGrid.Data = rows.Where(r => r.PermissionType.Equals(permissionType)).ToArray();
            FormsFramework.CamstarWebControl.SetRenderToClient(AssignedPermissionsGrid);
        }
        #region Properties
        protected virtual JQDataGrid AssignedPermissionsGrid
        {
            get { return Page.FindCamstarControl("AssignedPermissionsGrid") as JQDataGrid; }
        }
        protected virtual JQDataGrid AvailablePermissionsGrid
        {
            get { return Page.FindCamstarControl("AvailablePermissionsGrid") as JQDataGrid; }
        }
        protected virtual FormsFramework.WebControls.DropDownList PermissionTypeFilter
        {
            get { return Page.FindCamstarControl("PermissionTypeFilter") as FormsFramework.WebControls.DropDownList; }
        }
        protected virtual FormsFramework.WebControls.DropDownList PermissionModesRequestTrigger
        {
            get { return Page.FindCamstarControl("PermissionModesRequestTrigger") as FormsFramework.WebControls.DropDownList; }
        }
        protected virtual FormsFramework.WebControls.Button AddPermissionButton
        {
            get { return Page.FindCamstarControl("AddPermissionButton") as FormsFramework.WebControls.Button; }
        }
        protected virtual FormsFramework.WebControls.Button AddAllPermissionsButton
        {
            get { return Page.FindCamstarControl("AddAllPermissionsButton") as FormsFramework.WebControls.Button; }
        }
        protected virtual FormsFramework.WebControls.Button RemovePermissionButton
        {
            get { return Page.FindCamstarControl("RemovePermissionButton") as FormsFramework.WebControls.Button; }
        }
        protected virtual FormsFramework.WebControls.Button RemoveAllPermissionsButton
        {
            get { return Page.FindCamstarControl("RemoveAllPermissionsButton") as FormsFramework.WebControls.Button; }
        }
        protected virtual FormsFramework.WebControls.TextBox PermissionTypeCode
        {
            get { return Page.FindCamstarControl("PermissionTypeCode") as FormsFramework.WebControls.TextBox; }
        }
        #endregion
    }

    class AssignedPermissionsGridRow
    {
        public AssignedPermissionsGridRow(RolePermissionChanges rolePermissionChanges)
        {
            PermissionType = rolePermissionChanges.PermissionType.Value;
            Name = rolePermissionChanges.Name;
            DisplayName = rolePermissionChanges.DisplayName;
            ObjectInstanceId = rolePermissionChanges.ObjectInstanceId;
            ObjectMetaId = rolePermissionChanges.ObjectMetaId;
            _rolePermissionChanges = rolePermissionChanges;
            IsAdded = IsRemoved = false;
        }
        #region RoleChanges properties
        public virtual int PermissionType { get; set; }
        public virtual Primitive<string> Name { get; set; }
        public virtual Primitive<string> DisplayName { get; set; }
        public virtual BaseObjectRef ObjectInstanceId { get; set; }
        public virtual Primitive<int> ObjectMetaId { get; set; }
        public virtual bool IsAdded { get; set; }
        public virtual bool IsRemoved { get; set; }
        public virtual RolePermissionChanges StoredPermissionChanges
        {
            get { return _rolePermissionChanges; }
        }
        #endregion
        #region PermissionModes
        public virtual Primitive<bool> Perform { get; set; }
        public virtual Primitive<bool> Create { get; set; }
        public virtual Primitive<bool> Read { get; set; }
        public virtual Primitive<bool> Update { get; set; }
        public virtual Primitive<bool> Delete { get; set; }
        public virtual Primitive<bool> Lock { get; set; }
        public virtual Primitive<bool> Unlock { get; set; }
        public virtual Primitive<bool> DispatchOverride { get; set; }
        public virtual Primitive<bool> Invoke { get; set; }
        public virtual Primitive<bool> DownloadExport { get; set; }
        public virtual Primitive<bool> UploadImport { get; set; }
        public virtual Primitive<bool> StopProcess { get; set; }
        public virtual Primitive<bool> ResumeProcess { get; set; }
        public virtual Primitive<bool> RestartProcess { get; set; }
        public virtual Primitive<bool> Grant { get; set; }
        public virtual Primitive<bool> Revoke { get; set; }
        public virtual Primitive<bool> AllowLogin { get; set; }
        public virtual Primitive<bool> Browse { get; set; }
        public virtual Primitive<bool> AllowAccess { get; set; }
        #endregion

        private RolePermissionChanges _rolePermissionChanges;
    }
    class AvailablePermissionsGridRow
    {
        public virtual string EntityID { get; set; }
        public virtual string EntityName { get; set; }
        public virtual string EntityDisplayName { get; set; }
    }
}
