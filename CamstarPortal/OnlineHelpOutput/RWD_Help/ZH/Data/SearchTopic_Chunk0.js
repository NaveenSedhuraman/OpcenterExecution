define({"0":{y:0,u:"../Content/Welcome.htm",l:-1,t:"关于 Siemens Opcenter Execution Medical Device and Diagnostics 和 Siemens Opcenter Execution Core",i:0.0781841725917047,a:"Siemens Opcenter Execution Medical Device and Diagnostics 和 Siemens Opcenter Execution Core 为全球顶级制造商和产品创新者实现快速变化、精益制造、恒定质量输出、快速 NPI 和更高的利润率提供了基础。它提供了一个易于使用的制造执行系统 (MES)，具有质量监控与强化功能，可实现即时可见性与智能性，并可实现与业务系统的互操作性和车间自动化。这些解决方案针对全球使用而构建，能够为实时控制和任务关键作业提供全球范围的可见性。 特征 自动执行制造过程 自我审核、无纸化制造 全球产品、生产、过程仪表板 ..."},"1":{y:0,u:"../Content/Using_the_Replace_Workspace_Data_Utility/Using_the_Replace_Workspace_Data_Utility.htm",l:-1,t:"使用替换工作区数据实用程序",i:0.0781841725917047,a:"使用替换工作区数据实用程序 Siemens 提供用于管理工作区的替换工作区数据实用程序。该实用程序从一些位置获取工作区，将它们合并到单一位置以在应用程序安装中使用。例如，在从任何版本 7 软件更新转换为发行版 8 后运行该实用程序。 以下主题提供有关使用替换工作区数据实用程序的信息： 概述 升级现有 Medical Device 安装 停止应用程序池和服务 复制 InSite.mdb 文件以合并工作区数据 运行替换工作区数据实用程序 重命名已升级的 InSite.mdb 文件并替换现有文件 更新事务数据库 在更新数据库后重新生成 WCF 服务 启动服务和应用程序池"},"2":{y:0,u:"../Content/Using_the_Replace_Workspace_Data_Utility/Overview_Replace_Workspace_Data_Utility.htm",l:-1,t:"概述",i:0.0864912409297367,a:"使用替换工作区数据实用程序是多阶段过程。 如果之前已安装 Medical Device，请参考“ 升级现有 Medical Device 安装 ”以了解相关信息。 以下为各阶段的描述。这些阶段包含的各个步骤将在接下来的主题中进行说明。 阶段 1.停止应用程序池和服务 必须先停止应用程序池和服务，然后才能运行替换工作区数据实用程序。 阶段 2.复制用于合并工作区数据的 InSite.mdb 文件 为在合并工作区数据时将使用的文件创建文件夹。将当前文件和基本元数据 InSite.mdb 文件从其各自的文件夹复制到此文件夹并重命名这些文件，使其可以作为输入用于替换工作区数据实用程序。 阶段 ..."},"3":{y:0,u:"../Content/Using_the_Replace_Workspace_Data_Utility/Upgrading_an_Existing_Medical_Device_Installation.htm",l:-1,t:"升级现有 Medical Device 安装",i:0.160008795716729,a:"如果升级现有 Medical Device 安装，则必须执行其他步骤。 有关配置 Medical Device 功能的信息，请参考《Opcenter Execution Medical Device and Diagnostics 系统管理指南》或《Opcenter Execution Core 系统管理指南》以及《Opcenter Execution MDD Medical Device 用户指南》或《Opcenter Execution Core Medical Device 用户指南》。 如果从早于版本 6 SU6 的版本升级 如果当前使用早于版本 6 SU6 的版本且想要升级 ..."},"4":{y:0,u:"../Content/Using_the_Replace_Workspace_Data_Utility/Stopping_Camstar_Services_RWD.htm",l:-1,t:"停止应用程序池和服务",i:0.0864912409297367,a:"必须先停止应用程序池和服务，然后才能运行替换工作区数据实用程序。 本主题介绍在 IIS 中停止所有与产品相关的应用程序池以及在 Windows 管理工具中停止所有与产品相关的服务。Opcenter EX MDD 服务器和 Opcenter EX CR 服务器注册为服务。可以在 Management Studio 的“服务”窗格中查看这些服务（CMSAdmin 和 Siemens PLM License Server 除外）的状态。也可以从“服务”窗格启动、停止和重新启动它们。有关信息，请参考《Opcenter Execution Medical Device and Diagnostics ..."},"5":{y:0,u:"../Content/Using_the_Replace_Workspace_Data_Utility/Copying_InSite.mdb_Files_for_Merging_Workspace_Data.htm",l:-1,t:"复制 InSite.mdb 文件以合并工作区数据",i:0.0864912409297367,a:"Siemens 建议为合并工作区数据时将使用的文件创建一个文件夹。然后，可以将当前文件和基本元数据 InSite.mdb 文件从其各自的文件夹复制到此文件夹并重命名这些文件，使其可以作为输入用于替换工作区数据实用程序。 在复制 InSite.mdb 文件以合并工作区数据时 创建用于维护 mdb 文件的文件夹（例如 C:\\Users\\管理员\\桌面\\合并），这些文件将用作替换工作区数据实用程序的输入。 必须将当前 InSite.mdb 文件和基本元数据 InSite.mdb 文件复制到此文件夹。 不要更新 C:\\Program Files (x86)\\Camstar\\InSite ..."},"6":{y:0,u:"../Content/Using_the_Replace_Workspace_Data_Utility/Renaming_the_Upgraded_InSite.mdb_File_and_Replacing_the_Existing_File.htm",l:-1,t:"重命名已升级的 InSite.mdb 文件并替换现有文件",i:0.0864912409297367,a:"如果未在“替换工作区数据”窗口中选中“完成时替换当前文件”复选框，Siemens 建议执行以下操作： 将用实用程序创建的已升级 InSite.mdb 文件重命名为标准名称：InSite.mdb 将已升级并重命名的 InSite.mdb 文件复制到 InSite Administration 文件夹。默认位置为 C:\\Program Files (x86)\\Camstar\\InSite Administration。 如果选中“完成时替换当前文件”复选框，则这些步骤不适用。 如何重命名已升级的 InSite.mdb 文件并替换现有文件 按照以下步骤重命名已升级的 InSite.mdb ..."},"7":{y:0,u:"../Content/Using_the_Replace_Workspace_Data_Utility/Updating_the_Transaction_Database_RWD.htm",l:-1,t:"更新事务数据库",i:0.0864912409297367,a:"必须更新事务数据库，使其使用升级的 InSite.mdb 文件。 有关“更新数据库”对话框中的字段及其他注意事项的详细信息，请参考《Opcenter Execution Medical Device and Diagnostics 系统管理指南》或《Opcenter Execution Core 系统管理指南》。 更新事务数据库时 可以在更新数据库时生成 WCF 服务；但更新过程耗时更长。使用 WCF Services Generator 单独执行此步骤。 有关信息，请参考《Opcenter Execution Medical Device and Diagnostics ..."},"8":{y:0,u:"../Content/Using_the_Replace_Workspace_Data_Utility/Regenerating_WCF_Services_RWD.htm",l:-1,t:"在更新数据库后重新生成 WCF 服务",i:0.0864912409297367,a:"在更新数据库后重新生成 WCF 服务 当对 InSite.mdb 文件进行更改时必须生成 WCF 服务。如果在更新事务数据库时未选中“生成 WCF 服务”复选框，则运行 WCF Services Generator。 有关重新生成 WCF 服务的完整信息，请参考《Opcenter Execution Medical Device and Diagnostics 安装指南》或《Opcenter Execution Core 安装指南》。"},"9":{y:0,u:"../Content/Using_the_Replace_Workspace_Data_Utility/Starting_Camstar_Services_RWD.htm",l:-1,t:"启动服务和应用程序池",i:0.0864912409297367,a:"必须启动服务和应用程序池。 本主题介绍在 IIS 中启动所有与产品相关的应用程序池以及在 Windows 管理工具中启动所有与产品相关的服务。Opcenter EX MDD 服务器和 Opcenter EX CR 服务器注册为服务。可以在 Management Studio 的“服务”窗格中查看这些服务（CMSAdmin 和 Siemens PLM License Server 除外）的状态。也可以从“服务”窗格启动、停止和重新启动它们。有关信息，请参考《Opcenter Execution Medical Device and Diagnostics 系统管理指南》或《Opcenter ..."},"10":{y:0,u:"../Content/Security_Information.htm",l:-1,t:"安全信息",i:0.0781841725917047,a:"Siemens 提供具有行业安全功能的产品和解决方案，这些功能支持工厂、系统、机器和网络的安全作业。 为了保护工厂、系统、机器和网络免受网络威胁，需要实施和持续维护全面、一流的行业安全理念。Siemens 的产品和解决方案构成此类理念的一个元素。 客户负责防止其工厂、系统、机器和网络受到未经授权的访问。仅当需要连接且采取了相应的安全措施（例如防火墙和/或网络分段）时，才能将此类系统、机器和组件连接到企业网络或 Internet。 有关可实施的行业安全措施的其他信息，请访问  https://www.siemens.com/industrialsecurity 。 Siemens ..."},});