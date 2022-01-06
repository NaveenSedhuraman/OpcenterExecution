define({"69":{y:0,u:"../Content/ModelingObjects/Defining_Teams_P.htm",l:-1,t:"Defining Teams",i:0.00112213205633076,a:"A Team is an alternate means of grouping production information to shift. For example, \"day\" and \"night\" shifts that are scheduled to work on Monday - Thursday might be assigned to team \"Red,\" while day and night shifts that work Friday - Sunday would be assigned to team \"Blue.\"  When Defining Teams ..."},"70":{y:0,u:"../Content/ModelingObjects/Defining_Manufacturing_Orders.htm",l:-1,t:"Defining Manufacturing Orders",i:0.00523202202799458,a:"A Manufacturing Order is a request to manufacture a product. Manufacturing orders are typically originated to fulfill a sales order or an inventory requirement and are often a link between an MES and ERP system. A manufacturing order can contain a list of product containers. The optional ..."},"71":{y:0,u:"../Content/ModelingObjects/Defining_Sales_Orders_P.htm",l:-1,t:"Defining Sales Orders",i:0.00112213205633076,a:"A Sales Order is a request to provide a product. Sales orders typically originate from a customer, but can also originate from another factory or department.  A sales order defines a quantity of product expected by a customer by a date. This equates to a line item on a typical (ERP) sales order.  A ..."},"72":{y:0,u:"../Content/ModelingObjects/Defining_Data_Collection_Definitions_P.htm",l:-1,t:"Defining Data Collection Definitions",i:0.00145054880561364,a:"A Data Collection Definition references a parametric data definition that contains a set of data collection parameters. The data collection parameters are presented to users during transaction processing. The data collection definition and the transaction with which it is used are identified in the ..."},"73":{y:0,u:"../Content/ModelingObjects/Defining_User_Data_Collection_Definitions_P.htm",l:-1,t:"Defining User Data Collection Definitions",i:0.0138700753585673,a:"A User Data Collection Definition contains a set of data collection parameters. These data collection parameters are presented to users during activity completion. User Data Collection  Def is referenced by the activity template that uses it. Each data collection parameter contains a set of data ..."},"74":{y:0,u:"../Content/ModelingObjects/Defining_Priority_Codes_P.htm",l:-1,t:"Defining Priority Codes",i:0.0111920361937362,a:"A Priority Code defines an indicator used to assign a processing priority to a container. Each priority code includes a description and a relative priority value. The application uses the relative priority value to sequence containers for dispatching (independent of the code name or description). ..."},"75":{y:0,u:"../Content/ModelingObjects/Defining_User_Codes_P.htm",l:-1,t:"Defining User Codes",i:0.00135426481460031,a:"User Codes are lists of codes specific to the requirements of each installation and can provide valuable tracking and reporting information. User-defined codes enable you to specify a list of allowable values for a specific field.  Most user codes consist of three attributes: name, description, and ..."},"76":{y:0,u:"../Content/ModelingObjects/Defining_Object_Groups_P.htm",l:-1,t:"Defining Object Groups",i:0.001216107274884,a:"Object Groups are used to create groups of modeling objects such as user codes. There are two types of object groups: Named Object Groups Revisioned Object Groups Named object groups are used to group together user codes or other named data objects, while revisioned object groups are used to group ..."},"77":{y:0,u:"../Content/ModelingObjects/Defining_SMTP_Transports_P.htm",l:-1,t:"Defining SMTP Transports",i:0.00112213205633076,a:"Defining SMTP Transports SMTP Transport is a subclass of Data Transport. The application uses Simple Mail Transport Protocol (SMTP) to send e-mail. This enables the application to send e-mail while configured to run as a Windows service. SMTP virtual host is part of the IIS 6.0 Component Services on ..."},"78":{y:0,u:"../Content/ModelingObjects/Defining_E-mail_Notifications_P.htm",l:-1,t:"Defining E-mail Notifications",i:0.00112213205633076,a:"An E-mail Notification defines the recipient of a message that originates during processing of a transaction. It also describes the e-mail profile and additional  information. E-mail Notification is a subclass of Notification Target. When Defining an E-mail Notification E-Mail Notification is an ..."},"79":{y:0,u:"../Content/ModelingObjects/Defining_Sites_P.htm",l:-1,t:"Defining Sites",i:0.00209549743147946,a:"A Site is an independent Opcenter EX MDD or Opcenter EX CR entity within a manufacturing organization. While a factory is a physical facilities concept, a site is the name of an installation of Opcenter EX MDD or Opcenter EX CR containing an Application Server. The name is used by other applications ..."},"80":{y:0,u:"../Content/ModelingObjects/Defining_Text_Variables_P.htm",l:-1,t:"Defining Text Variables",i:0.00336029488833337,a:"Text Variables are incorporated into message strings and are used to derive a value at run time. They are used by objects such as WIP messages, history inquiries, and so on. Each Text Variable definition includes a name and an expression and describes how to treat the condition where the expression ..."},"81":{y:0,u:"../Content/ModelingObjects/Defining_User_Labels_P.htm",l:-1,t:"Defining User Labels",i:0.00346841986238684,a:"A User Label is text on the application\u0027s  user interface. Labels include field captions, system messages, and so on. Siemens provides default system labels. These labels are used by applications in Opcenter EX MDD and Opcenter EX CR.  As with most of the application\u0027s configurations, you can take ..."},"82":{y:0,u:"../Content/ModelingObjects/Defining_Dictionaries_P.htm",l:-1,t:"Defining Dictionaries",i:0.00552013252753402,a:"Opcenter EX MDD and Opcenter EX CR enable you to create custom or translated user and system labels for the application. Labels in the application are messages and text, such as displayed field captions, error messages, transaction\ncompletion messages, string selection values, and so on. Custom and ..."},"83":{y:0,u:"../Content/ModelingObjects/Defining_User_Queries_P.htm",l:-1,t:"Defining User Queries",i:0.0142781085909124,a:"A User Query is a predefined query stored as instance data. Note that while the query definition is defined as instance data; the query itself can be used to retrieve information from either instance data tables or metadata tables. The User Query Parameter grid is implemented as a persistent list so ..."},"84":{y:0,u:"../Content/ModelingObjects/Defining_User_Query_Groups_P.htm",l:-1,t:"Defining User Query Groups",i:0.00810427678289569,a:"A User Query Group is a set of user queries. A user query group can be used to narrow the number of user queries available based on your business need. For example, you can define a user query group that contains only those user queries for use when  performing a search for containers in the Portal ..."},"85":{y:0,u:"../Content/ModelingObjects/Defining_UI_Preferences_P.htm",l:-1,t:"Defining UI Preferences",i:0.00112213205633076,a:"A User Interface (UI) Preference enables you to specify the information to display for a container, carrier, or event record in the Status tab on the Manufacturing Audit Trail page. It also enables you to specify the information to display for a resource record in the Status tab on the Resource ..."},"86":{y:0,u:"../Content/ModelingObjects/Defining_Summary_Tables_and_Views_P.htm",l:-1,t:"Defining Summary Tables and Views",i:0.00747807955489462,a:"The Summary Table Definition modeling object is used to configure views and summary tables. Views and summary tables organize data in a logical, summary fashion. Siemens employs these definitions for Business Intelligence (BI) reporting. Summary Tables A summary table is a collection of adjacent ..."},"87":{y:0,u:"../Content/ModelingObjects/Defining_Process_Timer_Types.htm",l:-1,t:"Defining Process Timer Types",i:0.00116817871549567,a:"You can create a Process Timer Type user code that allows you to group, filter, and report on different types of timers. When Defining Process Timer Types Process Timer Type is an optional field in the Process Timer definition. Refer to \" Common Fields on Modeling Pages \" for information on the ..."},"88":{y:0,u:"../Content/ModelingObjects/Defining_Process_Timers.htm",l:-1,t:"Defining Process Timers",i:0.00112213205633076,a:"A Process Timer is a revisioned data object that controls and monitors the manufacturing process by defining actions to take if processing is initiated on a container before a minimum time is met or after the maximum allowable time for the process to execute has passed. Process timers can be ..."},"89":{y:0,u:"../Content/ModelingObjects/Defining_Delegation_Reason_Codes.htm",l:-1,t:"Defining Delegation Reasons",i:0.00116817871549567,a:"Delegation Reasons enable a system administrator to define the reason for delegating a task to another employee. When Defining Delegation Reasons You can define the reason you are reassigning a task from one employee to another by configuring a delegation reason. For example, you can delegate a ..."},"90":{y:0,u:"../Content/ModelingObjects/EProcedure_P.htm",l:-1,t:"Electronic Procedures",i:0.00108523288530683,a:"and Process Computations Electronic procedures and process computations offer a method of viewing and tracking groups of production tasks. An electronic procedure is a revisionable object that enables you to assign a collection of tasks to a specification (spec). A task is a unit of work required to ..."},"91":{y:0,u:"../Content/ModelingObjects/Electronic_Procedures_Definitions_P.htm",l:-1,t:"Electronic Procedures Definitions",i:0.00116210615827336,a:"These definitions are provided to help you understand electronic procedure functionality. Electronic Procedures An Electronic Procedure consists of one or more pre-defined task lists—the steps necessary to complete a spec. When you assign an electronic procedure to a spec, you cannot move a ..."},"92":{y:0,u:"../Content/ModelingObjects/Understanding_Work_Cells_Workstations_and_Groups_P.htm",l:-1,t:"Understanding Work Cells, Workstations, and Groups",i:0.00116210615827336,a:"Work Cells, Workstations, and groups are optional resource and resource group definitions that allow you to further refine your physical model. These optional definitions accommodate two important mechanisms: You can assign task lists to specific workstations at which processing occurs without ..."},"93":{y:0,u:"../Content/ModelingObjects/Processing_Modes_P.htm",l:-1,t:"Processing Modes",i:0.00116210615827336,a:"Electronic procedures accommodate both task-driven processing and workstation-driven processing.  In task-driven processing, the shop floor operator does not select a specific workstation in the Line Assignment fields. In this case, the operator can view and complete the tasks of a given procedure ..."},"94":{y:0,u:"../Content/ModelingObjects/Defining_Workstations_ Work_Cells_and_Groups_P.htm",l:-1,t:"Defining Workstations, Work Cells, and Groups",i:0.00116210615827336,a:"The following procedures enable you to define work cells, work cell groups, workstations, and workstation groups. The basic purpose of defining these entities is to provide detailed tracking of equipment without necessitating Move transactions.  Additionally, work cells, workstations, and their ..."},"95":{y:0,u:"../Content/ModelingObjects/Setting_Up_a_Workstation_or_Work_Cell_Resource_P.htm",l:-1,t:"Setting Up a Workstation or Work Cell Resource",i:0.00116210615827336,a:"Use the Resource Setup transaction to record changes to a workstation or work cell setup to indicate their availability. A resource’s availability determines whether you can use it to perform shop floor transactions. Refer to the Opcenter Execution Medical Device and Diagnostics Shop Floor User ..."},"96":{y:0,u:"../Content/ModelingObjects/User_Constants_and_Computations_P.htm",l:-1,t:"User Constants and Computations",i:0.00116210615827336,a:"The application provides the ability to create and store computational expressions and map those expression variables to a user data collection data point. These computations can then be used while executing an electronic procedure task, and allow the shop floor operator to view the result of the ..."},"97":{y:0,u:"../Content/ModelingObjects/Defining_User_Constants_P.htm",l:-1,t:"Defining User Constants",i:0.00261561422159459,a:"User Constant values can be used in computation expressions if needed. They must first be defined as user constants. User constants allow you to create and maintain constant values which do not change like \"pi,\" or which rarely change. You may have some constants specific to your business process ..."},"98":{y:0,u:"../Content/ModelingObjects/Defining_Computations_P.htm",l:-1,t:"Defining Computations",i:0.00261561422159459,a:"The Computation modeling object allows you to create and maintain process computation definitions for use with EProcedure tasks. You can use the user  constants defined in Modeling when defining these computations. When Defining Computations Use the Opcenter EX MDD or Opcenter EX CR Unified ..."},"99":{y:0,u:"../Content/ModelingObjects/User_Data_Collection_Definition_and_Data_Points_P.htm",l:-1,t:"User Data Collection Definition and Data Points",i:0.00202111852714891,a:"The User Data Collection definition provides a method for establishing data points that can then be associated with a task list for an electronic procedure. A data point represents a point in the production process where data can or must be collected. When defined, multiple data points can be ..."},"100":{y:0,u:"../Content/ModelingObjects/Defining_a_Task_List_and_Related_Tasks_P.htm",l:-1,t:"Defining a Task List and Related Tasks",i:0.0101075286233908,a:"A Task List provides a method for defining a list of tasks to be executed against a spec. You\nspecify whether the tasks must be performed in sequential order. An example of a task list\nis a group of product-measuring tasks related to the electronic procedure User Data\nCollection.\n Understanding ..."},"101":{y:0,u:"../Content/ModelingObjects/Defining_Electronic_Procedures_P.htm",l:-1,t:"Defining Electronic Procedures",i:0.00774444816612745,a:"An Electronic Procedure (EProcedure) is a revisionable object that enables you to assign a collection of tasks to a Specification (Spec). When Defining Electronic Procedures Make sure you have defined one or more task lists before defining an electronic procedure. The application requires you to ..."},"102":{y:0,u:"../Content/ModelingObjects/Assigning_a_Resource_Group_and_an_Electronic_Procedure_to_a_Spec_P.htm",l:-1,t:"Assigning a Resource Group and an Electronic Procedure to a Spec",i:0.00116210615827336,a:"A Spec (Specification) defines the activities carried out at a step and is referenced by a step within a workflow. Many workflow steps can use the same spec. Specs reference many other modeling components including Operation and Setup. Specs also include detailed scheduling and processing parameter ..."},"103":{y:0,u:"../Content/ModelingObjects/WIP_Messages.htm",l:-1,t:"WIP Messages ",i:0.00108523288530683,a:"Introduction Opcenter EX MDD and Opcenter EX CR provide the ability to display messages associated with specific container attributes and with any service. The Work In Progress (WIP) message capability enforces processing and sends special notifications when a container of material reaches a ..."},"104":{y:0,u:"../Content/ModelingObjects/Defining_WIP_Messages_P.htm",l:-1,t:"Defining WIP Messages",i:0.0501168052932237,a:"There are two procedures needed to create WIP Messages: Create the WIP message. Configure the criteria for evaluating WIP messages. Refer to \" Specifying WIP Messages to Evaluate \" for information. You must perform both procedures, but the order does not matter. When a container is started and ..."},"105":{y:0,u:"../Content/ModelingObjects/Copying_and_Deleting_WIP_Messages.htm",l:-1,t:"Copying and Deleting WIP Messages",i:0.00154647252310599,a:"At times you may want to make a copy of a WIP message. Opcenter EX MDD and Opcenter EX CR provide the option of copying the WIP message under a new key type or under the same key type as the original. How to Copy a WIP Message Follow these steps to copy a WIP message:  Open an instance of a modeling ..."},"106":{y:0,u:"../Content/ModelingObjects/Quality_Model_Definitions.htm",l:-1,t:"Quality Model Definitions",i:0.00108523288530683,a:"Quality Model Introduction The quality model portion of the Information Model is used for creating modeling objects related to quality issues, for example the objects used to set up Event Recording. These topics provide information on quality model definitions:"},"107":{y:0,u:"../Content/ModelingObjects/Defining_Message_Categories_P.htm",l:-1,t:"Defining Message Categories",i:0.00932647352493648,a:"A Message Category is a label used to identify groups of  messages displayed on the Concierge and in Message Center. Message categories can be used as search parameters on the Message Center page.   When Defining Message Categories These message categories are provided by default: \tMy Assignments ..."},"108":{y:0,u:"../Content/ModelingObjects/Defining_Portal_Message_Categories_P.htm",l:-1,t:"Defining Portal Message Categories",i:0.0157328523066922,a:"Siemens provides a single Portal Message Category modeling object instance with a Portal installation. The Portal Message Category modeling object allows you to customize the following: Message categories displayed in the Concierge and Message Center Notification types displayed within the message ..."},"109":{y:0,u:"../Content/ModelingObjects/Defining_Approval_Decision_Lists_P.htm",l:-1,t:"Defining Approval Decision Lists",i:0.00112071285744523,a:"The Approval Decision List is used to define the decisions that are presented to designated approvers when the application requires approval for quality record resolution. You associate each decision with a pre-defined decision type (for example, Approved or Rejected).  The application determines ..."},"110":{y:0,u:"../Content/ModelingObjects/Defining_Approval_Templates_P.htm",l:-1,t:"Defining Approval Templates",i:0.0028930976541573,a:"An Approval Template identifies users who need to approve a quality record resolution and specifies a list of possible decisions for those users. Associating an approval template with a resolution ensures the appropriate decision list is presented to the appropriate users at the time of approval.  ..."},"111":{y:0,u:"../Content/ModelingObjects/Defining_Comment_Types_P.htm",l:-1,t:"Defining Comment Types",i:0.00116675951661013,a:"The Comment Type modeling object allows you to define categories for user comments added to a generic or production event. Examples of comment types include Investigation, Disposition, and Containment. The application requires users to select a comment type when adding their comments on the Log tab ..."},"112":{y:0,u:"../Content/ModelingObjects/Defining_Failure_Action_Types_P.htm",l:-1,t:"Defining Failure Action Types",i:0.00116675951661013,a:"A Failure Action Type defines a specific  action (for example, Corrective) that can be performed in response to a specific cause. Action types are assigned to  quality records. When Defining a Failure Action Type Failure Action Type is an optional field in the Failure Action Type Group modeling ..."},"113":{y:0,u:"../Content/ModelingObjects/Defining_Failure_Action_Type_Groups_P.htm",l:-1,t:"Defining Failure Action Type Groups",i:0.0080948199091241,a:"The Failure Action Type Group modeling object enables you to group similar failure action types together. Failure action type groups simplify the selection of failure action types for an event record by narrowing the action types available.  When Defining a Failure Action Type Group You can add ..."},"114":{y:0,u:"../Content/ModelingObjects/Defining_Failure_Modes_P.htm",l:-1,t:"Defining Failure Modes",i:0.00116675951661013,a:"A Failure Mode describes the actual cause of a failure. Failure modes are specified when recording or managing events.  When Defining a Failure Mode Failure Mode contains the optional modeling definitions: Failure Type Failure Severity Failure Mode is an optional field in the Failure Mode Group ..."},"115":{y:0,u:"../Content/ModelingObjects/Defining_Failure_Mode_Groups_P.htm",l:-1,t:"Defining Failure Mode Groups",i:0.0080948199091241,a:"The Failure Mode Group modeling object enables you to define a group of failure modes. It helps simplify the selection of a failure mode by allowing you to group failure modes that represent the actual cause of the failure. Failure mode groups are associated with event classifications and ..."},"116":{y:0,u:"../Content/ModelingObjects/Defining_Failure_Severities_P.htm",l:-1,t:"Defining Failure Severities",i:0.00116675951661013,a:"A Failure Severity defines the severity of a failure during an event.  For example, you can create a succession of severities from minor to critical. Failure severities are specified when recording or managing events and nonconformances. When Defining Failure Severities Failure Severity is an ..."},"117":{y:0,u:"../Content/ModelingObjects/Defining_Failure_Types_P.htm",l:-1,t:"Defining Failure Types",i:0.00116675951661013,a:"A Failure Type is a way to describe the characteristic of the failure as well as to provide a\nway to categorize them.\nExamples of these Failure types are Continuous and Intermittent.  Failure types are specified when recording or managing events and nonconformances. When Defining Failure Types ..."},"118":{y:0,u:"../Content/ModelingObjects/Defining_Cause_Codes_P.htm",l:-1,t:"Defining Cause Codes",i:0.00116675951661013,a:"A Cause Code identifies the root cause for a failure. Examples of cause codes are Operator\nError and Equipment Malfunction. When defined, these cause codes appear in the Cause Code\n list on the shop floor forms. When Defining a Cause Code Associating an NCR Resolution Code Group with a cause code ..."},"119":{y:0,u:"../Content/ModelingObjects/Defining_Priority_Levels_P.htm",l:-1,t:"Defining Priority Levels",i:0.0112155923944781,a:"A Priority Level defines an indicator used to assign processing priority to an event.  You can specify a priority level when recording an event and when managing quality records.   When Defining Priority Levels Do not confuse the Priority Level modeling object with the Priority Code modeling object. ..."},"120":{y:0,u:"../Content/ModelingObjects/Defining_Occupations_P.htm",l:-1,t:"Defining Occupations",i:0.00112071285744523,a:"The Occupation modeling object is used to define a specific job — for example, an inspector — to be used when entering a complaint. The  implementation of Opcenter EX MDD or Opcenter EX CR does not use this object; however, the object is available for your use in your custom implementation by ..."},"121":{y:0,u:"../Content/ModelingObjects/Defining_Quality_Record_Resolution_Codes_P.htm",l:-1,t:"Defining Quality Record Resolution Codes",i:0.00116675951661013,a:"A Quality Record Resolution Code indicates the reason for resolving (closing) a quality record. The application requires a quality record resolution code to resolve the quality record. When Defining Quality Record Resolution Codes Resolution codes are required on the Quality Object Resolution page ..."},"122":{y:0,u:"../Content/ModelingObjects/Defining_Report_Templates_P.htm",l:-1,t:"Defining Report Templates",i:0.00746862268112304,a:"A Report Template is used to specify the RPT file to use for your Intelligence reports and charts. Refer to the Opcenter Execution Core Intelligence Reference Guide for information on charts and reports. When Defining Report Templates These rules apply when defining reports: Each instance of a ..."},"123":{y:0,u:"../Content/ModelingObjects/Defining_Triage_Specs_P.htm",l:-1,t:"Defining Triage Specs",i:0.00357427724752661,a:"The Triage Spec modeling object is used to define the default processing values for performing triage on events. It defines the default values to be used during manual triage and the business rules to be applied during automatic triage. The application determines the triage spec to use based on the ..."},"124":{y:0,u:"../Content/ModelingObjects/Defining_Dispositions_P.htm",l:-1,t:"Defining Dispositions",i:0.00112071285744523,a:"The Disposition modeling object allows you to define a method of disposal for materials in lots (containers). Examples of dispositions include Scrap, Rework, and Return to Vendor. Refer to \" Common Fields on Modeling Pages \" for information on the fields common to all modeling objects. How to Define ..."},"125":{y:0,u:"../Content/ModelingObjects/Defining_E-mail_Distributions_P.htm",l:-1,t:"Defining E-mail Distributions",i:0.00746862268112304,a:"The E-mail Distribution modeling object is used to specify the recipients for e-mail notification.  You can configure recipients from one or more of the following categories: External Recipients Role Recipients Employee Recipients When Defining an E-mail Distribution Employee recipients are ..."},"126":{y:0,u:"../Content/ModelingObjects/Defining_E-mail_Messages_P.htm",l:-1,t:"Defining E-mail Messages",i:0.00168559180886556,a:"The E-mail Message modeling object is used to define the messages for e-mail notification. After you save it, the definition will be available for selection in the Organization modeling object.  When Defining an E-mail Message The same e-mail message can be re-used many times. E-mail Message is an ..."},"127":{y:0,u:"../Content/ModelingObjects/Defining_Classifications_P.htm",l:-1,t:"Defining Classifications",i:0.00116675951661013,a:"A Classification is a required indicator for the type of quality record. Classifications are paired with Subclassifications (a related modeling object).  The classification/subclassification combination is specified in the Event Classification Spec Map on the Organization object. Each combination ..."},"128":{y:0,u:"../Content/ModelingObjects/Defining_Subclassifications_P.htm",l:-1,t:"Defining Subclassifications",i:0.00116675951661013,a:"A Subclassification is a required indicator for the type of quality record. Subclassifications are paired with Classifications (a related modeling object).  The Classification/Subclassification combination is specified in the Event Classification Spec Map on the Organization object. Each combination ..."},"129":{y:0,u:"../Content/ModelingObjects/Defining_Response_Sets.htm",l:-1,t:"Defining Response Sets",i:0.00194912732393029,a:"The Response Set modeling object enables you to configure various sets of responses that are presented to users when they are completing a checklist item or answering a checklist question. For example, a response set can include responses such as Yes, No, and Pending, and the set can be assigned to ..."},"130":{y:0,u:"../Content/ModelingObjects/Defining_Checklist_Templates.htm",l:-1,t:"Defining Checklist Templates",i:0.00338991992217883,a:"The Checklist Template modeling object enables you to define a checklist of items (questions or tasks) that you can assign to the following: Organization Triage Spec A checklist ensures a user completes required steps when processing an event. A checklist question or item can be required or ..."},"131":{y:0,u:"../Content/ModelingObjects/Defining_Numbering_Rules_P.htm",l:-1,t:"Defining Numbering Rules",i:0.00112071285744523,a:"A Numbering Rule is a configurable numbering scheme that assigns unique tracking numbers to quality records  and containers. Typically, an organization defines and assigns a numbering scheme to these entities. The application applies the appropriate numbering scheme and assigns the next available ..."},"132":{y:0,u:"../Content/ModelingObjects/Defining_Smart_Scan_Rules.htm",l:-1,t:"Defining Smart Scan Rules",i:0.00746862268112304,a:"A Smart Scan Rule enables you to define data patterns that identify data elements within a scanned barcode. The rule can also be configured with processing instructions for patterns found within a barcode. Understanding Patterns The application uses the pattern or patterns in a Smart Scan Rule to ..."},"133":{y:0,u:"../Content/ModelingObjects/Electronic_Signatures_P.htm",l:-1,t:"Electronic Signatures",i:0.00108523288530683,a:"An Electronic Signature is an electronically stored record that denotes accountability for the performer of a particular activity. Its use is tracked through an audit trail. You use an electronic signature as the equivalent of a handwritten signature. According to the Food and Drug Administration ..."},"134":{y:0,u:"../Content/Modeling ESig/Defining_Roles_for_Electronic_Signatures.htm",l:-1,t:"Defining Roles for Electronic Signatures",i:0.00800057183077439,a:"A Role (created in Opcenter EX MDD or Opcenter EX CR) defines a job function with an inherent set of permissions that grants access to all or to parts of the application. You must create a role for each required electronic signature. Every authorized employee has an assigned set of roles. For a ..."},"135":{y:0,u:"../Content/ModelingObjects/Defining_ESig_Meanings_P.htm",l:-1,t:"Defining Electronic Signature Meanings",i:0.00124658945392153,a:"An Electronic Signature (ESig) Meaning represents the purpose and accountability of a signature. It\nenables you to establish what process is being verified when an electronic signature is applied.\n The ESig Meaning page enables you to define a meaning for each required\nsignature. For example, if you ..."},});