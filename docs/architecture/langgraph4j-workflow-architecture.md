# LangGraph4j 工作流业务架构图

范围：`src/main/java/com/zy/webgenerator/langgraph4j`。下图以节点最完整的 `CodeGenConcurrentWorkflow` 为主，并合并表达 `CodeGenSubgraphWorkflow` 的同等业务语义。

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

## 工作流模式

- `CodeGenConcurrentWorkflow` 从图片计划节点扇出 4 个异步素材分支，再由图片聚合节点汇合。
- `CodeGenSubgraphWorkflow` 把相同的 4 个分支封装成共享父图状态的子图，业务顺序与上图一致。
- 所有节点通过 `MessagesState` 中的 `workflowContext` 共享状态，不直接传递独立 DTO。
- 质检失败会回到代码生成节点，并把错误与修复建议作为下一轮提示词；质检通过后，仅 Vue 项目进入构建节点。

## 代码依据

- `src/main/java/com/zy/webgenerator/langgraph4j/CodeGenConcurrentWorkflow.java`
- `src/main/java/com/zy/webgenerator/langgraph4j/CodeGenSubgraphWorkflow.java`
- `src/main/java/com/zy/webgenerator/langgraph4j/state/WorkflowContext.java`
- `src/main/java/com/zy/webgenerator/langgraph4j/node`
- `src/main/java/com/zy/webgenerator/langgraph4j/tools`
- `src/main/java/com/zy/webgenerator/langgraph4j/ai`

基础版本 `CodeGenWorkflow` 声明了质检节点和质检条件边，但当前源码未连接 `code_generator` 到 `code_quality_check`；因此上图采用连接完整的并发版和子图版作为依据。
