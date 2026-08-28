# WebGenerator

AI 驱动的网站代码生成项目。以下架构图会在 GitHub 仓库首页直接渲染。

## 单体服务业务架构

```mermaid
flowchart LR
    subgraph accessLayer["访问端"]
        user["普通用户"]
        admin["管理员"]
        visitor["应用预览访问者"]
    end

    subgraph monolith["单体 Spring Boot 服务"]
        springMvc["Spring MVC 接口层"]
        userApi["用户接口"]
        appApi["应用与代码生成接口"]
        chatApi["对话历史接口"]
        staticApi["静态预览接口"]
        userService["用户、会话与权限"]
        appService["应用生命周期管理"]
        routeService["AI 生成类型路由"]
        codeService["AI 代码生成与工具调用"]
        streamService["SSE 流处理与对话归档"]
        deployService["Vue 构建、部署与下载"]
        screenshotService["网页截图与封面更新"]
    end

    subgraph dataLayer["数据与文件"]
        mysql[("MySQL 用户、应用、对话")]
        redis[("Redis 会话、记忆、缓存、限流")]
        sourceFiles[("本地生成代码目录")]
        deployFiles[("本地部署目录")]
    end

    subgraph externalLayer["外部能力"]
        routingModel["Qwen 路由模型"]
        generationModel["DeepSeek 生成与推理模型"]
        browserEngine["Selenium 浏览器"]
        objectStorage["腾讯云 COS"]
    end

    user -->|"HTTP 与 SSE"| springMvc
    admin -->|"HTTP"| springMvc
    visitor -->|"访问 /api/static"| staticApi
    springMvc --> userApi
    springMvc --> appApi
    springMvc --> chatApi
    springMvc --> staticApi
    userApi --> userService
    chatApi --> streamService
    appApi --> appService
    appService --> userService
    appService --> routeService
    appService --> codeService
    appService --> streamService
    appService --> deployService
    deployService -.->|"部署后异步触发"| screenshotService
    userService -->|"用户数据"| mysql
    userService -->|"登录会话"| redis
    appService -->|"应用元数据"| mysql
    streamService -->|"对话历史"| mysql
    codeService -->|"对话记忆"| redis
    appService -->|"缓存与分布式限流"| redis
    codeService -->|"保存生成结果"| sourceFiles
    deployService -->|"读取源码并构建"| sourceFiles
    deployService -->|"复制发布产物"| deployFiles
    staticApi -->|"读取静态文件"| sourceFiles
    routeService -.->|"代码类型分类"| routingModel
    codeService -.->|"流式生成代码"| generationModel
    screenshotService -.->|"打开部署地址并截图"| browserEngine
    screenshotService -.->|"上传应用封面"| objectStorage
    screenshotService -->|"写回封面地址"| mysql
```

[查看单体架构说明](docs/architecture/monolith-business-architecture.md)

## LangGraph4j 工作流业务架构

