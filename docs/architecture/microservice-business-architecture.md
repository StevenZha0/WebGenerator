# 微服务业务架构图

范围：仓库 `microservice` 目录。根据启动类和 Dubbo 配置，当前存在 3 个可独立运行的服务；仓库中没有 API 网关或消息队列模块，因此下图不虚构这些组件。

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

## 服务边界

- 用户服务：HTTP 端口 `8124`，Dubbo Triple 端口 `50051`；负责用户和登录 Session，并向应用服务提供内部用户查询接口。
- 应用服务：HTTP 端口 `8125`，Dubbo Triple 端口 `50053`；承载应用、对话历史、AI 代码生成、构建、部署、下载和静态资源相关逻辑。
- 截图服务：HTTP 端口 `8127`，Dubbo Triple 端口 `50052`；通过 Selenium 截取部署页面，上传到 COS 后返回 URL。

`common`、`model`、`client` 和 `ai` 是 Maven 共享模块，不包含独立启动类。其中 `ai` 作为依赖运行在应用服务进程内，`client` 只定义 Dubbo 内部服务契约。

## 关键调用链

- 登录链路：前端调用用户服务，用户数据写入 MySQL，登录状态写入共享 Redis Session。
- 生成链路：前端调用应用服务，应用服务读取 Session、校验应用权限、调用 AI 模型并通过 SSE 返回结果，同时写入对话历史和本地代码目录。
- 部署链路：应用服务构建并复制发布产物，随后在虚拟线程中通过 Dubbo 调用截图服务；截图服务上传封面到 COS，应用服务再把封面 URL 写回 MySQL。

## 代码依据

- `microservice/pom.xml`
- `microservice/app/src/main/java/com/zy/webgenerator/WebGeneratorAppApplication.java`
- `microservice/app/src/main/java/com/zy/webgenerator/service/impl/AppServiceImpl.java`
- `microservice/user/src/main/java/com/zy/webgenerator/WebGeneratorUserApplication.java`
- `microservice/user/src/main/java/com/zy/webgenerator/service/impl/InnerUserServiceImpl.java`
- `microservice/screenshot/src/main/java/com/zy/webgenerator/WebGeneratorScreenshotApplication.java`
- `microservice/screenshot/src/main/java/com/zy/webgenerator/service/impl/InnerScreenshotServiceImpl.java`
- `microservice/client/src/main/java/com/zy/webgenerator/innerservice`
- 各服务的 `src/main/resources/application.yml` 与 `application-local.yml`
