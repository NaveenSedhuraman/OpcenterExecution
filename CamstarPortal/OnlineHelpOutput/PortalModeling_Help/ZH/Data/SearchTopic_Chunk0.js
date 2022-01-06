define({"0":{y:0,u:"../Content/Getting Started/About.htm",l:-1,t:"关于 Siemens Opcenter Execution Medical Device and Diagnostics 和 Siemens Opcenter Execution Core",i:0.00109433867492638,a:"Siemens Opcenter Execution Medical Device and Diagnostics 和 Siemens Opcenter Execution Core 为全球顶级制造商和产品创新者实现快速变化、精益制造、恒定质量输出、快速 NPI 和更高的利润率提供了基础。它提供了一个易于使用的制造执行系统 (MES)，具有质量监控与强化功能，可实现即时可见性与智能性，并可实现与业务系统的互操作性和车间自动化。这些解决方案针对全球使用而构建，能够为实时控制和任务关键作业提供全球范围的可见性。 特征 自动执行制造过程 自我审核、无纸化制造 全球产品、生产、过程仪表板 ..."},"1":{y:0,u:"../Content/ModelingObjects/Modeling_Objects_Introduction.htm",l:-1,t:"建模对象",i:0.00109433867492638,a:"建模对象简介 可从 Portal 的“建模”菜单访问建模对象。可以按字母顺序或按组查看建模对象。按字母顺序视图可用于按字母顺序查看所有建模对象。目前，唯一的组是“所有维护”组，其中还包含所有建模对象。 在 Portal 中，还可以过滤建模对象以限制显示的对象数量。例如，可以对“组”一词进行过滤，仅查看属于已命名对象组或已修订对象组的建模对象。 以下主题提供有关建模对象的信息： 信息模型 建模顺序 平台体系结构 Portal Studio 在 Designer 中建模 建模页 过滤实例列表 访问建模页 复制建模对象实例 查看建模对象实例引用 命名数据对象和修订对象 修订管理 修订版本锁定 ..."},"2":{y:0,u:"../Content/Getting Started/Information_Model.htm",l:-1,t:"信息模型",i:0.00115635332939492,a:"制造信息模型包含描述和控制产品处理活动的数据对象。可以使用应用程序中的“建模”页为每个制造设施构建独特的模型。  熟悉这些建模对象及其要求将有助于计划和创建公司的信息模型。  各制造设施的信息模型由以下组件组成： 物理模型 流程模型 执行模型 预计将在建模流程中重新访问各个组件，直到模型完成为止。在特定模型中如何使用这些组件具有很大的灵活性。 物理模型 物理模型代表制造设施的物理组件，例如： 企业  工厂 组织 员工 角色 资源状态原因 资源状态原因组 资源状态代码  资源状态代码组 资源状态模型 资源类型 资源 资源系列 资源组 物料箱 物料箱系列 物料箱组 物料箱状态代码 物料箱状态原因 ..."},"3":{y:0,u:"../Content/Getting Started/Getting_Started_Modeling_Sequence.htm",l:-1,t:"建模顺序",i:0.00115635332939492,a:"必须按特定顺序创建一些组件，因为建模定义是相互关联的。 要求和可选的建模定义 各建模定义可能取决于另一个定义的预定义。对于各定义，可以包含一个、两个或不含以下内容： 要求的定义 在创建其他定义之前，必须完成一些定义，因为它们是其他定义中的必需字段。例如，在定义工作流程之前必须定义规范，因为该规范是工作流程定义中要求的字段。 可选定义 可选定义在另一定义中是可选字段。例如，在定义工厂之前，先要定义企业，因为企业是工厂定义中的一个字段。然而，由于“企业”字段是可选的，所以不需要提前定义企业。因此，对工厂而言，企业是一个可选的定义。  物理建模顺序 ..."},"4":{y:0,u:"../Content/Getting Started/Camstar_Enterprise_Platform_Architecture.htm",l:-1,t:"平台体系结构",i:0.00770606500704572,a:"该应用程序的平台体系结构的独特之处在于：它使用配置数据（而不是源代码）来定义应用程序对象及其行为。此体系结构的两个基本组件是： 可配置数据对象 可配置逻辑流 可配置数据对象 “可配置数据对象 (CDO)”定义每个对象的数据元素（或字段）并引用 CLF 来实施对象的行为。CDO 和 CLF 的全部特定信息都存储在数据对象中。该应用程序的体系结构能够扩展和修改应用程序且无须更改源代码。 CDO 是一个用户定义的数据结构，分为两个类别： 服务  数据  客户端应用程序通过设置特定字段值与服务 CDO 交互并执行服务。客户端应用程序通过服务中其他字段检索服务的结果。  数据 CDO ..."},"5":{y:0,u:"../Content/Getting Started/Portal_Studio.htm",l:-1,t:"Portal Studio",i:0.00115635332939492,a:"建模页可以在 Portal Studio 中进行定义。Portal Studio 是一个自包含式开发和配置工具，可减少初始安装设置和配置时间，并大大减少对自定义代码的需求。 相较于传统开发工具，Portal Studio 具有以下几个优势： 不需要其他安装或控件。 只需一个浏览器和一个已安装环境的 URL 即可。 Portal Studio 具有内置的源代码控制。 不需要对更改进行编译。  可以即刻进行测试。 在生成 Windows Communication Foundation (WCF) 服务之后，只需对对象模型更改进行一次简单的刷新。 可以从一个简明易懂的平面文件中导入任何 UI ..."},"6":{y:0,u:"../Content/Getting Started/Modeling_in_Designer.htm",l:-1,t:"在 Designer 中建模",i:0.00115635332939492,a:"Designer 是随 Opcenter EX MDD 和 Opcenter EX CR 一同提供的图形应用程序，用于管理 CDO。如前文所述，可以定义和维护工厂信息模型的建模对象或元素。由 NamedDataObjects (NDO) 和 RevisionedObjects (RO) 表示的建模对象，是 Designer 中可配置数据对象 (CDO) 的一部分。 已命名数据对象是由应用程序内唯一名称标识的一类对象。  已修订对象是由应用程序内唯一名称和修订版本标识的一类对象。数据对象实例是永久性的，即有关它们的信息会被写入数据库。  CDO 的实例在建模过程中创建和维护，而对象本身则在 ..."},"7":{y:0,u:"../Content/Getting Started/Modeling_Page.htm",l:-1,t:"建模页",i:0.0167541354264488,a:"通过“建模”页可访问所有建模对象。但是，可能只会显示一部分可用的建模页，具体取决于如何为员工定义设置权限。在此页面中，可以选择建模对象，并在“建模”页中打开该对象的页面。 此图显示“建模”页的示例。 更改管理保存选项 如果使用的是 Change Management，并且至少创建了一个更改管理包，则“建模”页上还会显示一个标识为“更改管理保存”的选项。可以创建和更新建模对象实例，然后使用此选项将它们指派给现有的活动包。有关信息，请参考以下特定于产品的更改管理指南： Opcenter Execution Core Change Management 用户指南 Opcenter Execution ..."},"8":{y:0,u:"../Content/Getting Started/Filtering_List_of_Instances.htm",l:-1,t:"过滤实例列表",i:0.00471708524400769,a:"“过滤器”字段可用于缩小大量建模实例的范围。 输入字符串的片段，然后单击“刷新”以显示名称以该字符串片段开头的实例列表。在“过滤器”字段留空的情况下单击“刷新”可返回所有实例。  如果 Portal 支持该语言，则返回实例的列表将按照首选语言以字母顺序排序。默认情况下，返回实例的列表按英文字母顺序排序。如果已定义实例的数量大于 100，则列表控件将显示在过滤器下方。  Opcenter Execution Core 和 Opcenter Execution MDD ..."},"9":{y:0,u:"../Content/Getting Started/AccessingModelingPages.htm",l:-1,t:"访问建模页",i:0.00564730506103578,a:"所有建模对象页均从“建模”主页访问，而该主页可从“建模”菜单进行访问。应用程序会在“建模”页本身中打开所选的建模对象页。有关“建模”页上的可用功能的完整描述，请参考“ 建模页 ”。  如何访问建模页 按照以下步骤访问建模页： 登录到门户。  如果这是安装后首次登录，则以 CamstarAdmin、InSiteAdmin 或 Administrator 身份登录。  从建模菜单中选择建模。 将显示“建模”页。 单击所有维护箭头以查看该组下建模对象的列表。  或 从对象查看依据列表中选择查看全部（按字母顺序）以按字母顺序显示建模对象的列表。应用程序按字母顺序显示所有建模对象的列表。 ..."},"10":{y:0,u:"../Content/Getting Started/Copying_a_Modeling_Object_Instance.htm",l:-1,t:"复制建模对象实例",i:0.00115635332939492,a:"单击选定建模实例的工具栏上的“复制”和“复制修订版本”按钮时，应用程序显示“复制”或“复制修订版本”弹出窗口。通过单击“复制”或“复制修订版本”弹出窗口或按键盘上的 Enter 键，可以保存新实例或实例修订版本并关闭“复制”或“复制修订版本”弹出窗口。应用程序显示成功消息，指出新建模对象实例已创建。 执行“复制”将创建所选实例的副本，其中包含除实例名称（以及已修订对象的修订版本名称）以外的所有原始信息。应用程序要求在保存已命名数据对象实例之前输入新实例名称，在保存已修订对象之前输入新实例名称和修订值。   ..."},"11":{y:0,u:"../Content/ModelingObjects/Viewing_Modeling_Object_References.htm",l:-1,t:"Viewing_Modeling_Object_References",i:0.00471708524400769,a:"查看建模对象实例引用 可以查看所选实例引用的所有建模对象实例。还可以查看引用在“建模”页上选择的实例的建模对象实例。 即使有“过滤器标记”建模对象实例连接到所选实例，应用程序也不会显示这些实例。“过滤器标记”是一个逗号分隔的列表，不会作为引用附加到对象。 在查看引用的实例时 “层次结构”视图显示所选建模对象实例及其引用的所有实例。单击建模对象实例页上的“层次结构”按钮将显示只读的“层次结构”弹出窗口。“层次结构”弹出窗口显示一个缩进的树视图，其中包含所选对象实例引用的实例。所选实例以加粗黑色字体显示。所引用的实例以普通黑色字体显示。 ..."},"12":{y:0,u:"../Content/Getting Started/Named_Data_Objects_and_Revisioned_Objects.htm",l:-1,t:"命名数据对象和修订对象",i:0.00125111710103367,a:"Opcenter EX MDD 和 Opcenter EX CR 应用程序有两种类型的对象：已命名数据对象和已修订对象。这两种类型都在“建模”菜单中。 在定义已命名数据对象和已修订对象时 不可在对象名中使用无效字符。例如，不可使用撇号。有关信息，请参考以下特定于产品的相应系统设计师用户指南： Opcenter Execution Core Designer 用户指南 Opcenter Execution Medical Device and Diagnostics Designer 用户指南 如果希望应用程序在建模审核追踪中以您的首选语言显示所有更新，则在定义建模对象实例之前设置该首选语言。 ..."},"13":{y:0,u:"../Content/Getting Started/Revision_Management.htm",l:-1,t:"修订管理",i:0.00221984071717071,a:"已修订对象用于表示具有名称和修订版本的对象。使用修订版本功能，可以维护同一个建模定义的多个版本，其中一个修订版本会指定为记录修订版本。最新的修订版本默认指定为记录修订版本，直到您指定另一个修订版本为止。其他修订版本可以是活动状态且可以使用，但在“建模”和车间内当前指定的默认修订版本是“记录修订版本”。 记录修订版本 记录修订版本功能缩减了对模型的维护并确保车间中使用正确的修订版本。  例如，当您构建一个工作流程时，将通过参考规范（或其他工作流程）来创建工序。在参考规范时，必须选择特定的修订版本或记录修订版本。如果您：  参考特定的修订，即使创建了新的修订，工作流程仍始终使用这个修订。  ..."},"14":{y:0,u:"../Content/Getting Started/Revision_Locking.htm",l:-1,t:"修订版本锁定",i:0.00164782061259589,a:"修订版本锁定提供动态锁定或解锁已修订对象实例的功能。它通过锁定图标控制。 安全和基于角色的访问控制 Opcenter EX MDD 和 Opcenter EX Core 的安全管理以基于角色的访问控制模型为基础。安全管理用于设置用户权限，会影响哪些用户可以使用锁定/解锁功能。  有关设置基于角色的访问控制时使用的对象的信息，请参考以下主题： 定义组织 定义角色 定义员工 锁定和解锁实例时 当锁定和解锁已修订对象的实例时，记住： 您不必通过保存实例来锁定或解锁该实例。  在锁定一个实例后，您仍能访问它的字段；然而，您将不能进行保存。 您不能删除锁定的实例。 ..."},"15":{y:0,u:"../Content/Getting Started/Locking_Modeling_Object_Instances.htm",l:-1,t:"锁定更改包建模对象实例",i:0.00115635332939492,a:"Siemens 提供两种类型的建模对象实例锁定： 修订版本锁定   更改包建模锁定 不能修改或删除锁定的更改包建模对象实例。尝试修改或删除锁定的实例时，应用程序将显示错误消息。 修订版本锁定 默认情况下可以使用修订版本锁定。通过修订版本锁定，可以锁定或解锁已修订对象 (RO) 实例。单击实例“建模”页上的锁定图标可锁定和解锁实例。有关信息，请参考“ 修订版本锁定 ”。 更改包建模锁定 Change Management 中可以使用更改包建模锁定功能。通过更改包建模锁定，可以根据包的当前规范（工步）锁定更改管理包中包含的建模对象实例。RO 和 NDO ..."},"16":{y:0,u:"../Content/Getting Started/Understanding_Deleted_Object_References.htm",l:-1,t:"了解删除对象引用",i:0.00115635332939492,a:"删除建模对象将从数据库中移除所有实例信息，但会保留历史信息，以供在建模审核追踪中查看。 如果删除对象被另一建模对象引用，该引用现在是无效的，因为它引用了一个不再可用的实例。您不能保存其字段包含删除引用的建模对象。必须设置对不同建模对象的引用，或在保存之前清除已删除对象引用。 删除对象示例 在维护页选择某个建模对象时，应用程序将显示已删除对象的实例 ID 而不是名称。 例如，如果删除由角色对象引用的角色类型，“角色”维护页上的已删除角色类型引用将显示它的实例 ID。 列表中不显示已删除对象引用。 有关删除对象的警告 在授予删除对象的权限时，需核实具有此权限的员工确实理解删除对象的含义。 ..."},"17":{y:0,u:"../Content/ModelingObjects/PhysicalModelDefinitions.htm",l:-1,t:"物理模型定义",i:0.0021304586581073,a:"物理模型表示制造设备的物理组件，主要是“企业”、“工厂”、“位置”、“组织”、“人员”、“角色”和“资源”。其他对象是“资源组”、“准备”、“文档集”、“文档”、“文档查看器”、“配方”和“工作中心”。  除了“文档集”中要求的“文档”以外，您可以按任意顺序定义这些对象。 在创建建模定义时 创建建模定义时，不可在对象名称中使用无效字符。例如，不可使用撇号。有关信息，请参考以下特定于产品的相应系统设计师用户指南： Opcenter Execution Core Designer 用户指南 Opcenter Execution Medical Device and Diagnostics ..."},"18":{y:0,u:"../Content/ModelingObjects/Defining_the_Enterprise_P.htm",l:-1,t:"定义企业",i:0.00115470404688815,a:"企业是建模层次结构中的最高层次。它可以代表公司本身或公司的一个大型分部。一个企业可以包含一个或多个工厂。 定义企业时 Portal 用户可以在创建事件时将企业指定为发现区域。 注意以下事项： 企业包含可选的建模定义和培训要求组。 “企业”是定义工厂时可以指定的可选字段。 必须定义“站点”以填充“XML 连接代理站点”字段。有关信息，请参考“ 定义位置 ”。 企业页字段定义 此表定义“企业”页的独有字段。 请参考“ 建模页上的公共字段 ”获取有关所有建模对象的公共字段的信息。 如何定义企业 按照以下步骤定义企业： 打开企业页。随即“建模”页中将显示“企业”页。 单击新建。 ..."},"19":{y:0,u:"../Content/ModelingObjects/Defining_a_Factory_P.htm",l:-1,t:"定义工厂",i:0.0106237703618318,a:"工厂是任何具备财务和报告职能的独立分部、部门或组。一个企业可以包含一个或多个工厂。 它通常代表一栋物理制造建筑，但也可以代表公司本身或公司的一个大型分部。 工厂可以包含对企业以及工厂内位置的参考。 在定义工厂时 “SMTP 传输”字段使用简单邮件传输协议 (SMTP) 发送电子邮件。这样当 Opcenter EX MDD 和 Opcenter EX CR 配置为以 Windows 服务来运行时便能够发送电子邮件。 创建事件时，Portal 用户可以将工厂指定为发现区域。 工厂包含可选建模定义“企业”、“制造日历”、“调度规则”、“培训要求组”、“打印队列”、“容器编号规则”、“SMTP ..."},"20":{y:0,u:"../Content/ModelingObjects/Defining_an_Organization_P.htm",l:-1,t:"定义组织",i:0.0304421630543985,a:"组织是具备处理和报告职能的独立业务实体。组织与企业或工厂无关联。 在定义组织时 组织包含以下可选建模定义：  检查表模板 分类  电子邮件通讯组 电子邮件消息  失败模式组 编号规则  所有者 组织 角色 SMTP 传输   子分类 归类规范 用户界面首选项 如果指定这些可选建模定义，则需要某些字段来定义它们。 组织是可在定义“员工”和“角色”时指定的可选字段。 虽然在创建或更新组织时编号规则字段并非必填项，但是必须先为该组织创建相应类别的记录，然后才能创建事件或不合格品。 ..."},"21":{y:0,u:"../Content/ModelingObjects/Defining_Employees_P.htm",l:-1,t:"定义员工",i:0.00342537253514147,a:"员工是指在系统中执行如下活动的用户：维护建模定义、进行查询、管理安全管理和/或执行车间事务。系统管理员使用安全管理功能向员工授予特权，以使他们能够访问这些活动。 员工必须具有 Active Directory 帐户，且员工姓名必须与 Active Directory 登录 ID 匹配。有关用户名的确切语法，请与 Active Directory 系统管理员联系。 可以定义不具有帐户的员工，但这些员工无法登录。可以将它们作为执行容器事务或资源事务的员工加以输入。例如，具有 Active Directory ..."},"22":{y:0,u:"../Content/ModelingObjects/Defining_Roles_P.htm",l:-1,t:"定义角色",i:0.00740558970012568,a:"角色定义具有一组固有权限的工作职能，这些权限用于授权访问门户的全部或部分内容。门户管理员将角色指派给员工，以授权他们访问执行其工作所需应用程序的某些部分。例如，可以定义“制造班次主管”角色，并授予该角色启动容器的权限。 Opcenter EX MDD 和 Opcenter EX CR 提供以下默认角色： 有关为使用 Change Management 的用户提供的其他默认角色的信息，请参考以下特定于产品的相应指南： Opcenter Execution Core Change Management 用户指南 Opcenter Execution Core 系统管理指南 Opcenter ..."},"23":{y:0,u:"../Content/ModelingObjects/Defining_Resources_and_Resource_Setup.htm",l:-1,t:"定义资源和资源准备",i:0.00166825173667994,a:"资源属于制造设备中的物理组件。它们是指制造过程中涉及的机器、设备和人员。在“建模”中定义资源和若干个与资源相关的其他对象。 作为资源定义的一部分，可以设置系统处理资源状态（也称为资源准备）。此组件定义了资源可以进入的状态，以及允许在资源状态更改时从一个资源状态到另一个资源状态的转换。例如，空闲的机器可以转到“停用”或“运行”；状态为“停用”的机器可以转到“修复”或“资格”，或回到“上线”（可用）。 以下主题标识并解释了在环境中定义资源和配置资源状态所需的建模对象：  资源准备定义概述 定义资源状态原因 定义资源状态原因组 定义资源状态代码 定义资源状态代码组 定义资源状态模型 定义资源类型 ..."},"24":{y:0,u:"../Content/ModelingObjects/Overview_of_Resource_Setup_Definitions.htm",l:-1,t:"资源准备定义概述",i:0.00133196256716061,a:"资源准备定义概述 此图表显示定义的资源相关建模对象之间的关系，还显示了与资源准备车间事务的关系。 描述 按照此图表中所示的顺序定义资源相关建模对象。  在准备资源时 资源状态模型就绪之后，可以在“资源准备”页上选择一个资源状态码，此代码随后会限制资源状态原因的选择并进行“可用性”的默认设置。  有关“资源设置”事务的信息，请参考《Opcenter Execution Medical Device and Diagnostics Shop Floor 用户指南》或《Opcenter Execution Core Shop Floor 用户指南》。"},"25":{y:0,u:"../Content/ModelingObjects/Defining_Resource_Status_Reasons_P.htm",l:-1,t:"定义资源状态原因",i:0.00137839560943329,a:"资源状态原因提供了其他级别的详细情况，以说明资源当前状态的原因。例如，发送到修复可以描述修复资源状态的原因。  在定义资源状态原因时 类似的状态原因可能在资源状态原因组中进行分组。“资源状态原因”是“资源状态原因组”建模定义中的可选字段。  请参考“ 建模页上的公共字段 ”获取有关所有建模对象的公共字段的信息。 如何定义资源状态原因 按照以下步骤定义资源状态原因： 打开资源状态原因页。随即“建模”页中将显示“资源状态原因”页。 单击新建。 显示用于定义新实例的空白字段。 在资源状态原因字段中输入状态原因的名称。 根据您的业务需求输入可选信息。请参考“ 建模页上的公共字段 ..."},"26":{y:0,u:"../Content/ModelingObjects/Defining_Resource_Status_Reason_Groups_P.htm",l:-1,t:"定义资源状态原因组",i:0.00142672633879936,a:"“资源状态原因组”包含之前定义的类似资源状态原因的逻辑分组。例如，状态原因校准和修复可以包含在名为设备就绪的组中。  在定义资源状态原因组时 “资源状态原因组”是定义“资源状态代码”和“物料箱状态代码”时的可选字段。 可以将多个条目或组添加到各自的表格。 使用“解决条目”按钮可以显示在此组和所有嵌套组的条目列表中指定的所有值的列表。 资源状态原因组页字段定义 此表定义“资源状态原因组”页的独有字段。 请参考“ 建模页上的公共字段 ”获取有关所有建模对象的公共字段的信息。 如何定义资源状态原因组 按照以下步骤定义资源状态原因组： 打开资源状态原因组页。随即“建模”页中将显示“资源状态原因组”页。 ..."},"27":{y:0,u:"../Content/ModelingObjects/Defining_Resource_Status_Codes_P.htm",l:-1,t:"定义资源状态代码",i:0.00137839560943329,a:"“资源状态代码”描述了可以指派给资源的状态，这些状态包括安装时指派的初始状态以及日后每次状态更改时指派的状态。例如，“可用”、“使用中”和“不可用”。 在定义资源状态代码时 “资源状态代码”是“资源状态代码组”和“资源状态”模型建模定义中的可选字段。 “资源状态代码”是“资源准备”事务中的必需字段。 在定义 OEE 的资源状态代码时 下述功能仅在安装了 Industry Solutions 工作区时可用。有关信息，请参考“ Industry Solutions 工作区 ”。 应用程序必须汇总每个班次的资源状态代码数据才能执行 OEE ..."},"28":{y:0,u:"../Content/ModelingObjects/Defining_Resource_Status_Code_Groups_P.htm",l:-1,t:"定义资源状态代码组",i:0.00142672633879936,a:"“资源状态代码组”包含之前定义的类似资源状态代码的逻辑分组。例如，修复中和计划维护的单个状态代码可以包含在名为修复的状态代码组中。 在定义资源状态代码组时 定义“资源状态模型”时，“资源状态代码组”是“初始状态代码组”字段的必需项。 可以将多个条目或组添加到各自的表格。 使用“解决条目”按钮可以显示在此组和所有嵌套组的条目列表中指定的所有值的列表。 资源状态代码组页字段定义 此表定义“资源状态代码组”页的独有字段。 请参考“ 建模页上的公共字段 ”获取有关所有建模对象的公共字段的信息。 如何定义资源状态代码组 按照以下步骤定义资源状态代码组： ..."},"29":{y:0,u:"../Content/ModelingObjects/Defining_Resource_Status_Models_P.htm",l:-1,t:"定义资源状态模型",i:0.00133196256716061,a:"资源状态模型会标识两个内容： 初始资源状态代码组，将与资源准备事务上单个资源相关联。这意味着在初始设置资源时所选组中的任何资源状态代码都可指派给资源。 有效资源状态代码组，用于定义具有其他状态的资源允许转换的状态。例如，具有状态代码修复中的资源只能指派给属于状态代码组准备的状态。这样，根据定义的模型可以限制资源状态的转换。 在定义资源状态模型时 必须先定义一个或多个资源状态代码组，然后才能定义资源状态模型。资源状态模型包含必需的建模定义：资源状态代码组。 资源状态模型包含以下可选的建模定义： 物料箱状态代码 资源状态代码  ..."},"30":{y:0,u:"../Content/ModelingObjects/Defining_Resource_Types_P.htm",l:-1,t:"定义资源类型",i:0.00157076534276377,a:"“资源类型”会标识与“资源状态模型”关联的设备类型，如正常维护设备。  在定义资源类型时 “资源类型”是“资源和测重器” 可选字段。 “资源类型”包含可选的建模定义“资源状态模型”和“用户界面首选项”。 资源类型页字段定义 此表定义“资源类型”页的独有字段。 请参考“ 建模页上的公共字段 ”获取有关所有建模对象的公共字段的信息。 如何定义资源类型 按照以下步骤定义“资源类型”： 打开资源类型页。随即“建模”页中将显示“资源类型”页。 单击新建。 显示用于定义新实例的空白字段。 在资源类型字段中输入资源类型名称。  根据您的业务需求输入可选信息。有关可选字段的信息，请参考字段定义表。 单击保存。 ..."},"31":{y:0,u:"../Content/ModelingObjects/Defining_Resources.htm",l:-1,t:"定义资源",i:0.00425307836472689,a:"资源标识工厂中的机器、一件设备或任何其他非物质实体。资源的常见用途和最具体的示例为机器。资源与单个工厂关联以定义它们的物理位置。  可以输入在工作流程中每个工步所要使用的资源。然后将此信息合并到对容器的生产量、周期及产量损失的分析中。 可以将资源指派给资源组，后者是一种提供逻辑分组功能的对象组。资源组用于提供有效资源的选择列表以及验证用户输入。 资源是静态建模实体。每个资源都可以有一个资源状态输入项，以追踪定义的每个状态类别的当前状态。此应用程序提供了三种特定状态种类：  “生产”用于确定生产的可用性。  “预防性维护”用于追踪资源的当前预防性维护状态。  ..."},"32":{y:0,u:"../Content/ModelingObjects/Defining_Resource_Families_P.htm",l:-1,t:"定义资源系列",i:0.0032755155835135,a:"资源系列提供了一种根据其属性和业务需求对资源进行分类的方法。可以将资源系列用作各种车间事务的过滤器。 “物料箱系列”是“资源系列”的子类。 有关此建模对象的信息，请参考“ 定义物料箱系列 ”。 在定义资源系列时 资源系列的示例包含以下几个方面： 离心机 测试者 处理程序 “资源系列”是“资源”建模对象中的可选字段。 资源系列包含可选的建模定义“用户界面首选项”。 在定义 OEE 的资源系列时 下述功能仅在安装了 Industry Solutions 工作区时可用。有关信息，请参考“ Industry Solutions 工作区 ”。 ..."},"33":{y:0,u:"../Content/ModelingObjects/Defining_Resource_Groups_P.htm",l:-1,t:"定义资源组",i:0.0017475244453996,a:"资源组是一个代表一组资源的命名对象组子类。对象组用于提供对象列表，例如资源、产品或特定类型的用户代码的列表。这些列表通常用于确认和选择。例如，作业包含对 LossCodeGroup 的引用。此列表中的条目定义容器在作业时执行工作的有效损失（原因）代码。 对象组实例包括特定对象列表和对象组列表。任何给定对象组的对象列表只限于特定类型（或对象列表的任何派生类型）。同样，对象组内的对象组列表只限于相同类型（或对象组列表的任何派生类型）。 以下是已命名对象组的子类示例： 资源组  装运目的地组  用户代码组  “物料箱组”是“资源组”的子类。 有关此建模对象的信息，请参考“ 定义物料箱组 ”。 ..."},"34":{y:0,u:"../Content/ModelingObjects/Defining_Carriers_P.htm",l:-1,t:"定义物料箱",i:0.00115470404688815,a:"物料箱是一种物理实体，如器皿、缸、托盘、桶或一件用于在生产流程中存放物料的设备。最常见的物料箱示例是托盘。存放物料的物料箱在车间四处移动。 在定义物料箱时 可以将容器指派给物料箱。事务始终是在容器上执行，而不是在物料箱上。通过提供物料箱名称，可以查看容器详细信息并在容器上执行事务。 物料箱是“物料箱组”建模定义中的可选字段。可将物料箱指派给物料箱组以提供逻辑分组。物料箱组用于提供有效物料箱的选择列表以及验证用户输入。  物料箱包含以下可选的建模定义：工厂、物料箱系列、供应商、资源类型和资源状态模型。 ..."},"35":{y:0,u:"../Content/ModelingObjects/Defining_Carrier_Families_P.htm",l:-1,t:"定义物料箱系列",i:0.0018508118761566,a:"物料箱系列提供一种根据其属性和用户业务需求，将物料箱分类的方法。可以使用物料箱系列设置维护计划，或将其用作各种车间事务的过滤器准则。每个物料箱可以具有一个物料箱系列，如桶、器皿、托盘等。 在定义物料箱系列时 以下是物料箱系列的示例： 100 L 桶 200 L 桶 玻璃托盘 金属托盘 物料箱系列是“物料箱”建模对象中的一个可选字段。 请参考“ 建模页上的公共字段 ”获取有关所有建模对象的公共字段的信息。 物料箱系列页字段定义 此表定义“物料箱系列”页的独有字段。 请参考“ 建模页上的公共字段 ”获取有关所有建模对象的公共字段的信息。 如何定义物料箱系列 按照以下步骤定义“物料箱系列”： ..."},"36":{y:0,u:"../Content/ModelingObjects/Defining_Carrier_Groups_P.htm",l:-1,t:"定义物料箱组",i:0.00199219413733245,a:"使用“物料箱组”建模对象可以将若干物料箱设为一个组。创建物料箱组使用户可以将该组指派给配方，并提供其中一个物料箱不可用时的替代选择。 在定义物料箱组时 这是物料箱组的示例：玻璃托盘 物料箱组中包含的物料箱：  托盘 1 (100 ML) 托盘 2 (100 ML) 托盘 3 (200 ML) 如果将物料箱组“玻璃托盘”指派给配方，则操作员可以选择组中的任何托盘以执行该配方。如果托盘 1 不可用，则用户仍可以选择托盘 2 来执行任务。 可以将多个条目或组添加到各自的表格。 使用“解决条目”按钮可以显示在此组和所有嵌套组的条目列表中指定的所有值的列表。 物料箱组页字段定义 ..."},"37":{y:0,u:"../Content/ModelingObjects/Defining_Carrier_Status_Codes_P.htm",l:-1,t:"定义物料箱状态代码",i:0.00120113708916083,a:"可以创建了在车间事务中指派和使用的标准化的“物料箱状态代码”。使用标准化的状态代码可以帮助操作员在车间中做出更明智的决定。  在定义物料箱状态代码时 物料箱状态代码必须具有唯一性。以下是物料箱状态代码的示例： 已使用 清洁 已使用但可用 “物料箱状态代码”是“资源状态代码组”建模定义中的可选字段。仅当用户指定了包含物料箱状态代码的资源状态代码组时，“资源状态”建模定义才会引用物料箱状态代码。  “物料箱状态代码”包含可选的“建模”定义：资源状态原因组。 物料箱状态代码页字段定义 此表定义“物料箱状态代码”页的独有字段。 请参考“ 建模页上的公共字段 ”获取有关所有建模对象的公共字段的信息。 ..."},"38":{y:0,u:"../Content/ModelingObjects/Defining_Carrier_Status_Reasons_P.htm",l:-1,t:"定义物料箱状态原因",i:0.00120113708916083,a:"物料箱状态原因提供其他层面的详细信息，以描述物料箱当前状态的原因。例如，灭菌处理失败可以说明物料箱受污染状态的原因。标准化的原因代码可以指派给物料箱，帮助操作员在车间作出更明智的决定。 请参考“ 建模页上的公共字段 ”获取有关所有建模对象的公共字段的信息。 如何定义物料箱状态原因 按照以下步骤定义“物料箱状态原因”： 打开物料箱状态原因页。随即“建模”页中将显示“物料箱状态原因”页。 单击新建。 显示用于定义新实例的空白字段。 在物料箱状态原因字段中输入状态原因的名称。 根据您的业务需求输入可选信息。请参考“ 建模页上的公共字段 ”获取有关可选字段的信息。 单击保存。 ..."},"39":{y:0,u:"../Content/ModelingObjects/Setting_Up_Carriers_P.htm",l:-1,t:"准备物料箱",i:0.00115470404688815,a:"使用“资源准备”事务记录对物料箱准备的更改，或指示物料箱的可用性。物料箱的可用性决定了员工是否可以使用该物料箱执行车间事务。 有关资源设置和可用性的信息，请参考《Opcenter Execution Medical Device and Diagnostics Shop Floor 用户指南》或《Opcenter Execution Core Shop Floor 用户指南》。按此页面上的过程来简单地设置物料箱。 在定义物料箱准备时 准备信息包括对特定物料箱准备定义的引用及所处理的物料箱。 ..."},"40":{y:0,u:"../Content/ModelingObjects/Defining_Document_Viewers_P.htm",l:-1,t:"定义文档查看器",i:0.00115470404688815,a:"文档查看器指定用于查看在 Opcenter EX MDD 或 Opcenter EX CR 中定义的文档的应用程序。文档查看器定义包含应用程序的位置以及启动程序以显示文档的命令行字符串。例如，可以定义使用 Word、Excel 或 Portable Document Format (PDF) 的文档查看器，以查看各种文档。 Opcenter EX MDD 或 Opcenter EX CR 的默认实施不使用此对象；但是，该对象可用于您的自定义实施。 文档查看器页字段定义 此表定义“文档查看器”页的独有字段。 请参考“ 建模页上的公共字段 ”获取有关所有建模对象的公共字段的信息。 ..."},"41":{y:0,u:"../Content/ModelingObjects/Defining_Documents_P.htm",l:-1,t:"定义文档",i:0.00521775478479409,a:"文档实例包含查看外部文档所需的信息。每个定义都包含文档的文件名和修订版本。  可以浏览并上传任何类型的文件，还可以将该文件与文档对象相关联以及为该文件输入任何版本号。如果附加到对象实例的文件已保存到数据库中，则该文件的名称会显示在“存储的文件名”字段中。  还可以将文件下载并保存到最初作为对象实例的一部分上传的数据库。 大多数建模实体都包含对文档的引用。在这种情况下，文档用于提供扩展的（非结构化）信息，例如产品图样、扫描图像、现有的相关制造规范或操作流程。外部文档的每个文档实例 (CDO) 都包含一个标识，例如文件名。  \n            配方  ..."},"42":{y:0,u:"../Content/ModelingObjects/Defining_Recipes_P.htm",l:-1,t:"定义配方",i:0.00337237286943644,a:"配方是一种文档类型。配方定义由配方文件名、位置和可选参数组成。  配方通常定义在制造中使用的资源设置，例如一台机器的计时与温度。一旦定义之后，配方通常都是由资源本身来执行，但有时也未必如此。 必要条件 浏览器必须具有相应的插件才能查看所选配方文档的类型（如 .pdf 文件）。  在定义配方时 这些规则在定义配方时适用： 配方不能与文档同名。例如，如果创建了名为“测试”的文档，则无法再创建名为“测试”的配方。 可以使用“上传文件到数据库”复选框表示将特定文件上传到数据库的时间。通常，在最初定义配方时会选中此复选框。更新现有实例时将该复选框留空，可在无需上传文档的情况下进行更改。 ..."},"43":{y:0,u:"../Content/ModelingObjects/Defining_Document_Sets_P.htm",l:-1,t:"定义文档集",i:0.00148587660883827,a:"文档集是一个或多个文档的集合。文档集由其他建模实体引用，它提供了诸如图样、扫描图像、过程和配方等扩展信息。例如，“准备”定义可以引用包含了工程图样和设置说明这样的文档集。  每个文档 (CDO) 实例都包含外部文档的一个标识（例如文件名或 URL）以及对用于显示文档的程序的引用。 定义文档集时 必须至少将一个文档添加到文档集。如果尚未添加任何文档，应用程序将阻止保存文档集。  在“文档”表格中选择文档，单击“查看文档”按钮查看所选文档。当选择文件时，应用程序启用“查看文档”按钮。 查看文档有助于确保将正确的文档添加到文档集。如果文档未显示在浏览器中，则应确保以下内容： 为文档对象正确定义了 ..."},"44":{y:0,u:"../Content/ModelingObjects/Defining_Setups_P.htm",l:-1,t:"定义准备",i:0.00115470404688815,a:"准备是用于特定流程的物理机器配置。它包含了文档集以及资源的估计准备时间。它是处理特定类型物料（通常是特定产品或引用特定规范的容器）所需资源的配置。  通常“准备”的定义仅包含诸如需要大量时间进行更改的硬盘配置项，而“配方”可以包含很多其他项，比如可立即更改的处理设置。 Siemens 提供的标准“准备”属性包含以下项，比如说明“准备”配置的可应用的文档集，以及配置“准备”所需要的估计时间等。通常，定义“准备”是为了帮助提供排程或派工信息，使用这些信息可以在项目之间不需要大量转换时间的情况下处理容器或订单。  定义准备时 准备包含可选建模定义“文档集”。 “准备”是可选字段： 在“规范”定义中。 ..."},"45":{y:0,u:"../Content/ModelingObjects/Defining_Work_Centers_P.htm",l:-1,t:"定义工作中心",i:0.00115470404688815,a:"工作中心是执行类似包装或质量检验工作的一块物理区域或逻辑分组。在每个“作业”定义中，将作业指派给工作中心。工作中心可能包含或不包含作业。 工作中心是用于执行计划的组件。可根据员工或资源来安排计划。如果作业共享员工和/或资源，则工作中心可具有多个作业。  例如，名为磨碎的作业和名为磨光的作业使用相同的资源，所以它们指向同一个用于计划的工作中心。也有可能一个作业指向一个工作中心。 定义工作中心时 工作中心包含可选的建模定义“调度规则”、“制造日历”、“资源组”和“培训要求组”。 “工作中心” 是“员工”和“作业”定义中的可选字段。 Portal 用户可以在创建事件时将工作中心指定为发现区域。 ..."},"46":{y:0,u:"../Content/ModelingObjects/defining_terminals.htm",l:-1,t:"定义终端",i:0.00115470404688815,a:"终端是由 IP 地址唯一标识的车间计算机。“终端”页可用于定义终端以及为终端配置基于终端的生产线指派设置。当员工已登录到配置的终端时，基于终端的生产线指派设置将替代基于员工的生产线指派设置。 登录到终端的员工将无法更改任何基于终端的生产线指派设置，除非在配置工厂时选中了“允许终端生产线指派替代”。只有在员工与终端建立的当前会话期间可以使用此选项进行更改。请参考“ 定义工厂 ”。 终端页字段定义 此表定义“终端”页的独有字段。  请参考“ 建模页上的公共字段 ”获取有关所有建模对象的公共字段的信息。 如何定义终端 按照以下步骤定义终端： 打开终端页。随即“建模”页中将显示“终端”页。 单击新建。 ..."},"47":{y:0,u:"../Content/ModelingObjects/Defining_Shipment_Destinations_P.htm",l:-1,t:"定义装运目的地",i:0.00115470404688815,a:"装运目的地是容器被送达的工厂或客户。装运目的地还包含装运事务将远程事务发送给目标位置时所使用的路线信息。 定义装运目的地时 装运目的地包含可选的建模定义：  客户  工厂以及为工厂定义的位置 位置 “装运目的地”是以下定义中的可选字段： 作业建模定义 装运目的地组建模定义 RemoteReceive 事务 “装运目的地”是 InventoryTransfer 和“装运”事务中的必填字段。 装运目的地页字段定义 此表定义“装运目的地”页上的字段。 请参考“ 建模页上的公共字段 ”获取有关所有建模对象的公共字段的信息。 如何定义装运目的地 按照以下步骤创建装运目的地： ..."},"48":{y:0,u:"../Content/ModelingObjects/Process_Model_Definitions.htm",l:-1,t:"过程模型定义",i:0.00160886866097841,a:"过程模型定义 流程模型是应用程序的信息模型的控制部分。它包含代表制造工艺流程的对象：容器级别、作业、规范、产品系列、产品、物料清单 (BOM)、ERP 物料清单、ERP 路线、配方列表、主配方和工作流程。有关工作流程建模对象的信息，请参考“ 定义工作流程 ”。 以下主题提供有关物理模型定义的信息： 关于过程模型 定义容器级别 定义作业 定义工艺 定义产品系列 定义产品 定义工艺清单 定义物料清单 (BOM) 和 ERP 物料清单 定义 ERP 路线 定义配方列表 定义主配方"},"49":{y:0,u:"../Content/ModelingObjects/About_the_Process_Model.htm",l:-1,t:"关于过程模型",i:0.00120830449308472,a:"可以认为过程模型定义有以下两种类别： 工作流程定义 产品定义 工作流程定义 工作流定义用于制造产品的步骤顺序。工作流程是建模的基本组成部分，也是制造过程的核心部分。在定义工作流程之前，必须按照列出的顺序定义下列对象： 资源 容器级别 作业 工艺 有关资源的信息，请参考“ 定义资源和资源准备 ”。有关工作流程的信息，请参考“ 定义工作流程 ”。 还以定义 ERP 路线 - 最接近 Opcenter EX MDD 或 Opcenter EX CR 工作流程的 ERP 概念。Opcenter EX MDD 或 Opcenter EX CR 中的 ERP 路线对象旨在反映 ERP ..."},"50":{y:0,u:"../Content/ModelingObjects/Defining_Container_Levels_P.htm",l:-1,t:"定义容器级别",i:0.0435716020982153,a:"容器级别是分配给容器的跟踪标志。它也称作生产量层次。常用的层次名称是宗和批。定义层次是为了满足每家公司特定的需求。某些特定行业的层次比如卷、仓以及盒。 Opcenter EX MDD 和 Opcenter EX CR 提供多层级在制品(WIP) 追踪功能，用于收集并报告详细到任何层级的状态系谱和参数信息。Opcenter EX MDD 和 Opcenter EX CR 使用常规术语容器来标识工作单元。您可以决定与作业相匹配的特定术语，例如，批、宗、盘、罐或序列号。由于应用程序支持多个和无限制的容器级别（容器中的容器），因此可以在任何细节级别定义和追踪产品。 ..."},"51":{y:0,u:"../Content/ModelingObjects/Defining_Operations_P.htm",l:-1,t:"定义作业",i:0.00210146798442827,a:"作业是库存和生产活动被跟踪的制造点或处理点。工作流程工步的规范将引用作业。 作业定义描述了一些项，例如，原因代码、处理规则以及作业过程中物料移动的被允许事务。相反，规范定义作业中执行的处理。 一些作业信息的示例包括： 对记录损失、额外、返工以及装运信息的用户代码的引用 作业的可选标志，如库存、运输中或服务点外 关于允许的事务和不允许的事务的标志 有关是否使用了队列中状态的指示，如果使用了则需要“移入” Portal 用户可以在创建事件时指定作业，以标识检测到事件的制造或处理点。 在定义作业时 作业包含： 必需的建模定义“容器级别”（作为“产出率报表层次”输入）。 ..."},"52":{y:0,u:"../Content/ModelingObjects/Defining_Specs_P.htm",l:-1,t:"定义工艺",i:0.0133501351392294,a:"规范定义了在工作流程或主配方的某个工步中执行的活动，包括详细的计划和处理参数信息。规范将引用许多其他建模组件，包括“作业”、“准备”、“数据收集定义”以及“资源”。 定义工作流程和主配方时，应用程序将要求引用至少一个规范。不同的工作流程和主配方可以多次引用同一个规范。 Portal 用户可以在创建事件时指定规范。 定义工艺时 工艺包含： 必需的建模定义“作业”。 可选的建模定义“业务规则”、“数据收集定义”、“文档集”、“电子流程”、“电子签名要求”、“打印机标签定义”、“配方”、“资源组”、“测重器组”、“设置”以及“培训要求组”。 “测重器组”字段仅在安装了 Batch ..."},"53":{y:0,u:"../Content/ModelingObjects/Defining_Product_Families_P.htm",l:-1,t:"定义产品系列",i:0.00902383579278659,a:"产品系列是共享公共属性（例如工作流程、培训需求和启动数量）的一组产品。为产品系列定义的属性应用于系列中的每个产品。  产品定义中指定的任何属性替代产品的关联产品系列定义中指定的属性。  产品系列通过定义一组产品而不是每个产品的通用数据来简化产品信息维护。每个产品都可以属于一个产品系列，但一件产品只能指派给一个系列。可以在定义产品时将产品指派给产品系列。有关将产品指派给产品系列的信息，请参考“ 定义产品 ”。 产品系列组是与对象组不同的概念。对资源和用户代码等对象进行分组，以进行验证和报告。此外，一个对象可以属于多个组，且对象组可能包含其他对象组。  优先级规则 ..."},"54":{y:0,u:"../Content/ModelingObjects/Defining_Products_P.htm",l:-1,t:"定义产品",i:0.0166197761269403,a:"产品是工厂或工厂外的供应商生产的物料。产品可以是成品，配件和组件。每个产品定义包含两类基本信息：描述产品的数据以及提供默认处理信息的数据，该默认处理信息在启动新产品容器时使用。  在产品定义中提供以下数据（如果您的业务规则有此要求）后，无需在每次开始此产品容器时输入这些数据： 工作流程 开始数量 次要开始数量 计量单位 次要计量单位 客户 测重器组 “测重器组”字段仅在安装了 Batch Processing 时出现。有关信息，请参考 \" Batch Processing \"。 这些信息（除“客户”外）将替代在产品系列级上所作的任何设置。（未在产品系列级别设置客户。） ..."},"55":{y:0,u:"../Content/ModelingObjects/Defining_Bills_of_Process_P.htm",l:-1,t:"定义工艺清单",i:0.0016860327943547,a:"使用工艺清单 (BOP) 可以根据用户的规范定义，修改制造工艺的默认行为。 工艺清单是一个已修订对象，它使用 Opcenter EX MDD 或 Opcenter EX CR 建模建立。创建后，用户可以使用“工艺清单指派”列表将工艺清单指派给容器、制造订单或产品。指定后，工艺清单将替代规范。 用户可以在创建工艺清单后对其进行修改，或查看工艺清单的详细信息，无需使用此函数的进行更改。 在定义工艺清单时 在多个规范工步、同一工作流程或跨工作流程多次使用某工艺清单时，该替代将应用于规范中的所有工步。 可以使用工艺清单替代规范中的以下字段： 文档集  电子流程 电子签名事务映射 标签事务映射 配方文件 ..."},"56":{y:0,u:"../Content/ModelingObjects/Defining_Bills_of_Material_P.htm",l:-1,t:"定义物料清单 (BOM) 和 ERP 物料清单",i:0.00432362737225264,a:"所制造的产品是使用列举并明确定义的原材料和配件的列表来构建的。这些列表称作物料清单。清单 CDO 有助于收集物料清单。存在两种清单对象： 物料清单 (BOM) - 定义生产特定产品（成品或配件）所需的物料（组件和数量）。产品定义引用物料清单。 企业资源规划 (ERP) 物料清单 - 参考 ERP 路线中的工步，而非参考 Opcenter EX MDD 或 Opcenter EX CR 工作流程中的工步。它是 Opcenter EX MDD 或 Opcenter EX CR 与 ERP 系统之间的链接。 定义物料清单时 物料清单包含可选的建模定义“物料类型”、“产品”和“工艺”。 ..."},"57":{y:0,u:"../Content/ModelingObjects/Defining_ERP_Routes_P.htm",l:-1,t:"定义 ERP 路线",i:0.00479841488184845,a:"ERP 路线工步是最接近 Opcenter EX MDD 或 Opcenter EX CR 工作流程的 ERP 概念。Opcenter EX MDD 或 Opcenter EX CR 工作流程和制造订单中都会引用 ERP 路线。工作流程引用 ERP 路线，以使各个工作流程工步可以引用 ERP 路线工步。这通常对 ERP 里程碑或库存点执行。制造订单引用 ERP 路线，以使物料列表项可以引用在其中分发组件的 ERP 路线工步。    在定义 ERP 路线时 ERP 路线是组件分发事务的必需对象，用于将制造订单物料列表项链接到工作流程。  ERP 路线用于将 Opcenter EX MDD 或 ..."},"58":{y:0,u:"../Content/ModelingObjects/Defining_Recipe_Lists_P.htm",l:-1,t:"定义配方列表",i:0.00130949654695004,a:"配方列表（可修订的对象）是完成主配方中某个工步的过程。配方列表由完成工步所需的一个或多个任务组成。应用程序要求在定义主配方时至少指定一个配方列表。配方列表的示例是一组与“主配方”相关的产品测量数据收集任务。有关信息，请参考 定义主配方 。 了解任务 任务指的是要求在物料容器的规格中完成的工作单元。可以按照逻辑将任务分组到配方列表中，并为“主配方”指派一个或多个“配方列表”。将配方列表标记为“顺序”时，配方列表会强制执行定义的任务顺序。任务是合格还是不合格，取决于收集的数据或车间操作员的决策。 任务项类型 可以在添加任务项时选择任务项类型。 用户常量和计算也在建模中定义。有关信息，请参考“ ..."},"59":{y:0,u:"../Content/ModelingObjects/Defining_Master_Recipes_P.htm",l:-1,t:"定义主配方",i:0.0155103332559546,a:"基于 S88 配方模型的主配方是可修订对象，其中包含生产一批物料所需的所有信息。主配方是在启动某个批次时指派给该批次的一个或多个流程（配方列表）的集合。  在定义主配方之前 定义主配方之前，必须定义以下一项或多项： 配方列表 工艺 此外，可能还需要根据需求定义以下实体： 产品 计量单位 工作流程 在定义主配方时 创建主配方时，应用程序要求指定至少一个配方列表。 将配方列表添加到主配方时，应用程序要求将该配方列表与规范相关联。\n\n 可以多次将同一个配方列表添加到主配方列表，但每次都必须将该配方列表与不同的规范相关联。应用程序不允许在同一个规范中保存具有同一个配方列表的多个副本的主配方。 ..."},"60":{y:0,u:"../Content/ModelingObjects/Workflows.htm",l:-1,t:"定义工作流程",i:0.00270478674927845,a:"定义工作流程 工作流是建模的基础组件。工作流程定义是用于制造产品的一组有序工步。工步序列指示容器必须移经的路线以及必须记录的数据。并不是全部的产品都需要工作流程。例如，原材料或包装组件有产品定义但可能没有与之相关的工作流程。  工作流程的属性取决于您所确立的建模定义。因此，在着手开发工作流程之前，必须先创建最小量的建模定义。可以用这些建模定义作为工作流程的基本元素。 以下主题提供有关定义工作流程的信息： 了解工作流 设计工作流程 使用路径选择器"},"61":{y:0,u:"../Content/ModelingObjects/Understanding_Workflows_P.htm",l:-1,t:"了解工作流",i:0.00876472889533344,a:"工作流程是用于制造产品的工步顺序。产品定义可以引用定义制造产品所需的路线和处理的默认工作流程。工作流程可以包含多个元素： 工步 路径 路线 子工作流程 工步 工步定义工作流程中该点的处理。每个工步都引用一组指示，这些指示可能包括以下内容的组合： 要由员工执行的任务 在该工步处理容器时必须发生的事件 每个工步引用一个规范或另一个工作流程（子工作流程）。规范是一个已修订对象，定义工步中执行的活动。规范包括如何执行工作的处理指示。有关规范的信息，请参考“ 定义工艺 ”。 工作流程工步是指在工作流程或子工作流程中，通过规范指明单独工作流程的工步。 ..."},"62":{y:0,u:"../Content/ModelingObjects/Designing_Workflows_P.htm",l:-1,t:"设计工作流程",i:0.00876472889533344,a:"在“工作流程”页上的“工作流程图”部分，可以查看、设计和修改工作流程。可以通过将规范或工作流程的修订版本拖动到图上来添加工步。通过选择工步上的路径图标并拖动到工作流程中的下一工步来添加路径。 在定义工作流程时 应用程序使用规范名称作为工作流程工步和新添加工步的路径的默认名称。例如，如果添加了“装运”规范作为工步，则工步和工步路径的名称都为“装运”。重命名工步和路径有助于区分工步和规范以及明确路径。可以将“装运”规范工步重命名为正在装运，并将路径重命名为目标装运。  将先前已定义的工作流程添加到当前工作流程时，同样的原则也适用。添加的工作流程将成为子工作流程，并根据添加的工作流程命名。 ..."},"63":{y:0,u:"../Content/ModelingObjects/Path_Selectors_P.htm",l:-1,t:"使用路径选择器",i:0.0061504677687485,a:"路径从一个工步指向下一个工步。多数情况下，工作流程工步间的容器可能有多条路径。路径选择器基于指定的条件提供这些备选路径。这意味着路径选择器是默认路径的替代形式，在沿着默认路径继续前进之前，应用程序将检查路径选择器。  每个路径选择器语句包含一个表达式，针对与容器相关联的值来判断此表达式的值。路径选择器基于具有布尔返回值的表达式。如果表达式为真，则沿着指定的备选路径移动容器。  路径选择器运算符 表达式支持以下各组运算符（优先级由高至低）。 不支持的作业 乘法 (%) 逻辑（与、非、或） 需记住的要点 表达式的处理要区分大小写。 忽略所有的空格符。 字符串必须在双引号内。 ..."},"64":{y:0,u:"../Content/ModelingObjects/Execution_Model_Definitions.htm",l:-1,t:"执行模型定义",i:0.00109433867492638,a:"信息模型的执行组件跟踪车间内产品及资源的状态和历史，并且提供生产活动的实时视图。 Opcenter EX MDD 和 Opcenter EX CR 提供全面的生产管理、产量、资源利用率和设备状态信息。通过此信息，不仅管理人员和操作员甚至连供应链中的关键成员，都能够清晰地进行决策，降低生产成本和提高效率。Opcenter EX MDD 和 Opcenter EX CR 可以单独运行，也可以与其他工厂、ERP 或供应链系统集成。创建（启动）批次然后跟踪车间内的处理过程。Opcenter EX MDD 和 Opcenter EX CR 追踪整个生产流程中的容器和资源。 ..."},"65":{y:0,u:"../Content/ModelingObjects/Defining_Customers_P.htm",l:-1,t:"定义客户",i:0.00196797140047877,a:"客户是接受货物和服务的实体。客户通常是另一个公司或企业的另一个工厂或部门。可以为特定的客户指定产品定义。 在定义客户时 “客户”是“产品”和“装运目的地”定义中以及“开始”和“容器维护”事务中的可选字段。  如果客户定义与容器定义中的字段相关联，它可以具有相关的 WIP 消息。有关信息，请参考“ 定义 WIP 消息 ”以及《Opcenter Execution Medical Device and Diagnostics Shop Floor 用户指南》或《Opcenter Execution Core Shop Floor 用户指南》。 客户页字段定义 此表定义“客户”页的独有字段。 ..."},"66":{y:0,u:"../Content/ModelingObjects/Defining_Vendors_P.htm",l:-1,t:"定义供应商",i:0.00754077184874274,a:"供应商是产品和服务的提供者，例如： 用来制造产品的组件和子装配 购买后用于转售的产品 非生产性物料 诸如资源和建筑维护的服务 供应商定义也包含供应商提供的产品（项）的列表。可从已购买产品定义中引用供应商项来表示提供产品的供应商。 定义供应商时 “供应商” 是产品定义中的可选字段。 供应商页字段定义 此表定义“供应商”页的独有字段。 请参考“ 建模页上的公共字段 ”获取有关所有建模对象的公共字段的信息。 如何定义供应商 按照以下步骤定义供应商： 打开供应商页。随即“建模”页中将显示“供应商”页。 单击新建。 显示用于定义新实例的空白字段。 在供应商字段中输入供应商的名称。 ..."},"67":{y:0,u:"../Content/ModelingObjects/Defining_Manufacturing_Calendars_P.htm",l:-1,t:"定义制造日历",i:0.00252432933370397,a:"制造日历用于将事务的时间戳转换为特定的制造日期和班次。 定义制造日历时 Siemens 提供两种方法用于向制造日历添加班次。可以导入具有班次信息的 Excel 文件，也可以手动添加每个班次。手动添加班次信息时，需要输入每天的每个班次。 向现有日历添加新班次时，应用程序要求导出日历，手动添加班次，然后重新导入日历。 应用程序不要求输入班次开始日期和结束日期。但是，如果输入了其中一个日期，则应用程序要求同时输入这两个日期。例如，如果输入了班次开始日期和时间，则应用程序要求输入班次结束日期和时间。 ..."},"68":{y:0,u:"../Content/ModelingObjects/Defining_Shifts_P.htm",l:-1,t:"定义班次",i:0.00113154746760751,a:"对于在某个特定时间开始和结束工作的工人，班次是一种将基于管理责任的生产信息进行分组的机制。班次通常适用于具有不同工人群体的制造公司，这些工人的上下班时间是不同的。例如，“白班”班次的工作时间可能从凌晨 6:00 到下午6:00，“夜班”班次的工作时间可能从下午 6:00 到凌晨 6:00。     在定义班次时 “班次”是“制造日历”中的可选字段。但是，必须先将班次和团队添加到“制造日历”中后，才能导入 Excel 电子表格。 请参考“ 建模页上的公共字段 ”获取有关所有建模对象的公共字段的信息。 如何定义班次 按照以下步骤定义班次： 打开班次页。随即“建模”页中将显示“班次”页。 单击新建。 ..."},"69":{y:0,u:"../Content/ModelingObjects/Defining_Teams_P.htm",l:-1,t:"定义团队",i:0.00113154746760751,a:"团队用以分组生产信息，是班次的备用方法。例如，计划在星期一到星期四工作的“白班”和“夜班”班次可能被指派给“红色”团队，而在星期五到星期日工作的白班和夜班班次将被指派给“蓝色”团队。  在定义团队时 “团队”是“制造日历”中的可选字段。但是，必须先将班次和团队添加到“制造日历”中后，才能导入 Excel 电子表格。 请参考“ 建模页上的公共字段 ”获取有关所有建模对象的公共字段的信息。 允许团队签入至多个工作区域 仅当安装 Medical Device 时下述功能才可用。有关信息，请参考“ Medical Device 工作区 ”。 ..."},"70":{y:0,u:"../Content/ModelingObjects/Defining_Manufacturing_Orders.htm",l:-1,t:"定义制造订单",i:0.0052759303188795,a:"制造订单是制造产品的请求。制造订单通常源于完成一笔销售订单或库存需要，并且常是 MES 和 ERP 系统之间的链接。 制造订单可包含一系列产品容器。容器与制造订单的可选关系是在容器的数据记录中建立并维护。制造订单利用这些信息向 ERP 系统提供 WIP 状态及 WIP 更新。 此外，可以为制造订单指派自定义属性和动态属性，应用程序会在启动容器时指派这些用户定义的属性。在容器本身中存储信息后，您和其他用户不必在容器的历史中搜索信息。 了解用户定义的属性 有关用户定义的属性的信息，请参考“ 了解用户定义的属性 ”。 有关在容器启动时指派用户定义的属性的信息，请参考“ 当容器启动时指派用户定义的属性 ..."},"71":{y:0,u:"../Content/ModelingObjects/Defining_Sales_Orders_P.htm",l:-1,t:"定义销售订单",i:0.00113154746760751,a:"销售订单是提供产品的请求。销售订单通常来自客户，但也可能来自另一家工厂或部门。  销售订单定义在具体日期客户所期望的产品数量。这相当于典型的 (ERP) 销售订单中的行项。在启动或更新容器时，可以选择性地将销售订单指派给容器。这样便提供了将 WIP（容器）与客户订单相关联的机制。 销售订单可以包含与之相关的容器的列表。容器与销售订单的可选关系在容器的数据记录中建立并维护。 定义销售订单时 销售订单包含可选的产品和 UOM 建模定义。 “销售订单”是“启动 - 两级”、“容器维护”和“订单调度”事务中的可选字段。 销售订单页字段定义 此表定义“销售订单”页的独有字段。 请参考“ ..."},"72":{y:0,u:"../Content/ModelingObjects/Defining_Data_Collection_Definitions_P.htm",l:-1,t:"定义数据收集定义",i:0.00146272002955762,a:"数据收集定义参考参数数据定义，包含一组数据收集参数。数据收集参数在事务处理过程中提供给用户。数据收集定义和共同使用的事务在与用于收集数据的工步相关的规范定义中标识。 数据收集服务器建议  如果实施大量事务，可以考虑在集群外将一个服务器专用于数据收集，如下图所示。 创建任何数据收集定义实例前，必须先使用“数据收集向导”（推荐）或 Designer 对参数数据定义进行定义。然后在数据收集定义的“数据收集类型”(Data Collection Type) 字段中参考参数数据定义的名称。  定义数据收集定义时  定义 Portal Shop Floor 页的数据收集定义时，必须指定数据收集类型并选择 ..."},"73":{y:0,u:"../Content/ModelingObjects/Defining_User_Data_Collection_Definitions_P.htm",l:-1,t:"定义用户数据收集定义",i:0.0139863382164354,a:"用户数据集定义包含一组数据收集参数。这些数据收集参数在活动完成期间呈现给用户。 用户数据收集定义由使用它的活动模板引用。 每个数据收集参数都包含一组数据点。数据点表示业务流程中可以或必须收集数据的点。一旦定义完成，多个数据点可在一个用户数据收集定义中分组。 用户数据收集定义有助于捕获作为活动一部分的数据，可以选择按照数据点定义中所定义的上限和下限进行验证。 例如，可以指定值数据点（比如布尔值）。在这种情况下，上部和下部数据点应相同，并且该值之外的任何内容都将导致收集任务失败，该失败会记录在历史中。  或者，可以指定对象数据点。对象数据点有助于在引用流程模型中的特定活动时捕获数据。   ..."},});