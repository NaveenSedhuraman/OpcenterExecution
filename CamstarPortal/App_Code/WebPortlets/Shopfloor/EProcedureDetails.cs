// Copyright Siemens 2020  
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

using Camstar.WCF.Services;
using Camstar.WebPortal.FormsFramework.WebGridControls;
using Camstar.WebPortal.Personalization;
using OM = Camstar.WCF.ObjectStack;
using Camstar.WebPortal.Utilities;
using Camstar.WebPortal.FormsFramework.Utilities;
using CWC = Camstar.WebPortal.FormsFramework.WebControls;
using CamstarPortal.WebControls;
using WebC = System.Web.UI.WebControls;
using Camstar.WebPortal.FormsFramework;
using Camstar.WebPortal.FormsFramework.WebControls;
using PERS = Camstar.WebPortal.Personalization;
using Camstar.WebPortal.WCFUtilities;
using System.Data;

namespace Camstar.WebPortal.WebPortlets
{
    /// <summary>
    /// Summary description for EProcedureDetails
    /// </summary>
    public class EProcedureDetails : MatrixWebPart
    {
        public EProcedureDetails()
        {
            Title = "EProcedure Details";
        }

        #region "Protected Properties"
        protected virtual ContainerListGrid HiddenContainer
        {
            get { return Page.FindCamstarControl("HiddenSelectedContainer") as ContainerListGrid; }
        }

        protected virtual NamedSubentity TaskField
        {
            get { return Page.FindCamstarControl("ExecuteTask_Task") as NamedSubentity; }
        } // TaskField

        protected virtual ScrollableMenu TaskMenu
        {
            get { return Page.FindCamstarControl("TaskMenu") as ScrollableMenu; }
        } // TaskMenu

        protected virtual TaskListSlideMenu TaskListMenu
        {
            get { return Page.FindCamstarControl("TaskListMenu") as TaskListSlideMenu; }
        } // TaskListMenu

        protected virtual CWC.TextBox _TaskName
        {
            get { return Page.FindCamstarControl("DCTaskName") as CWC.TextBox; }
        }

        protected virtual NamedSubentity _Task
        {
            get { return Page.FindCamstarControl("DCTask") as NamedSubentity; }
        }

        protected virtual RevisionedObject _TaskList
        {
            get { return Page.FindCamstarControl("DCTaskList") as RevisionedObject; }
        }

        //Deleted Sample rows
        protected virtual CWC.TextBox DeletedSampleRow
        {
            get { return Page.FindCamstarControl("DeleteSampleRow") as CWC.TextBox; }
        }

        protected virtual CWC.TextBox TxtIterationCount
        {
            get { return Page.FindCamstarControl("IterationCount") as CWC.TextBox; }
        } // Iteration Count Input

        #endregion All

        protected override void OnInit(EventArgs e)
        {
            Page.LoadComplete += new EventHandler(Page_LoadComplete);
            base.OnInit(e);
        }

        protected virtual void Page_LoadComplete(object sender, EventArgs e)
        {
            var TLCtrl = Page.FindCamstarControl("DCTaskList") as Camstar.WebPortal.FormsFramework.WebControls.RevisionedObject;
            _TaskList.Data = TLCtrl.Data;

            var taskCtrl = Page.FindCamstarControl("DCTask") as Camstar.WebPortal.FormsFramework.WebControls.NamedObject;
            _Task.Data = taskCtrl.Data;

            CWC.ContainerList _Container = Page.FindCamstarControl("ContainerStatus_ContainerName") as CWC.ContainerList;

            if (!_Task.IsEmpty && !_TaskList.IsEmpty && !_Container.IsEmpty)
            {
                OM.ExecuteTask serviceData = new OM.ExecuteTask();
                serviceData.Container = new OM.ContainerRef();
                serviceData.Container.Name = _Container.Data.ToString();

                base.GetInputData(serviceData);
            }

            if (mReloadDC)
            {
                if (TaskMenu != null)
                {
                    _paramDataControl.ProcessedIterations = TaskMenu.NumberOfTimesProcessed;
                    _paramDataControl.MaxIterations = TaskMenu.MaxIterations;
                    _paramDataControl.MinIterations = TaskMenu.MinIterations;
                    int iterationCount = 0;

                    if (TaskMenu.MaxIterations > 0 && TaskMenu.NumberOfTimesProcessed > 0 && (TaskMenu.NumberOfTimesProcessed >= TaskMenu.MaxIterations))
                        iterationCount = 0;
                    else
                    {
                        if (TaskMenu.MinIterations > 0)
                            iterationCount = TaskMenu.MinIterations - TaskMenu.NumberOfTimesProcessed;
                    }

                    if (iterationCount < 0)
                        iterationCount = 0;

                    _paramDataControl.IterationCount = iterationCount;

                    LoadTaskDetails();
                }
            }
            if (_paramDataControl.IterationCount < 1 && Convert.ToInt32(TxtIterationCount.Data) > 0)
            {
                _paramDataControl.IterationCount = 1;
                //Reload datacollection page once redefine the data point values
                ScriptManager.RegisterStartupScript(Page.Form, Page.Form.GetType(), "ReDefineShopFloorDC", "ReDefineShopFloorDC();", true);
            }
            else if (_paramDataControl.IterationCount >= 1)
            {
                TxtIterationCount.Data = _paramDataControl.IterationCount.ToString();
            }
        }

