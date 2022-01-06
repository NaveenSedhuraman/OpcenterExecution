// Copyright Siemens 2019  
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Camstar.WCF.ObjectStack;
using Camstar.WebPortal.FormsFramework.WebControls;
using Camstar.WebPortal.FormsFramework.WebGridControls;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Spreadsheet;
using DocumentFormat.OpenXml;

namespace Camstar.WebPortal.WebPortlets.Modeling
{
    public class MfgCalendarMaint : MatrixWebPart
    {
        protected override void OnLoad(EventArgs e)
        {
            base.OnLoad(e);
            //add atribute, which allows to perform file saving via js
            AddShiftButton.Attributes.Add("actionType", "SubmitAction");
            AddShiftButton.Click += AddShiftButton_Click;
        }

        protected virtual void AddShiftButton_Click(object sender, EventArgs e)
        {
            var filePath = FileInput.UploadFilePath; //new FormsFramework.CallStack().Context.LocalSession["uploadedFile"] as string;
            if (string.IsNullOrEmpty(filePath) || !System.IO.File.Exists(filePath))
                return;
            SpreadsheetDocument doc = null;
            try
            {
                doc = SpreadsheetDocument.Open(filePath, false);
                Sheet sheet = doc.WorkbookPart.Workbook.Descendants<Sheet>().FirstOrDefault(s => s.Name == "Calendar");
                if (sheet == null)
                {
                    Page.DisplayMessage(ExcellErrorLabel.Text, false);
                    return;
                }
                var part = doc.WorkbookPart.GetPartById(sheet.Id) as WorksheetPart;
                var columns = part.Worksheet.Descendants<Column>();
                var stringTable = doc.WorkbookPart.GetPartsOfType<SharedStringTablePart>().FirstOrDefault();
                var rows = part.Worksheet.Descendants<DocumentFormat.OpenXml.Spreadsheet.Row>();
                var rowsCount = rows.Count();
                if (rowsCount < 2)
                    return;
                var items = new List<CalendarShiftChanges>();

                int? fiscalYear, fiscalQuarter, fiscalMonth, fiscalWeek;
                double calendarDate, shiftStart, shiftEnd;
                string team;

                for (int i = 1; i < rowsCount; i++)
                {
                    var headers = rows.ElementAt(0).Elements<Cell>();
                    if (headers.Count() < 12)
                    {
                        Page.DisplayMessage(ExcellErrorLabel.Text, false);
                        break;

                    }
                    var cells = rows.ElementAt(i).Elements<Cell>();
                    var resultCells = GetResultCells(cells);

                    if (cells.Count() < 7)//7 cells are required only
                    {
                        if (i == 1) //Only display error if the 1st row is malformed.
                        {
                            Page.DisplayMessage(ExcellErrorLabel.Text, false);
                        }
                        break;
                    }

                    if (!double.TryParse(cells.ElementAt(0).CellValue.Text, out calendarDate))//Calendar Date
                        continue;
                    if (!double.TryParse(cells.ElementAt(2).CellValue.Text, out shiftStart))//Shift Start
                        continue;
                    if (!double.TryParse(cells.ElementAt(3).CellValue.Text, out shiftEnd))//Shift End
                        continue;
                    team = resultCells.ElementAt(4).CellValue == null ? "" : resultCells.ElementAt(4).CellValue.Text;//Team
                    fiscalYear = intParse(resultCells.ElementAt(5).CellValue.Text);//FiscalYear
                    fiscalQuarter = intParse(resultCells.ElementAt(6).CellValue.Text);//FiscalQuarter
                    fiscalMonth = intParse(resultCells.ElementAt(7).CellValue.Text);//FiscalMonth
                    fiscalWeek = intParse(resultCells.ElementAt(8).CellValue.Text);//FiscalWeek

                    items.Add(new CalendarShiftChanges
                    {
                        CalendarDate = DateTime.FromOADate(calendarDate),
                        Shift = (cells.ElementAt(1).DataType != null && cells.ElementAt(1).DataType == CellValues.SharedString) ?
                        new NamedObjectRef(stringTable.SharedStringTable.ElementAt(Convert.ToInt32(cells.ElementAt(1).CellValue.Text)).InnerText) :
                        new NamedObjectRef(cells.ElementAt(1).CellValue.Text),
                        ShiftStart = DateTime.FromOADate(shiftStart),
                        ShiftEnd = DateTime.FromOADate(shiftEnd),
                        //Not required fields
                        Team = (resultCells.ElementAt(4).DataType != null && resultCells.ElementAt(4).DataType == CellValues.SharedString) ?
                        new NamedObjectRef(stringTable.SharedStringTable.ElementAt(Convert.ToInt32(team)).InnerText) :
                        new NamedObjectRef(team),
                        FiscalYear = fiscalYear,
                        FiscalQuarter = fiscalQuarter,
                        FiscalMonth = fiscalMonth,
                        FiscalWeek = fiscalWeek
                    });
                }
                CalendarShifts.Data = items.ToArray();
            }
            catch (Exception)
            {
                Page.DisplayMessage(ExcellErrorLabel.Text, false);
            }
            finally
            {
                if (doc != null)
                    doc.Close();
                FileInput.RemoveFile(filePath);
            }
        }

        protected virtual IEnumerable<Cell> GetResultCells(IEnumerable<Cell> cells)
        {
            var resultCells = new List<Cell>();
            var previousIndex = 64;
            foreach (var cell in cells)
            {
                var cellIndex = Convert.ToInt32(cell.CellReference.ToString().ElementAt(0));
                if ((cellIndex - previousIndex) == 1)
                {
                    resultCells.Add(cell);
                    previousIndex = cellIndex;
                }
                else
                {
                    for (var i = cellIndex - previousIndex; i > 1; i--)
                    {
                        resultCells.Add(new Cell()
                        {
                            CellValue = new CellValue("")
                        });
                    }
                    resultCells.Add(cell);
                    previousIndex = cellIndex;
                }
            }
            return resultCells;
        }

        protected virtual int? intParse(string cellValue)
        {
            int value;
            if (string.IsNullOrEmpty(cellValue))
                return null;
            else
                int.TryParse(cellValue, out value);
            return value;
        }

        #region Properties
        protected virtual Button AddShiftButton
        {
            get { return Page.FindCamstarControl("AddShiftButton") as Button; }
        }
        protected virtual FormsFramework.WebControls.Label ExcellErrorLabel
        {
            get { return Page.FindCamstarControl("ExcellErrorLabel") as FormsFramework.WebControls.Label; }
        }
        protected virtual JQDataGrid CalendarShifts
        {
            get { return Page.FindCamstarControl("CalendarShifts") as JQDataGrid; }
        }
        #endregion
    }
}
