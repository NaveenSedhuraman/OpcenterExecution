// © 2017 Siemens Product Lifecycle Management Software Inc.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Camstar.WebPortal.Utilities;
using Camstar.WebPortal.WCFUtilities;
using Camstar.WebPortal.Personalization;
using Camstar.WebPortal.PortalFramework;
using Camstar.WebPortal.FormsFramework;
using Camstar.WebPortal.FormsFramework.Utilities;
using Camstar.WebPortal.FormsFramework.WebGridControls;
using CamstarPortal.WebControls;

using OM = Camstar.WCF.ObjectStack;
using CWC = Camstar.WebPortal.FormsFramework.WebControls;
using System.IO;
using System.Xml;
using Camstar.WebPortal.FormsFramework.WebControls;
using System.Text;
using System.Net;

namespace Camstar.WebPortal.WebPortlets.Modeling
{
    /// <summary>
    /// Summary description for CIOTemplate
    /// </summary>
    public class CIOTemplate : MatrixWebPart
    {
        private static bool isError = false;

        #region WebParts
        WebPartBase templateWebPart { get { return Page.FindIForm("MDL_Specific") as WebPartBase; } }
        #endregion

        #region Protected properties

        protected CWC.Button btnFormatXML
        {
            get { return Page.FindCamstarControl("btnFormatXML") as CWC.Button; }
        } // result view

        protected CWC.TextBox templateField
        {
            get { return Page.FindCamstarControl("ObjectChanges_Template") as CWC.TextBox; }
        } // result view		

        protected CWC.TextBox txtXMLFilePath
        {
            get { return Page.FindCamstarControl("XMLFilePath") as CWC.TextBox; }
        }
        #endregion

        #region Public methods

        protected override void OnLoad(EventArgs e)
        {
            btnFormatXML.Click += new EventHandler(btnFormatXML_Click);      
            base.OnLoad(e);
        }

        void btnFormatXML_Click(object sender, EventArgs e)
        {
            string unformatedXML = string.Empty;

            unformatedXML = templateField.TextControl.Text;
            isError = false;
            DisplayMessage(new OM.ResultStatus("", true));

            string formatedXML = IndentXMLString(unformatedXML, true);

            if (!isError)
            {
                templateField.TextControl.Text = formatedXML;
                Page.RenderToClient = true;
            }
            else
            {
                Page.DisplayMessage(formatedXML, false);
            }
        }

        public override void WebPartCustomAction(object sender, Personalization.CustomActionEventArgs e)
        {
            base.WebPartCustomAction(sender, e);
            var action = e.Action as CustomAction;
            string unformatedXML = string.Empty;

            if (action != null)
            {
                switch (action.Parameters)
                {
                    case "OnClickLoad":
                        {
                            isError = false;
                            break;
                        }
                }
            }
        }

        #endregion

        #region Private methods

        private string ReadTextFromFile(string xmlFile)
        {
            string text = string.Empty;

            try
            {
                text = File.ReadAllText(xmlFile);
            }
            catch (FileNotFoundException ex)
            {
                isError = true;
                text = string.Format(ex.Message.ToString());
            }
            catch (Exception ex)
            {
                isError = true;
                text = string.Format(ex.Message.ToString());
            }

            return text;
        }

        private static string IndentXMLString(string xml, bool showExceptions)
        {
            string outXml = string.Empty;
            MemoryStream ms = new MemoryStream();
            // Create a XMLTextWriter that will send its output to a memory stream (file)
            XmlTextWriter xtw = new XmlTextWriter(ms, System.Text.Encoding.UTF8);
            XmlDocument doc = new XmlDocument();
            

            try
            {
                // Load the unformatted XML text string into an instance
                // of the XML Document Object Model (DOM)
                doc.LoadXml(xml);

                // Set the formatting property of the XML Text Writer to indented
                // the text writer is where the indenting will be performed
                xtw.Indentation = 4;
                //xtw.IndentChar = ControlChars.
                xtw.Formatting = Formatting.Indented;

                // write dom xml to the xmltextwriter
                doc.WriteContentTo(xtw);
                // Flush the contents of the text writer
                // to the memory stream, which is simply a memory file
                xtw.Flush();

                // set to start of the memory stream (file)
                ms.Seek(0, SeekOrigin.Begin);
                // create a reader to read the contents of
                // the memory stream (file)
                StreamReader sr = new StreamReader(ms);
                // return the formatted string to caller
                return sr.ReadToEnd();
            }
            catch (Exception ex)
            {
                isError = true;
                if (showExceptions)
                {
                    return string.Format(ex.Message.ToString());
                }
                else
                {
                    return xml;
                }

            }
        }

        #endregion
    }
}