        protected virtual void LoadTaskDetails()
        {
            ExecuteTaskService serv = Page.Service.GetService<ExecuteTaskService>();
            OM.ExecuteTask data = new OM.ExecuteTask();
            OM.ExecuteTask_Info info = new OM.ExecuteTask_Info();

            CWC.ContainerList _Container = Page.FindCamstarControl("ContainerStatus_ContainerName") as CWC.ContainerList;
            if (_Container.IsEmpty)
            {
                _paramDataControl.Visible = false;
                TxtIterationCount.Visible = false;
                return;
            }
            data.Container = new OM.ContainerRef(_Container.Data.ToString());

            data.Task = _Task.Data as OM.NamedSubentityRef;

            var scrollCtrl = Page.FindCamstarControl("TaskMenu") as ScrollableMenu;
            short instructionType = -1;
            bool isComputation = false;
            if (scrollCtrl != null)
            {
                if (scrollCtrl.TaskField != null && scrollCtrl.TaskField.ID != null)
                {
                    if (data.Task != null)
                    {
                        data.Task.ID = scrollCtrl.TaskField.ID;
                    }
                    else // added to resolve issue where task is cleared on reset
                    {
                        data.Task = scrollCtrl.TaskField;
                    }
                    instructionType = scrollCtrl.InstructionType;
                    isComputation = scrollCtrl.IsComputationTask;
                }
            }

            _paramDataControl.Visible = _DCLoaded;
            TxtIterationCount.Visible = false;
            if (data.Task != null && !_DCLoaded)
            {
                if (!data.Task.IsEmpty && (instructionType == 2 || isComputation))
                {
                    Page.RequestValues(info, data);
                    _paramDataControl.RequestValues(data, info);
                    info.Container = new OM.Info(true);
                    info.Task = new OM.Info(true);
                    info.TaskList = new OM.Info(true);
                    info.InstructionType = new OM.Info(true);
                    info.ParametricDataDefType = new OM.Info(true);
                    info.WebPart = new OM.Info(true);
                    info.ParametricData = new OM.ParametricData_Info
                    {
                        RequestValue = true
                    };

                    ExecuteTask_Request request = new ExecuteTask_Request { Info = info };
                    ExecuteTask_Result resultData;

                    var res = serv.GetDataPoints(data, null, request, out resultData);
                    if (res.IsSuccess)
                    {

                        System.Web.HttpContext.Current.Session["DefaultDataPointDetails"] = resultData;
                        resultData.Value.TaskList = resultData.Value.Task.Parent as OM.RevisionedObjectRef;
                        _paramDataControl.Data = resultData.Value.Clone() as OM.ExecuteTask;

                        if (TaskMenu != null)
                        {
                            _paramDataControl.ProcessedIterations = TaskMenu.NumberOfTimesProcessed;
                            _paramDataControl.MaxIterations = TaskMenu.MaxIterations;
                            _paramDataControl.MinIterations = TaskMenu.MinIterations;
                            int iterationCount = 0;

                            if (TaskMenu.MaxIterations > 0 && TaskMenu.NumberOfTimesProcessed > 0 && (TaskMenu.NumberOfTimesProcessed >= TaskMenu.MaxIterations))
                                iterationCount = 0;
                            else
                            {
                                if (TaskMenu.MinIterations > 0)
                                    iterationCount = TaskMenu.MinIterations - TaskMenu.NumberOfTimesProcessed;
                            }

                            if (iterationCount < 0)
                                iterationCount = 0;

                            _paramDataControl.IterationCount = iterationCount;
                        }

                        _paramDataControl.RebuildControl();
                        // Added code for Pupulate Default value or MPI EQ Lookup data
                        bool IsMPIDataCollection = false;
                        if (_paramDataControl != null)
                        {
                            if (_paramDataControl.DataCollectionDef != null)
                            {
                                if (_paramDataControl.DataPointItems.Count > 0)
                                {
                                    int n = _paramDataControl.DataPointItems.Count;

                                    for (int i = 0; i < n; i++)
                                    {
                                        if (_paramDataControl.DataPointItems[i].DataType.ToString() == "Object" && _paramDataControl.DataPointItems[i].ObjectValueCDOType.ToString().Contains("MPIEQLookUp"))
                                        {
                                            IsMPIDataCollection = true;
                                            ScriptManager.RegisterStartupScript(Page.Form, Page.Form.GetType(), "ObjectValueDataChange", "ObjectDataValue_Change();", true);
                                        }
                                    }
                                    OM.DataPointLayoutEnum DPLayoutType = GetDataPointLayout(resultData);
                                    if (DPLayoutType == OM.DataPointLayoutEnum.IterationGrid)
                                    {
                                        TxtIterationCount.Visible = true;
                                    }
                                    else
                                    {
                                        TxtIterationCount.Visible = false;
                                    }
                                }
                            }
                        }
                        System.Web.HttpContext.Current.Session["DataPointDetails"] = data;

                        if (IsMPIDataCollection == false)
                        {
                            LoadDefaultValues();
                        }
                        ScriptManager.RegisterStartupScript(Page.Form, Page.Form.GetType(), "ObjectValueDataChange", "ObjectDataValue_Change();", true);


                        TaskField.Data = resultData.Value.Task;
                        resultData.Value.Container = null;
                        resultData.Value.Task = null;
                        resultData.Value.Pass = resultData.Value.InstructionType == null || resultData.Value.InstructionType != OM.InstructionTypeEnum.PassFail;
                        _paramDataControl.Visible = true;
                        _DCLoaded = true;
                    }
                    else
                    {
                        DisplayMessage(res);
                    }
                } //if (!data.Task.IsEmpty)
            } //if (data.Task != null)
        }

