# WebGenerator

一个 AI 驱动的网站代码生成平台。用户输入自然语言描述后，系统会自动规划生成方式、流式产出网站代码，并支持在线预览、部署、下载与管理。

## 项目简介

WebGenerator 面向“用对话生成网站”这一场景，提供从提示词输入到代码生成、预览、部署的完整链路。项目同时包含三种实现形态，便于对比不同架构下的业务组织方式：

- **单体服务**：`src` 目录下的 Spring Boot 应用，适合快速开发与一体化部署。
- **LangGraph4j 工作流**：`langgraph4j` 包中的节点化流程，支持素材采集、提示词增强、代码生成、质量检查与 Vue 构建。
- **微服务架构**：`microservice` 目录下的用户、应用、截图服务拆分方案，基于 Dubbo + Nacos 协作。

### 核心能力

- 支持 `HTML`、`多文件` 和 `Vue 项目` 三种代码生成模式
- 通过 SSE 流式返回 AI 生成过程，支持多轮对话持续优化
- 提供应用创建、部署、下载、对话历史与精选应用管理
- 集成图片素材采集、智能路由、代码质检与网页截图封面

### 技术栈

- 后端：Java 21、Spring Boot、MyBatis-Flex、LangChain4j、LangGraph4j
- 前端：Vue 3、TypeScript、Ant Design Vue、Vite
- 基础设施：MySQL、Redis、腾讯云 COS、Nacos、Dubbo

## 架构图

以下架构图会在 GitHub 仓库首页直接渲染。

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
flowchart LR
    subgraph prepareStage["1. 素材准备"]
        direction LR
        startNode(["原始提示词"])
        imagePlan["AI 图片规划"]
        materialCollector["并行采集：Pexels、unDraw、Mermaid、DashScope"]
        promptEnhancer["聚合素材并增强提示词"]
        startNode --> imagePlan --> materialCollector --> promptEnhancer
    end

    subgraph generateStage["2. 代码生成"]
        direction LR
        typeRouter["Qwen 类型路由"]
        codeGenerator["DeepSeek 流式生成并保存"]
        typeRouter --> codeGenerator
    end

    subgraph deliveryStage["3. 质检与交付"]
        direction LR
        qualityCheck{"AI 质量检查"}
        retryNode["修复问题并回到代码生成"]
        projectBuilder["Vue 项目构建"]
        finishNode(["完成"])
        qualityCheck -->|"失败"| retryNode
        qualityCheck -->|"HTML 或多文件"| finishNode
        qualityCheck -->|"Vue 项目"| projectBuilder --> finishNode
    end

    promptEnhancer --> typeRouter
    codeGenerator --> qualityCheck

    classDef endpoint fill:#e6f4ff,stroke:#1677ff,color:#1f1f1f
    classDef process fill:#f6ffed,stroke:#52c41a,color:#1f1f1f
    classDef decision fill:#fff7e6,stroke:#fa8c16,color:#1f1f1f
    class startNode,finishNode endpoint
    class imagePlan,materialCollector,promptEnhancer,typeRouter,codeGenerator,retryNode,projectBuilder process
    class qualityCheck decision
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
