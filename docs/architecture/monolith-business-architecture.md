# 单体服务业务架构图

范围：仓库根目录 `src`。运行边界是一个 Spring Boot 应用 `yu-ai-code-mother-backend`，默认端口为 `8123`，上下文路径为 `/api`。

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

## 主要业务链路

- 创建应用：用户提交初始提示词，应用服务调用路由模型选择 `HTML`、`MULTI_FILE` 或 `VUE_PROJECT`，再保存应用元数据。
- 对话生成：应用服务校验所有权、记录用户消息，代码生成外观调用大模型并通过 SSE 返回内容；完整结果被解析并保存到本地代码目录。
- 部署应用：应用服务按生成类型读取源码；Vue 项目先执行构建，再把产物复制到部署目录，并异步生成截图上传到 COS。
- 查询管理：用户、应用和对话历史统一通过单体接口层访问 MySQL；Redis 同时承担 Session、AI 对话记忆、缓存和限流状态。

## 代码依据

- `src/main/java/com/zy/webgenerator/controller`
- `src/main/java/com/zy/webgenerator/service/impl/AppServiceImpl.java`
- `src/main/java/com/zy/webgenerator/core/AiCodeGeneratorFacade.java`
- `src/main/java/com/zy/webgenerator/ai/AiCodeGeneratorServiceFactory.java`
- `src/main/java/com/zy/webgenerator/core/handler/StreamHandlerExecutor.java`
- `src/main/java/com/zy/webgenerator/service/impl/ScreenshotServiceImpl.java`
- `src/main/resources/application.yml`

`langgraph4j` 包中的工作流实现未发现被 Controller 或 `AppServiceImpl` 直接调用，因此没有虚构它与主请求链路的连接；其内部结构见独立的[工作流业务架构图](langgraph4j-workflow-architecture.md)。