        public static bool IsShowConfirmationMessage(OM.ExecuteTask serviceData)
        {
            var service = new ExecuteTaskService(FrameworkManagerUtil.GetFrameworkSession().CurrentUserProfile);
            var request = new ExecuteTask_Request()
            {
                Info = new OM.ExecuteTask_Info()
                {
                    IsConfirmation = new OM.Info(true)
                }
            };
            ExecuteTask_Result result;
            var res = service.Load(serviceData, request, out result);
            if (res.IsSuccess && result.Value != null)
                return (bool)result.Value.IsConfirmation;
            return false;
        }

        protected override void OnLoad(EventArgs e)
        {
            base.OnLoad(e);
            TxtIterationCount.DataChanged += new EventHandler(TxtIterationCount_DataChanged);
            HiddenContainer.DataChanged += new EventHandler(ChangeTaskDC);
            _Task.DataChanged += new EventHandler(ChangeTaskDC);
            if (_paramDataControl != null)
            {
                if (_paramDataControl.DataCollectionDef != null)
                {
                    if (_paramDataControl.DataPointItems.Count > 0)
                    {
                        List<DataPoint_Item> lstParamDataDPItems = new List<DataPoint_Item>(_paramDataControl.DataPointItems);
                        //Get the sample rows that deleted
                        if (DeletedSampleRow != null && DeletedSampleRow.Data != null)
                        {
                            string sSampleRowDel = DeletedSampleRow.Data.ToString();
                            if (sSampleRowDel.Trim() != "")
                            {
                                string[] sArrSample = new string[1];
                                int IterationCount = _paramDataControl.IterationCount;
                                //Update the iteration count based on sample row count
                                if (sSampleRowDel.Contains(","))
                                {
                                    sArrSample = sSampleRowDel.Split(',');
                                    _paramDataControl.IterationCount = _paramDataControl.IterationCount - (sSampleRowDel.Split(',').Length);
                                }
                                else
                                {
                                    sArrSample[0] = sSampleRowDel;
                                    _paramDataControl.IterationCount = _paramDataControl.IterationCount - 1;
                                }
                                LoadPreDefinedValues(sArrSample, IterationCount);
                                //Reload datacollection page once redefine the data point values
                                ScriptManager.RegisterStartupScript(Page.Form, Page.Form.GetType(), "ReDefineShopFloorDC", "ReDefineShopFloorDC();", true);
                                DeletedSampleRow.Data = null;
                                TxtIterationCount.Data = _paramDataControl.IterationCount;
                            }
                        }
                        int n = _paramDataControl.DataPointItems.Count;

                        for (int i = 0; i < n; i++)
                        {
                            if (_paramDataControl.DataPointItems[i].DataType.ToString() == "Object" && _paramDataControl.DataPointItems[i].ObjectValueCDOType.ToString().Contains("MPIEQLookUp"))
                            {
                                if (_paramDataControl.DataPointItems[i].Controls.Count > 0 && _paramDataControl.DataPointItems[i].Controls[0].Data != null)
                                {
                                    string strLKPData = _paramDataControl.DataPointItems[i].Controls[0].Data.ToString();
                                    GetMPILookupValues(strLKPData);
                                }
                            }
                        }
                    }
                }

            }
            //Calling client script to add trash in grid view header & added check box in sample column
            ScriptManager.RegisterStartupScript(Page.Form, Page.Form.GetType(), "CallScript", "setTimeout(function(){ deleteShopFloorCtrl(); },100);", true);
        }

