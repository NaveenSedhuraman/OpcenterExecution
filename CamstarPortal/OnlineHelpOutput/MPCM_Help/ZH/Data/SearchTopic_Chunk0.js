define({"0":{y:0,u:"../Content/GettingStarted/About.htm",l:-1,t:"关于 Camstar Enterprise Platform",i:0.00722462255608419,a:"关于 Siemens Opcenter Execution Medical Device and Diagnostics 和 Siemens Opcenter Execution Core Siemens Opcenter Execution Medical Device and Diagnostics 和 Siemens Opcenter Execution Core 为全球顶级制造商和产品创新者实现快速变化、精益制造、恒定质量输出、快速 NPI 和更高的利润率提供了基础。它提供了一个易于使用的制造执行系统 ..."},"1":{y:0,u:"../Content/GettingStarted/Change_Management_Overview.htm",l:-1,t:"Camstar Change 概述",i:0.00722462255608419,a:"更改管理概述 更改管理是一个帮助制造商管理其产品和工艺定义的更改生命周期的制造工艺。 通过更改管理，组织可以将建模对象从一个系统导出，然后导入到另一系统中。例如，组织可以将建模对象从其测试系统导出，然后将这些对象导入到其生产系统中。  通过创建更改管理包开始更改管理流程。更改管理包是要从源系统部署到一个或多个目标系统的所有建模对象实例和参考的集合。在创建包时必须指定包的所有者、创建包的原因以及更改管理工作流程。 这些主题提供了有关在应用程序中管理更改的常规信息： 配置更改管理 了解更改管理包权限 了解默认更改管理工作流程 了解更改控制实施 了解审批通知 了解内容协同 包信息 查看文档 附加文档 ..."},"2":{y:0,u:"../Content/GettingStarted/Configuring_Change_Management.htm",l:-1,t:"配置更改管理",i:0.0139797734566855,a:"必须在建模中配置更改管理，然后才能开始创建和部署更改管理包。有关更改管理建模对象实例的信息，请参考《  Opcenter Execution Medical Device and Diagnostics Modeling 用户指南》或《  Opcenter Execution Core Modeling 用户指南》。 以下列表说明了在配置更改管理时必须执行的特定任务： 确保源服务器和目标服务器上有有效的 SSL 证书。 定义一个或多个包创建原因建模对象实例。在创建包时，应用程序会要求选择包创建原因。 ..."},"3":{y:0,u:"../Content/GettingStarted/Understanding_Change_Management_Package_Permissions.htm",l:-1,t:"了解更改管理包权限",i:0.0125724292007001,a:"这些权限用于确定登录用户可以对更改管理包执行的操作： 页面权限 事务权限 允许的事务权限  指派给包的更改管理工作流程 页面、事务和允许的事务权限指派给角色。角色指派给员工和更改管理规范。更改管理规范指派给更改管理工作流程。 有关定义这些建模对象的信息，请参考《  Opcenter Execution Medical Device and Diagnostics Modeling 用户指南》或《  Opcenter Execution Core Modeling 用户指南》： 角色 员工 更改管理规范 更改管理工作流程 有关更改管理安全管理的信息，请参考《  Opcenter ..."},"4":{y:0,u:"../Content/GettingStarted/Understanding_Change_Mgt_Workflows.htm",l:-1,t:"了解默认更改管理工作流程",i:0.0192577537230756,a:"Siemens 默认提供三个更改管理工作流程，可用来立即开始部署更改管理包。  无需审批 - 用于从源系统部署更改管理包，而无需对包进行审批。   Camstar - 需要先对更改管理包进行审批，然后才能从源系统进行部署。选择此选项将启用“更新包”页上的“审批者”选项卡，用于查看审批模板和指派的审批者。 PLM - 更改管理包必须有产品生命周期管理 (PLM) 审批决策，才能从源系统进行部署。 ..."},"5":{y:0,u:"../Content/GettingStarted/Understanding_Change_Control_Enforcement.htm",l:-1,t:"了解更改控制实施",i:0.00783872718341159,a:"Siemens 提供对更改管理包中包含的所有或部分建模对象实施更改控制的功能。存在两种类型的更改控制实施： 对任何工作流程内的包中的实例实施 - 可以将建模对象实例指派给与任何更改管理工作流程关联的包。 对包含审批工步的工作流程内的包中的实例实施 - 可以将建模对象实例指派给与包含审批工步的更改管理工作流程关联的包。 应用程序只允许对每个建模对象执行一种类型的更改控制实施。 设置更改控制实施 必须定义主数据目录才能实施更改控制。主数据目录用于指定： 需要包含在更改包中的建模对象实例，以及 是将实例包含在任何更改包中，还是仅包含在具有审批工步的包中。 ..."},"6":{y:0,u:"../Content/GettingStarted/UnderstandingApprovalNotifications.htm",l:-1,t:"了解审批通知",i:0.0104997897519196,a:"应用程序可以向员工发送电子邮件，通知他们更改管理包已准备就绪并可供审批。审批通知仅在包含需要审批的更改管理规范的工作流程上对更改管理包有效。 包所有者可以在“更新包”页上为更改管理包指派审批者。有关为包指派审批者的信息，请参考“ 更新包 ”。 应用程序使用“审批者”表格“名称”列中列出的员工作为电子邮件通讯组列表。在包所有者路由包以进行审批时，指定为包审批者的员工会收到电子邮件。 配置审批通知 系统管理员必须配置 Modeling ..."},"7":{y:0,u:"../Content/GettingStarted/Understanding_Content_Collaboration.htm",l:-1,t:"了解内容协同",i:0.0318732105202431,a:"通过内容协同，包所有者可以将包内容指派工作分配给多个员工（协同者）。包所有者可以指定他们希望协同处理包内容的员工。 在建模中配置内容协同 系统管理员必须配置 Modeling 中特定于更改管理内容协同的某些对象，然后包所有者才能启用协同。必须配置的对象取决于包所有者是否会通过电子邮件向协同者通知协同指派，以及是否使用预定义的协同者模板和全局设置。 有关所有建模对象的信息，请参考《  Opcenter Execution Medical Device and Diagnostics Modeling 用户指南》或《  Opcenter Execution Core Modeling 用户指南》。 ..."},"8":{y:0,u:"../Content/GettingStarted/PackageInformation.htm",l:-1,t:"包信息",i:0.0480840729288047,a:"所选包的信息将显示在更改管理包任务页的顶部。通常，此类信息包括包的核心属性和常规信息。此外，此区域还包括一些图标，单击这些图标可提供其他功能或浮出控件菜单。这些图标提供的选项用于： 查看文档 附加文档 查看包详细信息 查看包的激活影响  查看内容更改历史 应用程序将在用户保存新包时创建包信息。有关信息，请参考“ 创建包 ”。  查看包的核心属性  应用程序会自动填充更改管理页上的核心属性。在“激活搜索”或“包搜索”页上选择的包将确定加载该包的事务页时所显示的属性。  应用程序会使用以下内容填充包信息： 指示包状态的图标  任何描述、所有者、上次更新和工步信息 核心属性字段和图标定义 ..."},"9":{y:0,u:"../Content/GettingStarted/Viewing_Documents.htm",l:-1,t:"查看文档",i:0.0146505465795512,a:"通过 \"文档集\" 图标, 可以查看附加到当前程序包的任何文档。文档提供与包相关的附加信息, 如图像、指令和过程。 查看文档 您可以从 \"更改管理包\" 任务页顶部的 \"包信息\" 标题中访问 \"文档集\" 图标。 单击 \"文档集\" 图标将显示与该包关联的文档的列表。可以从文档集中选择并查看任何文件。应用程序将显示一条消息，询问您在选择文档时是否要打开或保存该文件。 您必须拥有要打开的文档类型的相应软件。例如，必须具有 Microsoft Word 才能查看 Word 文档。 默认浏览器安全设置禁止打开不安全网站上的文档。必须更改设置才能打开不安全的内容。 如何查看文档 按照下列步骤查看文档: ..."},"10":{y:0,u:"../Content/GettingStarted/Attaching_Documents.htm",l:-1,t:"附加文档",i:0.0146505465795512,a:"可以将一个或多个文档附加到包。这些文档提供与包相关的信息，如图像、指示和过程。  将文档附加到包 可以从“更改管理包”任务页顶部的包信息标题中访问“附加文档”图标。单击该图标时，将显示“附加文档”弹出窗口。 附加文档时，考虑以下事项： 在将文档附加到包之前，必须先使用“文档”建模对象在建模中定义文档实例。可以定义要上载到数据库的本地文件或 HTTP 文件（文件将提供指向该文件的超链接）。有关信息，请参考《  Opcenter Execution Medical Device and Diagnostics Modeling 用户指南》或《  Opcenter Execution Core ..."},"11":{y:0,u:"../Content/GettingStarted/Package_Delivery_Service.htm",l:-1,t:"包交付服务",i:0.00783872718341159,a:"Siemens 提供了一个交付服务，用于监视已部署的更改管理包并将其交付给预定义的目标系统。  包交付服务概述 交付服务可分为以下几个阶段： 监视 读取 交付 更新 监视阶段  部署包事务标记要由交付服务提取的包。在“部署包”页上的“每个目标的部署状态”表格中，符合提取条件的包的状态为“进行中”。交付服务根据计划的业务规则查找合格的包。默认的计划的业务规则名为 SBR_DEPLOY，每五分钟运行一次。 必须先从“部署包”页部署包，之后此包才能由交付服务进行交付。有关信息，请参考“ 部署包 ”。 读取阶段 交付服务将查看源系统数据库，并读取包的部署详细信息以确定包的目标系统。 交付阶段 ..."},"12":{y:0,u:"../Content/MPCMPages/Package_Management.htm",l:-1,t:"管理包",i:0.00722462255608419,a:"管理包 可通过 Change Management 执行以下任务： 通过创建包来启动更改管理流程 使用过滤器搜索现有更改管理包，然后对搜索返回的包执行事务 必须具有指派了相应权限的角色，才能使用上述任一选项。 以下主题提供有关管理包的信息： 创建包 搜索包 搜索要关闭、作废或打开的多个包"},"13":{y:0,u:"../Content/MPCMPages/Creating_a_Package.htm",l:-1,t:"创建包",i:0.0537367717199048,a:"在将建模数据和工艺流程的更新从源系统部署到一个或多个目标系统的过程中，创建更改管理包是第一步。 创建包之前 必须在建模中配置更改管理，然后才能创建及部署更改管理包。首先，必须定义以下建模对象： 包创建原因 - 创建包的原因 服务器目录系统 - 包的源和目标系统 如果未定义服务器目录系统，则在打开“创建包”页时，应用程序将显示一条错误消息。 在创建包之前，必须为员工指派具有更改管理权限的角色。创建更改管理包的员工必须具有已指派包创建权限的角色。默认情况下，Siemens 提供具有这些权限的“包创建者”角色。角色将在建模过程中指派给员工。  ..."},"14":{y:0,u:"../Content/MPCMPages/Searching_for_a_Package.htm",l:-1,t:"搜索包",i:0.0231758297408239,a:"应用程序提供了一个功能，用于根据指定的准则搜索和检索更改管理包。可以按员工指派或常规准则进行搜索。“包搜索”功能适用于处于以下默认工步的包： 起草（默认“无需审批”更改管理工作流程） 起草 Camstar（默认 Camstar 更改管理工作流程） 起草 PLM（默认 PLM 更改管理工作流程） 待审批 Camstar（默认 Camstar 更改管理工作流程） 待处理审批 PLM（默认 PLM 更改管理工作流程和默认 MOM PLM 工作流程） 已拒绝 待处理部署 已完成部署 未完成部署 其他工步可由系统管理员进行配置。 ..."},"15":{y:0,u:"../Content/MPCMPages/Searching_for_Multiple_Packages_to_Close_or_Void.htm",l:-1,t:"搜索要关闭、作废或打开的多个包",i:0.012489337786637,a:"应用程序提供了一个功能，用于根据指定的准则搜索和检索多个要关闭、作废或打开的更改管理包。“包搜索（多个）”功能适用于处于以下默认工步的包： 起草（默认“无需审批”更改管理工作流程） 起草 Camstar（默认 Camstar 更改管理工作流程） 起草 PLM（默认 PLM 更改管理工作流程） 待审批 Camstar（默认 Camstar 更改管理工作流程） 待审批 PLM（默认 PLM 更改管理工作流程） 已拒绝 待处理部署 已完成部署 未完成部署 其他工步可由系统管理员进行配置。 搜索要关闭、作废或打开的多个包 ..."},"16":{y:0,u:"../Content/MPCMPages/Package_Tasks.htm",l:-1,t:"执行包任务",i:0.00722462255608419,a:"执行包任务 可通过 Change Management 执行以下任务： 更新现有包 在包处于草稿模式时审核、指派和/或移除更改管理包及其相依项的内容 更新包的工步 - 将包从任何工步移动到当前更改管理工作流程中的任何其他工步 查看将更改包部署到目标系统的影响 部署包 - 应用程序将生成要发送到已定义的目标的更改管理包（包含所有核心属性和指派的实例数据）  查看包的详细信息，包括其核心属性和实例数据 搜索并查看对指派给更改包的实例所做的更改 关闭、作废或打开单个包 关闭，作废，多个包 必须具有指派了相应权限的角色，才能使用上述任一选项。 以下主题提供有关执行包任务的信息： "},"17":{y:0,u:"../Content/MPCMPages/Updating_a_Package.htm",l:-1,t:"更新包",i:0.0812356649487994,a:"可以为尚未部署的现有更改管理包添加和修改核心属性和部署信息。如果包与需要包审批的更改管理工作流程关联，则可以向所选包指派审批者。如果要将包内容指派工作分配给其他员工，则可以指定协同者。可以指定在“更新包”页上做出更改时，应用程序是否更新在其他更改管理包页上显示的核心包属性。    有关创建包的信息，请参考“ 创建包 ”。有关核心属性及其显示在哪些页上的信息，请参考“ 包信息 ”。 更新包 仅当包所处的规范关联了含包更新权限的允许事务时，才能更新该包。例如，默认 DraftPermissions 角色包含包更新权限并与默认的“起草”规范关联。因此，具有相应角色的员工可以更新处于“起草”规范的包。 ..."},"18":{y:0,u:"../Content/MPCMPages/Assigning_and_Reviewing_Package_Content.htm",l:-1,t:"指派和审核包内容",i:0.0853841500869457,a:"可以将建模对象实例和引用分配给在草稿步骤或配置为允许分配和审阅的步骤的任何现有包。通过 \"分配和审阅内容\" 页, 您可以自定义和审阅现有包的内容。 在分配包内容之前 在 \"分配和审阅内容\" 页上可供选择的某些建模对象实例不应分配给要部署到目标系统的包。某些建模对象在目标系统上激活包时可能会导致冲突。   建模不应分配给包的对象 西门子建议您不要将这些建模对象实例分配给包, 以便部署到目标系统。 此外, 选择 \"添加引用\" 可能会自动将这些建模对象添加到对象类型名称网格中。Siemens 建议从该表格中手动移除这些实例，以免出现冲突。 ..."},"19":{y:0,u:"../Content/MPCMPages/Alter_Package_State.htm",l:-1,t:"改变包的工步",i:0.0155609392405251,a:"通过改变包的工步事务，可以将更改管理包移动到包的已指派工作流程中的任何工步。 改变包的工步 工作流程图会根据与“所选包”字段中指定的包关联的工作流程流动态显示。在包创建期间，工作流程与包关联。有关信息，请参考“ 创建包 ”。 工作流程图包含工作流程中的所有工步，其中包括没有传入或传出路径的工步。包的当前工步周围会显示一个红色边框。如果在规范创建期间已输入描述，则将鼠标悬停在工步上方会显示包含工步描述的工具提示。 只能将包的工步改变为同一工作流程内的另一工步。 ..."},"20":{y:0,u:"../Content/MPCMPages/Reviewing_Activation_Impact.htm",l:-1,t:"查看激活影响",i:0.0156032840317905,a:"“激活影响”页用于查看将更改管理包部署到目标系统的影响。  查看激活影响 只能对源系统运行“激活影响”。 “激活影响”页列出在所选目标上激活包之后将要添加或更新的实例。必须单击“查看激活影响”才能查看所选目标的实例。如果仅定义一个目标，则默认情况下，应用程序将在“所选目标”字段中显示目标。  使用“对象类型”字段可按建模对象来过滤实例列表。查看激活影响不会激活或部署包。结果将按对象排序。 “影响”字段显示激活流程是添加还是更新实例数据。   通过“激活包”页上的替代模式设置，可以指定更改管理包中的建模对象实例是否以及如何覆盖目标系统上的建模对象实例。 ..."},"21":{y:0,u:"../Content/MPCMPages/Deploying a Package.htm",l:-1,t:"部署包",i:0.0168566917421459,a:"Siemens 提供了将包含核心属性和实例数据的更改管理包部署到预定义目标系统的功能。 在部署包之前 在包所处的工步中，“部署”必须作为允许的事务，包才符合部署条件。  在包创建期间或在部署包之前更新包时定义部署详细信息。有关信息，请参考“ 创建包 ”和“ 更新包 ”。 部署包 部署过程包含两个异步的步骤： 构建包文档 将包交付到每个目标 单击“部署包”页上的“部署包”选项卡上的“部署”时，应用程序将开始构建包。 “部署包”页包含“部署包”选项卡和“部署状态”选项卡。焦点默认位于“部署包”选项卡上。   ..."},"22":{y:0,u:"../Content/MPCMPages/Package_Details.htm",l:-1,t:"查看包详细信息",i:0.0303729955780888,a:"通过“包详细信息”页，可以查看现有软件包的以下内容： 核心属性 当前和以前的审批周期信息 当前内容协同信息 指派给包的建模对象实例 指派给包的必要条件包 查看包详细信息 可以通过以下方式导航至“包详细信息”页： 在单击包含“包信息”标题的任何页上的“内容”按钮后显示的浮出控件菜单中，单击“包详细信息”按钮。 在“包搜索”或“激活搜索”页的“可用事务”下单击“包详细信息”按钮。 如果在这些页面的任一页上只选择一个包，则在“包搜索（多个）”或“激活搜索（多个）”页上的“可用事务”下单击“包详细信息”按钮。 系统将会自动使用在单击“包详细信息”按钮的页面上选择的包填充“所选包”字段。 ..."},"23":{y:0,u:"../Content/MPCMPages/Viewing_Content_Change_History.htm",l:-1,t:"查看内容更改历史",i:0.0250338212051727,a:"可以从“包搜索”页或包信息页眉部分中的“历史”浮出控件菜单中访问“内容更改历史”页。可以查看对指派给更改包的实例所做的更改，并显示建模实例的前后值，以确保完成了制造流程的所有添加项或更新项。  过滤内容更改历史 单击“搜索”按钮时，应用程序默认显示所有内容更改历史。应用程序还提供过滤器，用于在单击“搜索”按钮时缩小所返回实例的列表范围。 可以使用“选择日期范围”单选按钮来过滤搜索返回的实例，以仅包含在开始时间戳值和结束时间戳值之间更改的实例。开始时间戳由包的创建日期定义，结束时间戳由包的上次部署日期定义。如果尚未部署包，则结束时间戳将设为当前时间和日期。 ..."},"24":{y:0,u:"../Content/MPCMPages/Closing_a_Package.htm",l:-1,t:"关闭包",i:0.0100729437589108,a:"如果具有所有权权限，则可以关闭“包搜索”页上处于“开放”、“已部署”、“已作废”或“已拒绝”状态的单个包。通常在应用程序成功部署包后将其关闭。  关闭包后，无法更新其内容或对其进行部署。无法关闭或作废处于“已关闭”状态的包。 可以关闭“激活搜索”页上处于“开放”或“已作废”包状态的单个包。 如果要选择多个包并同时将其关闭，请参考“ 关闭多个包 ”。 关闭包 在“包搜索”或“激活搜索”页上的“搜索结果”表格中选择某个包并选择“关闭包”时，将显示“关闭包”弹出窗口。可以在“注释”字段中输入最多 255 个字符的相关注释，然后单击“关闭”。 单击“关闭”时，应用程序将执行以下操作： ..."},"25":{y:0,u:"../Content/MPCMPages/Voiding_a_Package.htm",l:-1,t:"作废包",i:0.0168424183637851,a:"如果具有包的所有权权限，则可以在“包搜索”页作废处于“开放”、“已部署”或“已拒绝”状态的单个包。通常会在部署之前作废包。  作废包后，将无法再更新包的内容或部署包。无法作废处于“已作废”或“关闭”状态的包。 在“激活搜索”页上，可以作废包状态为“开放”且激活状态为“等待激活”或“激活未完成”的单个包。 如果要选择多个包并同时将它们作废，请参考“ 作废多个包 ”。 作废包 在“包搜索”页或“激活搜索”页上的“搜索结果”表格中选择一个包并选择“作废包”时，将显示“作废包”弹出窗口。可以在“注释”字段中输入最多 255 个字符的相关注释，然后单击“作废”。 单击“作废”时，应用程序将执行以下操作： ..."},"26":{y:0,u:"../Content/MPCMPages/Opening_a_Package.htm",l:-1,t:"打开包",i:0.0100729437589108,a:"如果具有包所有权权限，则可以在“包搜索”页上打开包状态为“关闭”或“已作废”的单个包。   如果具有包激活权限，还可以在“激活搜索”页上打开包状态为“关闭”或“已作废”的单个包。 如果要选择多个包并同时打开这些包，请参考“ 打开多个包 ”。 打开包 在“包搜索”或“激活搜索”页的“搜索结果表格”中选择某个包并选择“打开包”时，将显示“打开包”弹出窗口。可以在“注释”字段中输入最多 255 个字符的相关注释，然后单击“打开”。 单击“打开”时，应用程序执行以下操作： ..."},"27":{y:0,u:"../Content/MPCMPages/Closing_Multiple_Packages.htm",l:-1,t:"关闭多个包",i:0.0212302372366595,a:"如果具有所有权权限，则可以关闭“包搜索（多个）”页上处于“开放”、“已部署”、“已作废”或“已拒绝”状态的多个包。通常在应用程序成功部署包后将其关闭。  关闭包后，无法更新其内容或对其进行部署。无法关闭或作废处于“已关闭”状态的包。  可以关闭“激活搜索（多个）”页上处于“开放”或“已作废”包状态的多个包。 关闭多个包 在“包搜索（多个）”或“激活搜索（多个）”页上的“搜索结果”表格中选择一个或多个包并选择“关闭所选”时，将显示“关闭包”弹出窗口。可以在“注释”字段中输入最多 255 个字符的相关注释，然后单击“关闭”。 单击“关闭”时，应用程序将执行以下操作： 关闭包并将其置于“已关闭”状态 ..."},"28":{y:0,u:"../Content/MPCMPages/Voiding_Multiple_Packages.htm",l:-1,t:"作废多个包",i:0.0269845684629767,a:"如果具有相应包的所有权权限，则可以在“包搜索（多个）”页作废处于“开放”、“已部署”或“已拒绝”状态的多个包。通常会在部署之前作废包。   作废包后，将无法再更新包的内容或部署包。无法作废处于“已作废”或“关闭”状态的包。 在“激活搜索（多个）”页上，可以作废包状态为“开放”且激活状态为“等待激活”或“激活未完成”的多个包。 作废多个包 在“包搜索（多个）”或“激活搜索（多个）”页上的“搜索结果”表格中选择一个或多个包并选择“作废所选”时，将显示“作废包”弹出窗口。可以在“注释”字段中输入最多 255 个字符的相关注释，然后单击“作废”。 单击“作废”时，应用程序将执行以下操作： ..."},"29":{y:0,u:"../Content/MPCMPages/Opening_Multiple_Packages.htm",l:-1,t:"打开多个包",i:0.0212302372366595,a:"如果具有包所有权权限，则可以在“包搜索（多个）”页上打开状态为“关闭”或“已作废”的多个包。  如果具有激活权限，还可以在“激活搜索（多个）”页上打开包状态为“关闭”或“已作废”的包。 打开多个包 在“包搜索（多个）”或“激活搜索（多个）”页上的“搜索结果表格”中选择一个或多个包并选择“打开所选”时，将显示“打开包”弹出窗口。可以在“注释”字段中输入最多 255 个字符的相关注释，然后单击“打开”。 单击“打开”时，应用程序执行以下操作： 如果在“包搜索（多个）”页上打开包，则使每个包重新回到在关闭或作废之前所处的工作流程、工步和状态。例如，如果包在工作流程的默认“待处理审批 ..."},"30":{y:0,u:"../Content/MPCMPages/RoutingandCapturingApprovals.htm",l:-1,t:"路由和捕获审批",i:0.00722462255608419,a:"路由和捕获审批 Opcenter Execution Medical Device and Diagnostics 和 Opcenter Execution Core 可用于制定和实施正式的更改管理审批流程，这些流程专门用于强制实施规划和监控方法，从而保持质量水平。每个审批流程均完全可配置，由一系列经预定义的审批者组验证的工步或门组成。审批流程为可配置方法，可供用户请求对更改管理包进行审批。 必须具有指派了相应权限的角色，才能使用上述任一选项。 以下主题提供有关路由和捕获审批的信息： 路由包以进行审批 批准包 (Camstar) 审批包 (PLM) 取消审批"},"31":{y:0,u:"../Content/MPCMPages/RoutingforApproval.htm",l:-1,t:"路由包以进行审批",i:0.012522301507995,a:"可在下列情况下路由包以进行审批：  您是包所有者或者是具有所有权权限的用户， 包处于起草工步，并且  已为包指派一个具有审批工步的更改管理工作流程。 在路由包以进行审批之前 确保在路由包之前设置审批通知。必须配置通知，这样审批者就会收到一封电子邮件，通知他们有包需要其审批。有关设置通知的信息，请参考“ 了解审批通知 ”。 目前，只有默认 Camstar 更改管理工作流程中的包审批者才会收到通知。 在路由以审批之前，应用程序需要更改管理包才能满足以下准则： 已指派实例内容 已选择一个或多个目标系统  已为包指派默认 Camstar 更改管理工作流程： 已指派一个或多个审批者，并且 ..."},"32":{y:0,u:"../Content/MPCMPages/ApprovePackageCamstar.htm",l:-1,t:"批准包 (Camstar)",i:0.0136049809650945,a:"在 \"待定审批 Camstar\" 步骤中, 可以批准分配给 Camstar 更改管理工作流的包。  在 Camstar 工作流上审批包时 您必须具有包审批者角色。 审批包 (Camstar) 页有两个选项卡: 批准 \"审批\" 选项卡提供了批准更改管理包的能力。如果您是最后的审批者, 应用程序将记录您的决定并将包移动到下一个适当的步骤。 审批状态 \"审批状态\" 选项卡提供了查看当前和过去审批周期状态的功能, 并查看每个周期中所有包审批者的决策。 记录审批决定时 当审批决定被批准时, 应用程序将更改管理包从待定的审批 Camstar 移动到挂起的部署。当审批决定被拒绝时, 应用程序将包从待定审批 ..."},"33":{y:0,u:"../Content/MPCMPages/ApprovePackagePLM.htm",l:-1,t:"审批包 (PLM)",i:0.00954728571543839,a:"审批包 (PLM) 可以在“待处理审批 PLM”工步中，审批指派给 PLM 更改管理工作流程的包。  审批 PLM 工作流程上的包 必须具有包所有者角色。 PLM 审批决定只有“已审批”和“已拒绝”这两个选项。选择“已审批”会将更改管理包移动到“待处理部署”工步。选择“已拒绝”会将更改管理包移动到“已拒绝”工步。仅需一个“拒绝”审批决定，应用程序即可将包移动到“已拒绝”工步。但是, 在应用程序将包移动到下一步骤之前, 必须接收所有审批决策。 审批包 (PLM) 页字段定义 此表定义“审批包 (PLM)”页上的字段。"},"34":{y:0,u:"../Content/MPCMPages/CancelApproval.htm",l:-1,t:"取消审批",i:0.00954728571543839,a:"无论审批者是否已输入决定，均可取消更改管理包的审批流程。如果满足以下条件，可以取消包审批： 包的工步为“待处理审批 Camstar”或“待处理审批 PLM”，且 用户是包所有者或拥有所有权权限。 取消包审批 “取消审批”页仅显示所选包的核心属性。如果选择一个包，则应用程序将启用“取消审批”按钮。  取消审批会将包返回到可编辑的工步并重置审批流程。例如，应用程序将在 Camstar 更改管理工作流程中的“待处理审批 Camstar”工步中将包返回到“起草 ..."},"35":{y:0,u:"../Content/MPCMPages/Package_Activation.htm",l:-1,t:"激活包",i:0.00722462255608419,a:"激活包 可通过 Change Management 执行以下任务： 使用过滤器搜索已激活的包，然后在目标系统上执行包激活 在目标系统上搜索要关闭、作废或打开的多个包 在目标系统上激活包 必须具有指派了相应权限的角色，才能使用上述任一选项。 以下主题提供有关在目标系统上管理包的信息： 搜索要激活的包 在目标系统上搜索要关闭、作废或打开的多个包 激活包"},"36":{y:0,u:"../Content/MPCMPages/Searching_for_a_Package_to_Activate.htm",l:-1,t:"搜索要激活的包",i:0.0105531171037689,a:"应用程序提供了一个功能，用于根据指定的准则在目标系统上搜索和检索要激活的更改管理包。已部署且状态符合激活条件的包可使用“激活搜索”功能。搜索要激活的包的员工必须具有指派了激活权限的角色，或者必须具有默认“包激活者”角色。角色将在建模过程中指派给员工。  如果想同时选择要关闭、作废或打开的多个包，请参考“ 在目标系统上搜索要关闭、作废或打开的多个包 ”。 搜索要激活的包 首次访问“激活搜索”页时，应用程序将显示可用于过滤的字段和空白的“搜索结果”表格。应用程序会向该选项卡添加过滤器图标，以指示过滤器准则已指定。单击“搜索”按钮可填充“搜索结果”表格。 在搜索包时： 可使用 SQL ..."},"37":{y:0,u:"../Content/MPCMPages/Searching_for_Multiple_Packages_to_Close_or_Void_on_the_Target_System.htm",l:-1,t:"在目标系统上搜索要关闭、作废或打开的多个包",i:0.0134008789811069,a:"应用程序提供了一个功能，用于根据指定的准则在目标系统上搜索和检索多个要关闭、作废或打开的更改管理包。也可以在“激活搜索（多个）”页上选择要关闭、作废或打开的单个包。已部署且状态符合激活条件的包可使用“激活搜索（多个）”功能。在此页上搜索包的员工必须具有指派了激活权限的角色，或者必须具有默认“包激活者”角色。角色将在建模过程中指派给员工。  在目标系统上搜索要关闭、作废或打开的多个包时 首次访问“激活搜索（多个）”页时，应用程序将显示可用于过滤的字段和空白的“搜索结果”表格。  在搜索包时： 可使用 SQL 通配符按包名称搜索。例如，输入 \"%01%\" 时，将返回名称中包含 \"01\" 字符的包。 ..."},"38":{y:0,u:"../Content/MPCMPages/Activating_a_Package.htm",l:-1,t:"激活包",i:0.0138846421929754,a:"通过“激活包”事务，可以将已部署的更改管理包应用于目标系统。  激活包 如果更改管理包中包含与目标系统上的现有实例同名的实例，则激活过程可以覆盖这些现有实例。通过“激活包”页上的替代模式设置，可以指定更改管理包中的建模对象实例是否以及如何覆盖目标系统上的建模对象实例。  包激活过程提供三个替代选项： 中止进程并回滚 - 当激活过程在目标系统上检测到与包中的建模对象实例同名的建模对象实例或发生服务器错误时，激活过程会中止，并且所有已提交和待处理的包激活更改都将回滚。 覆盖实例 - 激活过程覆盖目标系统上与包中的实例同名的任何建模对象实例。 跳过实例 - ..."},"39":{y:0,u:"../Content/MPCMPages/Camstar_Change_in_Portal_Modeling.htm",l:-1,t:"Portal Modeling 中的 Camstar Change",i:0.00722462255608419,a:"建模中的更改管理 如果已拥有更改管理的许可，且至少已创建一个更改管理包并具有相应的角色和权限，则其他功能在建模中可用。可以创建和更新建模对象实例，然后在建模中将它们指派给现有的活动包。  通过每个对象页上的其他选项卡，可以查看与实例关联的包的数量信息，以及该实例是否由包锁定。通过“建模”页工具栏上的其他按钮，可以从建模内查看包关联。如果具有包所有权权限，则还可以在建模中添加或移除包关联。 以下主题提供了在建模中使用更改管理的相关信息： 在建模中将建模对象实例指派给包 查看建模对象实例的更改管理信息 在建模中管理包关联"},"40":{y:0,u:"../Content/MPCMPages/Assigning_Modeling_Object_Instances_to_a_Package_in_Modeling.htm",l:-1,t:"在建模中将建模对象实例指派给包",i:0.0481157337209198,a:"可以创建和更新建模对象实例，然后在建模中将它们指派给现有的活动包。具有适当角色和权限的任何用户均可选择默认更改管理包，然后在会话期间将创建或更新的所有实例指派给包。    建模中将建模对象实例指派给包 如果使用的是已获许可的更改管理、已定义至少一个包而且拥有的角色具有“更改包建模查询”权限，则“建模”页上会显示“更改管理保存”选项。当满足以下条件时，可以在建模中将建模对象实例指派给包： 具有建模权限。 具有“指派更改包内容”权限。 具有“更改包建模查询”权限。 您是包所有者或具有所有者角色（例如，Siemens 提供的包所有者角色），或者是为包指定的内容协同者。 ..."},"41":{y:0,u:"../Content/MPCMPages/Viewing_Change_Management_Information_for_a_Modeling_Object_Instance.htm",l:-1,t:"查看建模对象实例的更改管理信息",i:0.00927163798050884,a:"查看建模对象实例的更改管理信息 通过访问每个对象页上的其他选项卡，可以查看与实例关联的包数量信息以及该实例是否已被包锁定。 查看建模对象实例的更改管理信息 每个建模对象页包含正在定义的实例的基本信息。随即页面的页眉部分中将显示此信息。如果已许可 Change Management、已定义至少一个包且拥有具有“更改包建模查询”权限的角色，则此部分中还会额外显示一个标注“更改管理”的选项卡。  更改管理选项卡字段定义 此表定义“更改管理”选项卡上的字段。"},"42":{y:0,u:"../Content/MPCMPages/Managing_Package_Associations_in_Modeling.htm",l:-1,t:"在建模中管理包关联",i:0.00927163798050884,a:"可以在“建模”中管理与建模对象实例关联的包。如果具有相应的角色和权限，则可以查看、移除或添加关联。 建模中管理包关联 在每个建模对象页中靠近页顶部的位置，都有一个工具栏。如果已许可 Change Management、至少已保存一个要与包关联的建模对象实例，并拥有具有“更改包建模查询”权限的角色，则工具栏上将额外显示一个标记为“包关联”的按钮。单击此按钮时，可以在 Modeling 中为所选建模对象实例管理包关联。可以查看与实例关联的包，如果具有包所有权权限，还可以移除或添加关联。 单击“包关联”按钮时，将显示“管理包关联”弹出窗口。通过按钮访问弹出窗口时，“关联的包”选项卡是默认选项卡。  ..."},"43":{y:0,u:"../Content/Security_Information.htm",l:-1,t:"安全信息",i:0.00722462255608419,a:"Siemens 提供具有行业安全功能的产品和解决方案，这些功能支持工厂、系统、机器和网络的安全作业。 为了保护工厂、系统、机器和网络免受网络威胁，需要实施和持续维护全面、一流的行业安全理念。Siemens 的产品和解决方案只构成此类理念的一个元素。 客户负责避免对其工厂、系统、机器和网络的未经授权的访问。只有当相应的安全措施（例如使用防火墙和网络分段）到位（某种程度上必须到位）时，系统、机器和组件才能连接到企业网络或 Internet。 另外，应当了解 Siemens 关于相应安全措施的指南。有关行业安全的更多信息，请访问  ..."},"44":{y:0,u:"../Content/Teamcenter Change Management/Searching_for_TC_Packages.htm",l:-1,t:"搜索 Teamcenter 包",i:0.030139644362167,a:"可以使用“包搜索”页搜索 MOM PLM 包。可以搜索 Teamcenter 包和在 CEP 中创建的包。有关信息，请参考“ 搜索包 ”。 搜索 Teamcenter 包 搜索从 Teamcenter 下载的包时，应了解以下几点：  “正在下载”步骤没有可用的事务，只有一个状态。 “审批 PLM”没有事务页。未针对手动审批设置默认 MOM PLM 工作流程，但可将其配置为需要手动审批。审批事务发生在 Teamcenter 中，然后发送到 CEP 并记录在包中。包随后移至“已拒绝”或“待处理部署”状态。有关信息，请参考“ 路由和取消 Teamcenter 审批 ”。  作废事务也可以在 ..."},"45":{y:0,u:"../Content/Teamcenter Change Management/TC_Change_Management_Overview.htm",l:-1,t:"Teamcenter 更改管理",i:0.0531205897412225,a:"[JW 注：在尚未进行的新 Opcenter Execution Medical Device and Diagnostics/CR 应用程序与 Teamcenter 的发行版 8.0 集成测试中，排除了此功能。] 仅当组织对 Siemen 的 Teamcenter 应用程序与 Camstar Enterprise Platform (CEP) 实现了集成时，本节中所述功能才可用。有关信息，请参考《  Camstar Teamcenter 集成指南》。 通过将 Siemen 的 Teamcenter 应用程序与 CEP 集成，Teamcenter 工程更改通知 (ECN) ..."},"46":{y:0,u:"../Content/Teamcenter Change Management/Routing_Canceling_Teamcenter_Approvals.htm",l:-1,t:"路由和取消 Teamcenter 审批",i:0.0398191557254975,a:"Teamcenter 包审批流程与默认的 Camstar Change 审批流程略有不同。当审批请求发送到 Teamcenter 时，在 CEP 之外完成包审批流程。必须与 Teamcenter 工程师联系才能取消待处理的审批请求。 将包路由到 Teamcenter 进行审批 如果包处于默认 MOM PLM 工作流程的“待处理扩充”工步，则可将包路由到 Teamcenter 进行审批。单击“路由以审批”页上的“路由以审批”按钮，开始审批流程。当路由包以审批时，应用程序会将包的工步更改为“待处理审批 PLM”。 应用程序通过 Camstar 互操作性 (CIO) 将两个加密 PDF 文件发送到 ..."},"47":{y:0,u:"../Content/Teamcenter Change Management/Change_Management_Overview.htm",l:-1,t:"Teamcenter 更改管理概述",i:0.0222757158525934,a:"将 ECN 下载到 CEP 中时，会在 CEP 中创建 Teamcenter 包。Teamcenter ECN 包含工艺清单 (BOP) 和物料清单 (BOM) 信息，这些信息用于在 CEP 中创建相应的建模实例，而这些实例随后在 CEP 更改管理包中进行分组。有关在 CEP 中启动 Teamcenter 包的信息，请参考《  Opcenter Execution Core Teamcenter 集成指南》。 可以通过 Camstar Change 指派或移除内容，从而进一步扩充包中的对象。能够对 Teamcenter 包执行大多数 Camstar Change ..."},});