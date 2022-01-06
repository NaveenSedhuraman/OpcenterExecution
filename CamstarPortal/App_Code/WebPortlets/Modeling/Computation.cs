// Copyright Siemens 2019  
using System;
using System.Data;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using Camstar.WCF.Services;
using Camstar.WebPortal.FormsFramework;
using Camstar.WebPortal.FormsFramework.WebGridControls;
using Camstar.WebPortal.Personalization;
using Camstar.WebPortal.PortalFramework;

using Camstar.WebPortal.Utilities;
using Camstar.WebPortal.FormsFramework.Utilities;
using CWC = Camstar.WebPortal.FormsFramework.WebControls;
using Camstar.WCF.ObjectStack;

//from Business Rule page
using System.Activities.Expressions;
using Camstar.WebPortal.WCFUtilities;
using System.Data.Linq;
using DocumentFormat.OpenXml.Wordprocessing;


namespace Camstar.WebPortal.WebPortlets.Modeling
{

    /// <summary>
    /// TODO: Add a Summary description for this Camstar Web Part
    /// </summary>
    public class Computation : MatrixWebPart
    {
        #region Controls

        //use this region to make properties that reference controls on the Portal page using Page.FindCamstarControl. 
        protected virtual CWC.TextBox ComputationExpression
        {
            get { return Page.FindCamstarControl("ComputationExpression") as CWC.TextBox; }
        }

        protected virtual JQDataGrid ComputationParamSpecs
        {
            get { return Page.FindCamstarControl("ComputationParamSpecs") as JQDataGrid; }
        }

        protected virtual CWC.CheckBox MapToContainerAttribute
        {
            get { return Page.FindCamstarControl("MapToContainerAttribute") as CWC.CheckBox; }
        }

        protected virtual CWC.TextBox AttributeName
        {
            get { return Page.FindCamstarControl("AttributeName") as CWC.TextBox; }
        }

        protected virtual CWC.TextBox ResultName
        {
            get { return Page.FindCamstarControl("ObjectChanges_ResultName") as CWC.TextBox; }
        }

        #endregion

        #region Protected Functions

        /// <summary>
        /// TODO: Summary Description of function
        /// </summary>
        /// <param name="e"></param>
        protected override void OnLoad(EventArgs e)
        {
            base.OnLoad(e);
            ComputationExpression.TextChanged += ComputationExpression_TextChanged;
            MapToContainerAttribute.DataChanged += (sender, args) =>
            {
                if(ResultName == null || AttributeName == null)
                    return;
                var checkbox = (CWC.CheckBox) sender;
                if (ResultName.Data == null)
                {
                    AttributeName.ReadOnly = false;
                    checkbox.CheckControl.Checked = false;
                    AttributeName.ClearData();
                    CamstarWebControl.SetRenderToClient(checkbox);
                    return;
                }
                if (checkbox.IsChecked)
                {
                    AttributeName.Data = ResultName.Data;
                    AttributeName.ReadOnly = true;
                }
                else
                {
                    AttributeName.ClearData();
                    AttributeName.ReadOnly = false;
                }
            };

        }

        protected virtual void ComputationExpression_TextChanged(object sender, EventArgs e)
        {
            //fill the grid from the Computation Expression
            if (this.ComputationExpression.Data != null)
            {
                FillGrid();
            }
        }

        protected virtual void PopulateParametersGrid(RecordSet ComputationParamSpecsSelectionData)
        {
            if (ComputationParamSpecsSelectionData != null)
            {
                if (!ComputationParamSpecs.IsEmpty)
                {
                    //delete any existing parameters
                    ComputationParamSpecs.ClearData();
                } 
                InsertNewParameters(ComputationParamSpecsSelectionData);
            }
        }


        #endregion

        #region Public Functions



        #endregion

        #region Private Functions

        protected virtual void FillGrid()
        {
            //get the data values from the service
            var service = new ComputationMaintService(FrameworkManagerUtil.GetFrameworkSession().CurrentUserProfile);
            var data = new ComputationMaint()
            {
                ObjectChanges = new ComputationChanges()
                {
                    ComputationExpression = ComputationExpression.Data.ToString(),
                    ComputationParamSpecs = new ComputationParamSpecChanges[] { new ComputationParamSpecChanges() },
                    DisplayLimits = false,
                    IsLimitOverrideAllowed = false
                }
            };

            var request = new ComputationMaint_Request()
            {
                Info = new ComputationMaint_Info()
                {
                    ObjectChanges = new ComputationChanges_Info()
                    {
                        ComputationParamSpecs = new ComputationParamSpecChanges_Info()
                        {
                            RequestSelectionValues = true
                        }
                    }
                }
            };

            var result = new ComputationMaint_Result();
            ResultStatus rs = service.GetEnvironment(data, request, out result);
            if (rs.IsSuccess)
            {
                if (result.Environment.ObjectChanges.ComputationParamSpecs.SelectionValues.Rows != null)
                {
                    //pass this to a new function and put into an array of values.
                    PopulateParametersGrid(result.Environment.ObjectChanges.ComputationParamSpecs.SelectionValues);
                }
            }
        }

        protected virtual void InsertNewParameters(RecordSet ComputationParamSpecsSelectionData)
        {            
            foreach (var row in ComputationParamSpecsSelectionData.Rows)
            {
                var computationParamSpecs = new ComputationParamSpecChanges();
                computationParamSpecs.Self = new BaseObjectRef();

                computationParamSpecs.ListItemAction = ListItemAction.Add;
                computationParamSpecs.Name = row.Values[0];
                //Set the data type to integer - that is the default
                computationParamSpecs.DataType = DataTypeEnum.Integer;
                
                //insert the data into the grid:
                var ComputationParam = ComputationParamSpecs.Data as ComputationParamSpecChanges[];
                if (ComputationParam != null)
                {
                    Array.Resize(ref ComputationParam, ComputationParam.Length + 1);
                    ComputationParam[ComputationParam.Length - 1] = computationParamSpecs;
                }
                else
                {
                    ComputationParam = new ComputationParamSpecChanges[1] { computationParamSpecs };    
                }
                ComputationParamSpecs.Data = ComputationParam;
            }
        }

        #endregion

        #region Constants

        #endregion

        #region Private Member Variables



        #endregion

    }
}