        protected virtual void ChangeTaskDC(object sender, EventArgs e)
        {
            mReloadDC = true;
        }

        public override void PostExecute(OM.ResultStatus status, OM.Service serviceData)
        {
            base.PostExecute(status, serviceData);

            mReloadDC = status.IsSuccess;

            if (status.IsSuccess)
            {
                //If an esig was on the last task then force a reload here
                UIComponentDataMember member = Page.DataContract.DataMembers.SingleOrDefault(m => m.Name == "ESigCaptureDetailsDM");
                if (member != null && member.Value != null)
                {
                    if (TaskMenu != null && TaskListMenu != null)
                    {
                        //force a reload of the data to update the count/status of the task item
                        TaskListMenu.ForceReload = true;
                        TaskListMenu.ClearMenuItems();
                        TaskListMenu.LoadComplete();
                        if (!IsResponsive)
                        {
                            TaskListMenu.BuildSlideMenu();
                        }
                        else
                        {
                            TaskListMenu.BuildResponsiveSlideMenu();
                        }
                        TaskMenu.InitialLoad = true;
                        TaskMenu.LoadComplete();

                        LoadTaskDetails();
                    }
                }
            }
        }


        public override void GetInputData(OM.Service serviceData)
        {
            base.GetInputData(serviceData);

            if (Page.ProcessingContext.Status != ProcessingStatusType.SubmitTransaction)
                return;

            if (TaskMenu != null && TaskMenu.TaskField != null && TaskMenu.TaskField.ID != null)
            {
                if (TaskMenu.InstructionType == 2 || TaskMenu.IsComputationTask)
                {
                    if (serviceData is OM.ExecuteTask)
                    // _paramDataControl.FillExecuteTask(serviceData as OM.ExecuteTask);
                    {
                        var status = _paramDataControl.Validate();
                        if (!status.IsSuccess)
                        {
                            DisplayMessage(status);
                            return;
                        }
                        var resStatus = _paramDataControl.FillExecuteTask(serviceData as OM.ExecuteTask);
                        DisplayMessage(resStatus);
                    }

                }
            }
        }

