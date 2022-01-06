// Copyright Siemens 2020
using System;
using System.Linq;
using Camstar.WCF.ObjectStack;
using Camstar.WCF.Services;
using Camstar.WebPortal.PortalFramework;
using Camstar.WebPortal.FormsFramework;
using Camstar.WebPortal.FormsFramework.WebGridControls;
using Camstar.WebPortal.FormsFramework.Utilities;
using Camstar.WebPortal.FormsFramework.WebControls;
using Camstar.WebPortal.Personalization;
using System.Collections.Generic;

namespace Camstar.WebPortal.WebPortlets.Modeling
{
    public class UserQuery : MatrixWebPart
    {
        protected virtual JQDataGrid UserQueryParamsGrid { get { return Page.FindCamstarControl("UserQueryParams") as JQDataGrid; } }
        protected virtual JQDataGrid InstanceGrid { get { return Page.FindCamstarControl("InstanceGrid") as JQDataGrid; } }
        protected virtual TextBox QueryText { get { return Page.FindCamstarControl("QueryText") as TextBox; } }


        protected virtual Button SaveAndTest
        {
            get { return Page.FindCamstarControl("SaveAndTest") as Button; }
        }

        protected override void OnLoad(EventArgs e)
        {
            base.OnLoad(e);
            SaveAndTest.Click += SaveAndTest_Click;
        }

        protected virtual void SaveAndTest_Click(object sender, EventArgs e)
        {
            Page.DataContract.SetValueByName("QueryTxt", QueryText.Data);
            OpenTestUserQueryPage();
        }

        public virtual void OpenTestUserQueryPage()
        {
            QueryParameters queryParams = null;
            Dictionary<string, int?> ParameterDataTypeMap = new Dictionary<string, int?>();
            UserQueryParameterChanges[] parameterChanges = UserQueryParamsGrid.Data as UserQueryParameterChanges[];


            if (UserQueryParamsGrid.Data != null)
            {
                queryParams = new QueryParameters(); //int[] numbers = new int[5];

                QueryParameter[] qp = new QueryParameter[parameterChanges.Count()];
                for (int i = 0; i < parameterChanges.Count(); i++)
                {
                    qp[i] = new QueryParameter(parameterChanges[i].Name.ToString(), null);
                    ParameterDataTypeMap.Add(parameterChanges[i].Name.Value, parameterChanges[i].DataType == null ? (int?)null : parameterChanges[i].DataType.Value);
                }
                queryParams.Parameters = qp;
            }

            Page.DataContract.SetValueByName("ParameterTypeMap", ParameterDataTypeMap);

            ResultStatus res = AddOrUpdate();

            if (res.IsSuccess)
            {
                (Page.PortalContext as MaintenanceBehaviorContext).ReloadInstanceList = true;
                RefreshInstanceList();
                OpenTestUserQueryPage((Page.FindCamstarControl("NameTxt") as TextBox).Data.ToString(), queryParams);
            }
            else
            {
                DisplayMessage(res);
                return;
            }

        }

        protected virtual ResultStatus AddOrUpdate()
        {
            //Perform value validation
            UserQueryMaint inputForExecute = new UserQueryMaint();
            Page.GetInputData(inputForExecute);

            ResultStatus resultStatus = (this.Page as CamstarForm).ValidateInputData(inputForExecute);
            if (!resultStatus.IsSuccess)
                return resultStatus;

            FrameworkSession session = FrameworkManagerUtil.GetFrameworkSession(Page.Session);
            UserQueryMaintService service = Page.Service.GetService<Camstar.WCF.Services.UserQueryMaintService>();
            service.BeginTransaction();
            var pc = Page.PortalContext as MaintenanceBehaviorContext;
            Page.DataContract.SetValueByName("IsNewDM", false);
            if (pc.State != MaintenanceBehaviorContext.MaintenanceState.Edit && !(Page.DataContract.GetValueByName("IsNewDM") == null ? false : (bool)Page.DataContract.GetValueByName("IsNewDM")))
            {
                service.New(); //add new cdo
                Page.DataContract.SetValueByName("IsNewDM", true);
            }
            else
            {
                UserQueryMaint input = new UserQueryMaint() { ObjectToChange = new NamedObjectRef() { Name = (Page.FindCamstarControl("NameTxt") as TextBox).Data.ToString() } };
                service.Load(input);
                Page.DataContract.SetValueByName("IsNewDM", false);
            }

            service.ExecuteTransaction(inputForExecute);
            resultStatus = service.CommitTransaction();

            if (!resultStatus.IsSuccess)
            {
                Page.DataContract.SetValueByName("IsNewDM", false);
            }
            else
            {
                if (pc.Current == null)
                    pc.Current = new NamedObjectRef()
                    {
                        Name = (Page.FindCamstarControl("NameTxt") as TextBox).Data.ToString()
                    };
                Page.LoadModelingValues(true);
            }
            return resultStatus;
        }

        public virtual void RefreshInstanceList()
        {
            var service = new UserQueryMaintService(FrameworkManagerUtil.GetFrameworkSession().CurrentUserProfile);
            var data = new UserQueryMaint();
            var request = new UserQueryMaint_Request()
            {
                Info = new UserQueryMaint_Info()
                {
                    ObjectToChange = new Info { RequestSelectionValues = true }
                }
            };

            UserQueryMaint_Result result = null;
            ResultStatus rs = service.GetEnvironment(data, request, out result);
            var pc = Page.PortalContext as MaintenanceBehaviorContext;
            if (rs.IsSuccess)
            {
                var result1 = result.Environment.ObjectToChange.SelectionValues;
                InstanceGrid.Data = null;
                InstanceGrid.Data = result1;
            }
        }

        protected virtual void OpenTestUserQueryPage(string queryName, QueryParameters queryParams)
        {
            FloatPageOpenAction floatAction = new FloatPageOpenAction();
            floatAction.FrameLocation = new UIFloatingPageLocation();
            floatAction.PageName = "UserQueryTestPopup_VP";
            floatAction.FrameLocation.Width = 700;
            floatAction.FrameLocation.Height = 520;
            floatAction.EndResponse = false;
            var label = FrameworkManagerUtil.GetLabelCache().GetLabelByName("Lbl_UserQueryTest");

            ActionDispatcher dispatcher = Page.ActionDispatcher;
            dispatcher.DataContract.SetValueByName("UserQueryParamsDM", queryParams);
            dispatcher.DataContract.SetValueByName("UserQueryNameDM", queryName);
            dispatcher.DataContract.SetValueByName("label", label?.DefaultValue);
            Page.MergedContent.DynamicWebParts.SingleOrDefault(item => item.Name == "MDL_Specific").DataContract.SetValueByName("UserQueryParamsDM", queryParams);
            dispatcher.ExecuteAction(floatAction);
        }

        private const string isNewKey = "IsNew";

    }
}