```mermaid
flowchart TD
    startNode(["开始：接收原始提示词"])

    subgraph materialStage["素材规划与并发收集"]
        imagePlan["AI 生成图片收集计划"]
        contentCollector["搜索内容图片"]
        illustrationCollector["搜索插画素材"]
        diagramCollector["生成 Mermaid 架构图"]
        logoCollector["生成 Logo"]
        imageAggregator["聚合全部图片资源"]
    end

    subgraph generationStage["提示词与代码生成"]
        promptEnhancer["原始提示词合并素材 URL"]
        typeRouter["AI 路由生成类型"]
        codeGenerator["按类型流式生成并保存代码"]
        qualityCheck{"AI 代码质量检查"}
        projectBuilder["构建 Vue 项目"]
    end

    finishNode(["结束：返回 WorkflowContext"])

    subgraph sharedState["共享状态"]
        workflowContext[("WorkflowContext：提示词、素材、生成类型、代码目录、质检结果、构建目录")]
    end

    subgraph dependencies["工具与外部能力"]
        planningModel["图片规划模型"]
        pexels["Pexels 图片搜索"]
        undraw["unDraw 插画搜索"]
        mermaidCli["Mermaid CLI 与腾讯云 COS"]
        dashscopeImage["DashScope 文生图"]
        routingModel["Qwen 路由模型"]
        generationModel["DeepSeek 生成与质检模型"]
        localFiles[("本地代码目录")]
    end

    startNode --> imagePlan
    imagePlan --> contentCollector
    imagePlan --> illustrationCollector
    imagePlan --> diagramCollector
    imagePlan --> logoCollector
    contentCollector --> imageAggregator
    illustrationCollector --> imageAggregator
    diagramCollector --> imageAggregator
    logoCollector --> imageAggregator
    imageAggregator --> promptEnhancer
    promptEnhancer --> typeRouter
    typeRouter --> codeGenerator
    codeGenerator --> qualityCheck
    qualityCheck -->|"未通过：携带错误与建议重试"| codeGenerator
    qualityCheck -->|"通过且为 Vue 项目"| projectBuilder
    qualityCheck -->|"通过且为 HTML 或多文件"| finishNode
    projectBuilder --> finishNode
    imagePlan -.->|"调用"| planningModel
    contentCollector -.->|"调用"| pexels
    illustrationCollector -.->|"调用"| undraw
    diagramCollector -.->|"转换并上传"| mermaidCli
    logoCollector -.->|"调用"| dashscopeImage
    typeRouter -.->|"分类"| routingModel
    codeGenerator -.->|"生成"| generationModel
    qualityCheck -.->|"检查"| generationModel
    codeGenerator -->|"写入"| localFiles
    projectBuilder -->|"读取并输出 dist"| localFiles
    startNode -.->|"初始化"| workflowContext
    imageAggregator -.->|"更新素材"| workflowContext
    typeRouter -.->|"更新生成类型"| workflowContext
    qualityCheck -.->|"更新质检结果"| workflowContext
    finishNode -.->|"返回最终状态"| workflowContext
```

[查看工作流架构说明](docs/architecture/langgraph4j-workflow-architecture.md)

## 微服务业务架构

```mermaid
flowchart LR
    subgraph accessLayer["访问端"]
        webClient["Web 前端与管理端"]
        appVisitor["应用预览访问者"]
    end

    subgraph serviceLayer["可独立部署服务"]
        userService["用户服务 web-generator-user：注册、登录、权限、用户查询"]
        appService["应用服务 web-generator-app：应用、对话、AI 生成、构建与部署"]
        screenshotService["截图服务 web-generator-screenshot：网页截图与封面上传"]
    end

    subgraph infrastructure["服务基础设施"]
        nacos["Nacos 注册与发现"]
        mysql[("MySQL：user、app、chat_history")]
        redis[("Redis：共享 Session、AI 记忆、缓存与限流")]
        codeFiles[("应用服务本地生成与部署目录")]
    end

    subgraph externalLayer["外部能力"]
        routingModel["Qwen 路由模型"]
        generationModel["DeepSeek 生成与推理模型"]
        browserEngine["Selenium 浏览器"]
        objectStorage["腾讯云 COS"]
    end

    webClient -->|"HTTP 8124 /api/user"| userService
    webClient -->|"HTTP 与 SSE 8125 /api"| appService
    appVisitor -->|"访问 /api/static"| appService
    appService -->|"Dubbo Triple：用户资料查询"| userService
    appService -.->|"部署后异步调用截图"| screenshotService
    userService -.->|"注册与发现"| nacos
    appService -.->|"注册、发现服务"| nacos
    screenshotService -.->|"注册与发现"| nacos
    userService -->|"用户数据"| mysql
    userService -->|"登录 Session"| redis
    appService -->|"应用与对话数据"| mysql
    appService -->|"Session、记忆、缓存、限流"| redis
    appService -->|"生成、构建、部署、下载"| codeFiles
    appService -.->|"生成类型分类"| routingModel
    appService -.->|"流式代码生成与工具调用"| generationModel
    screenshotService -.->|"打开部署 URL 并截图"| browserEngine
    screenshotService -.->|"上传截图"| objectStorage
    screenshotService -->|"返回封面 URL"| appService
```

[查看微服务架构说明](docs/architecture/microservice-business-architecture.md)