        protected override void AddFieldControls()
        {
            var IsResponsive = this.IsResponsive;// System.Web.HttpContext.Current.Session[Camstar.WebPortal.Constants.SessionConstants.IsMobileEntryPoint] != null;
            _paramDataControl = !IsResponsive ?
                                        new ShopFloorDCControlDesktop { AllowMultipleSamples = true } as ShopFloorDCControl :
                                        new ShopFloorDCControlResponsive { AllowMultipleSamples = true } as ShopFloorDCControl;
            _paramDataControl.ID = "DCParamDataField";
            this[0, 0] = _paramDataControl;
        }




        // Populate default value into Data Value testbox
        protected virtual void LoadDefaultValues()
        {
            var vDC = System.Web.HttpContext.Current.Session["DefaultDataPointDetails"];

            if (_paramDataControl != null)
            {
                if (_paramDataControl.DataCollectionDef != null)
                {

                    if (_paramDataControl.DataPointItems.Count > 0)
                    {
                        int n = _paramDataControl.DataPointItems.Count;


                        for (int i = 0; i < n; i++)
                        {

                            string strParamType = string.Empty;
                            string strParamDataPoint = string.Empty;
                            string strParamDataCollectionName = string.Empty;
                            string strParamDataCollectionRev = string.Empty;

                            if (((Camstar.WCF.ObjectStack.DataPointSummary)((Camstar.WCF.Services.ExecuteTask_Result)vDC).Value.ParametricData).DataPointDetails[i].dex_ParamType != null)
                            {
                                strParamType = ((Camstar.WCF.ObjectStack.DataPointSummary)((Camstar.WCF.Services.ExecuteTask_Result)vDC).Value.ParametricData).DataPointDetails[i].dex_ParamType.ToString();

                            }
                            if (((Camstar.WCF.ObjectStack.DataPointSummary)((Camstar.WCF.Services.ExecuteTask_Result)vDC).Value.ParametricData).DataPointDetails[i].dex_FetchedParameter != null)
                            {
                                strParamDataPoint = ((Camstar.WCF.ObjectStack.DataPointSummary)((Camstar.WCF.Services.ExecuteTask_Result)vDC).Value.ParametricData).DataPointDetails[i].dex_FetchedParameter.ToString();
                            }

                            if (((Camstar.WCF.ObjectStack.DataPointSummary)((Camstar.WCF.Services.ExecuteTask_Result)vDC).Value.ParametricData).DataPointDetails[i].dex_FetchedParameterSet != null)
                            {
                                strParamDataCollectionName = ((Camstar.WCF.ObjectStack.DataPointSummary)((Camstar.WCF.Services.ExecuteTask_Result)vDC).Value.ParametricData).DataPointDetails[i].dex_FetchedParameterSet.Name.ToString();
                                strParamDataCollectionRev = ((Camstar.WCF.ObjectStack.DataPointSummary)((Camstar.WCF.Services.ExecuteTask_Result)vDC).Value.ParametricData).DataPointDetails[i].dex_FetchedParameterSet.Revision.ToString();

                            }

                            if (_paramDataControl.DataPointItems[i].Controls.Count > 0)
                            {
                                var type = _paramDataControl.DataPointItems[i].Controls[0].GetType();
                                if (type.Name == "TextBox")
                                {
                                    if (strParamType == "1" && strParamDataCollectionName != null && strParamDataCollectionRev != null && strParamDataPoint != null)
                                    {
                                        string strFetchValue = GetFetchedDataCollectionDetails(strParamDataCollectionName, strParamDataCollectionRev, strParamDataPoint);
                                        ((Camstar.WebPortal.FormsFramework.WebControls.TextBox)_paramDataControl.DataPointItems[i].Controls[0]).Data = strFetchValue;

                                    }
                                    else
                                    {
                                        ((Camstar.WebPortal.FormsFramework.WebControls.TextBox)_paramDataControl.DataPointItems[i].Controls[0]).Data = ((Camstar.WCF.ObjectStack.DataPointSummary)((Camstar.WCF.Services.ExecuteTask_Result)vDC).Value.ParametricData).DataPointDetails[i].DataValue;

                                    }
                                }

                                if (type.Name == "DateChooser")
                                {
                                    ((Camstar.WebPortal.FormsFramework.WebControls.DateChooser)_paramDataControl.DataPointItems[i].Controls[0]).Data = ((Camstar.WCF.ObjectStack.DataPointSummary)((Camstar.WCF.Services.ExecuteTask_Result)vDC).Value.ParametricData).DataPointDetails[i].DataValue;
                                }
                                if (type.Name == "BooleanDropDown")
                                {
                                    ((Camstar.WebPortal.FormsFramework.WebControls.BooleanDropDown)_paramDataControl.DataPointItems[i].Controls[0]).Data = ((Camstar.WCF.ObjectStack.DataPointSummary)((Camstar.WCF.Services.ExecuteTask_Result)vDC).Value.ParametricData).DataPointDetails[i].DataValue;
                                }
                                if (type.Name == "NamedObject")
                                {
                                    ((Camstar.WebPortal.FormsFramework.WebControls.NamedObject)_paramDataControl.DataPointItems[i].Controls[0]).Data = ((Camstar.WCF.ObjectStack.DataPointSummary)((Camstar.WCF.Services.ExecuteTask_Result)vDC).Value.ParametricData).DataPointDetails[i].DataValue;
                                }
                            }

                        }
                    }
                }
            }
        }

        //private void GetMPILookupValues(string strMPIData, ExecuteTask_Result data)
        private void GetMPILookupValues(string strMPIData)
        {
            if (strMPIData != "")
            {
                Boolean status = false;
                //var vDC = System.Web.HttpContext.Current.Session["DataPointDetails"];               

                //  int n = ((Camstar.WCF.ObjectStack.DataPointSummary)data.Value.ParametricData).DataPointDetails.Count();
                int n = _paramDataControl.DataPointItems.Count;
                FrameworkSession qrysession = FrameworkManagerUtil.GetFrameworkSession(HttpContext.Current.Session);
                {
                    OM.QueryOptions _queryOptions = new OM.QueryOptions()
                    {
                        QueryType = Camstar.WCF.ObjectStack.QueryType.User,

                    };
                    QueryService QueryService = new QueryService(qrysession.CurrentUserProfile);
                    OM.RecordSet recordset = new OM.RecordSet();
                    OM.ResultStatus res = new OM.ResultStatus();
                    OM.QueryParameters queryparam;
                    queryparam = new OM.QueryParameters()
                    {
                        Parameters = new OM.QueryParameter[1] { new OM.QueryParameter("MPIName", strMPIData) }
                    };
                    res = QueryService.Execute("dexMPIDetails", queryparam, _queryOptions, out recordset);
                    if (res.IsSuccess)
                    {
                        DataTable dtDataPoints = recordset.GetAsDataTable();

                        var vDC = System.Web.HttpContext.Current.Session["DataPointDetails"];

                        if (_paramDataControl != null)
                        {
                            if (_paramDataControl.DataCollectionDef != null)
                            {

                                if (_paramDataControl.DataPointItems.Count > 0)
                                {

                                    if (dtDataPoints.Rows.Count > 0)
                                    {
                                        foreach (DataRow row in dtDataPoints.Rows)
                                        {
                                            string strParamName = row.Field<string>("ParameterName");
                                            string strParamValue = row.Field<string>("ParameterValue");

                                            for (int i = 0; i < n; i++)
                                            {
                                                if (_paramDataControl.DataPointItems[i].DataPointName == strParamName)
                                                {
                                                    status = true;
                                                    var type = _paramDataControl.DataPointItems[i].Controls[0].GetType();
                                                    if (type.Name == "TextBox")
                                                    {
                                                        ((Camstar.WebPortal.FormsFramework.WebControls.TextBox)_paramDataControl.DataPointItems[i].Controls[0]).Data = strParamValue;
                                                    }
                                                    if (type.Name == "DateChooser")
                                                    {
                                                        ((Camstar.WebPortal.FormsFramework.WebControls.DateChooser)_paramDataControl.DataPointItems[i].Controls[0]).Data = strParamValue;
                                                    }
                                                    if (type.Name == "BooleanDropDown")
                                                    {
                                                        ((Camstar.WebPortal.FormsFramework.WebControls.BooleanDropDown)_paramDataControl.DataPointItems[i].Controls[0]).Data = strParamValue;
                                                    }
                                                    if (type.Name == "NamedObject")
                                                    {
                                                        ((Camstar.WebPortal.FormsFramework.WebControls.NamedObject)_paramDataControl.DataPointItems[i].Controls[0]).Data = strParamValue;
                                                    }
                                                }
                                            }
                                        }

                                        if (status == false)
                                        {
                                            for (int i = 0; i < n; i++)
                                            {

                                                var type = _paramDataControl.DataPointItems[i].Controls[0].GetType();
                                                if (type.Name == "TextBox")
                                                {
                                                    ((Camstar.WebPortal.FormsFramework.WebControls.TextBox)_paramDataControl.DataPointItems[i].Controls[0]).Data = null;
                                                }
                                                if (type.Name == "DateChooser")
                                                {
                                                    ((Camstar.WebPortal.FormsFramework.WebControls.DateChooser)_paramDataControl.DataPointItems[i].Controls[0]).Data = null;
                                                }
                                                if (type.Name == "BooleanDropDown")
                                                {
                                                    ((Camstar.WebPortal.FormsFramework.WebControls.BooleanDropDown)_paramDataControl.DataPointItems[i].Controls[0]).Data = null;
                                                }
                                                //if (type.Name == "NamedObject")
                                                //{
                                                //    ((Camstar.WebPortal.FormsFramework.WebControls.NamedObject)ParamDataControl.DataPointItems[i].Controls[0]).Data = null;
                                                //}

                                            }
                                        }
                                        ScriptManager.RegisterStartupScript(Page.Form, Page.Form.GetType(), "ObjectValueDataChange", "ObjectDataValue_Change();", true);
                                    }

                                }


                            }
                        }
                    }
                }
            }
        }


        public string GetFetchedDataCollectionDetails(string strParamDataCollectionName, string strParamDataCollectionRev, string strParamDataPoint)
        {
            string strFetchValue = string.Empty;
            FrameworkSession qrysession = FrameworkManagerUtil.GetFrameworkSession(HttpContext.Current.Session);
            {
                OM.QueryOptions _queryOptions = new OM.QueryOptions()
                {
                    QueryType = Camstar.WCF.ObjectStack.QueryType.User,

                };
                QueryService QueryService = new QueryService(qrysession.CurrentUserProfile);
                OM.RecordSet recordset = new OM.RecordSet();
                OM.ResultStatus res = new OM.ResultStatus();
                OM.QueryParameters queryparam;
                queryparam = new OM.QueryParameters()
                {
                    Parameters = new OM.QueryParameter[]
                                                          {

                                                      new OM.QueryParameter("DataCollectionName", strParamDataCollectionName),
                                                      new OM.QueryParameter("DataCollectionRev", strParamDataCollectionRev),
                                                      new OM.QueryParameter("DataPointName", strParamDataPoint),
                                                      new OM.QueryParameter("ContainerName", HiddenContainer.Data.ToString())

                }
                };
                res = QueryService.Execute("dex_FetchDataValues", queryparam, _queryOptions, out recordset);
                if (res.IsSuccess)
                {
                    DataTable dtDataPoints = recordset.GetAsDataTable();
                    strFetchValue = dtDataPoints.Rows[0]["DATAVALUE"].ToString();
                }
            }
            return strFetchValue;
        }

        //Redifne the existing user input values once deleted selected sample rows
        private void LoadPreDefinedValues(string[] sDeletedSamples, int IterationCount)
        {
            List<int> lstRemSamples = new List<int>();
            for (int rowPos = 0; rowPos < IterationCount; rowPos++)
            {
                if (!sDeletedSamples.Contains(rowPos.ToString()))
                {
                    lstRemSamples.Add(rowPos);
                }
            }
            int n = _paramDataControl.DataPointItems.Count;

            if (_paramDataControl != null)
            {
                if (_paramDataControl.DataCollectionDef != null)
                {
                    if (_paramDataControl.DataPointItems.Count > 0)
                    {
                        for (int dpRow = 0; dpRow < n; dpRow++)
                        {
                            int iControlsC = _paramDataControl.DataPointItems[dpRow].Controls.Count;
                            int iDataRow = 0;
                            List<int> lstFromRemSamples = new List<int>(lstRemSamples);
                            string sReplcaeVal = string.Empty;
                            //Update data point values based on iteration count
                            for (int cpRow = IterationCount; cpRow >= 1; cpRow--)
                            {
                                var type = _paramDataControl.DataPointItems[dpRow].Controls[cpRow].GetType();
                                lstFromRemSamples = lstFromRemSamples.Where(x => x >= iDataRow).ToList();
                                if (lstFromRemSamples.Count > 0)
                                {
                                    lstFromRemSamples = lstFromRemSamples.OrderBy(x => x).ToList();
                                    sReplcaeVal = lstFromRemSamples[0].ToString();
                                    var ItemToRemove = lstFromRemSamples.SingleOrDefault(r => r == Convert.ToInt32(sReplcaeVal));
                                    if (ItemToRemove != null)
                                        lstFromRemSamples.Remove(ItemToRemove);
                                }
                                if (sReplcaeVal != string.Empty && sReplcaeVal != "0")
                                {
                                    if (type.Name == "TextBox")
                                    {
                                        ((Camstar.WebPortal.FormsFramework.WebControls.TextBox)_paramDataControl.DataPointItems[dpRow].Controls[iControlsC - cpRow]).Data = _paramDataControl.DataPointItems[dpRow].Controls[(iControlsC - IterationCount) + Convert.ToInt32(sReplcaeVal)].Data;
                                    }
                                    if (type.Name == "DateChooser")
                                    {
                                        ((Camstar.WebPortal.FormsFramework.WebControls.DateChooser)_paramDataControl.DataPointItems[dpRow].Controls[iControlsC - cpRow]).Data = _paramDataControl.DataPointItems[dpRow].Controls[(iControlsC - IterationCount) + Convert.ToInt32(sReplcaeVal)].Data;
                                    }
                                    if (type.Name == "BooleanDropDown")
                                    {
                                        ((Camstar.WebPortal.FormsFramework.WebControls.BooleanDropDown)_paramDataControl.DataPointItems[dpRow].Controls[iControlsC - cpRow]).Data = _paramDataControl.DataPointItems[dpRow].Controls[(iControlsC - IterationCount) + Convert.ToInt32(sReplcaeVal)].Data;
                                    }
                                    if (type.Name == "NamedObject")
                                    {
                                        ((Camstar.WebPortal.FormsFramework.WebControls.NamedObject)_paramDataControl.DataPointItems[dpRow].Controls[iControlsC - cpRow]).Data = _paramDataControl.DataPointItems[dpRow].Controls[(iControlsC - IterationCount) + Convert.ToInt32(sReplcaeVal)].Data;
                                    }
                                    if (type.Name == "RevisionedObject")
                                    {
                                        ((Camstar.WebPortal.FormsFramework.WebControls.RevisionedObject)_paramDataControl.DataPointItems[dpRow].Controls[iControlsC - cpRow]).Data = _paramDataControl.DataPointItems[dpRow].Controls[(iControlsC - IterationCount) + Convert.ToInt32(sReplcaeVal)].Data;
                                    }
                                }
                                iDataRow++;
                            }
                        }
                    }
                }
            }
        }
        //To rebind the samples based on iteration count
        protected void TxtIterationCount_DataChanged(object sender, EventArgs e)
        {
            if (Convert.ToInt32(TxtIterationCount.Data) <= 0)
            {
                TxtIterationCount.Data = 1;
            }
            _paramDataControl.IterationCount = Convert.ToInt32(TxtIterationCount.Data);
            //Reload datacollection page once redefine the data point values
            ScriptManager.RegisterStartupScript(Page.Form, Page.Form.GetType(), "ReDefineShopFloorDC", "ReDefineShopFloorDC();", true);
        }

        //Get Data Point Layout
        protected OM.DataPointLayoutEnum GetDataPointLayout(ExecuteTask_Result result)
        {

            if (result.Value.ParametricData is OM.DataPointSummary && (result.Value.ParametricData as OM.DataPointSummary).DataPointLayout != null)
            {
                return (OM.DataPointLayoutEnum)(result.Value.ParametricData as OM.DataPointSummary).DataPointLayout;
            }

            return OM.DataPointLayoutEnum.RowColumnPosition;
        }

        private ShopFloorDCControl _paramDataControl;
        private bool mReloadDC;
        private bool _DCLoaded;
    }
}
