# 项目架构图

本目录中的架构图根据仓库当前代码和配置生成：

1. [单体服务业务架构图](monolith-business-architecture.md)
2. [LangGraph4j 工作流业务架构图](langgraph4j-workflow-architecture.md)
3. [微服务业务架构图](microservice-business-architecture.md)

## 格式说明

- 使用 GitHub Markdown 原生支持的 Mermaid `flowchart` 语法。
- 文件编码为 UTF-8，节点 ID 仅使用 ASCII 字符，中文只出现在显示文本中。
- 不依赖外部图片地址；在 GitHub 仓库页面打开 Markdown 文件即可渲染。
- 图中只表达代码或配置中能够确认的调用关系；共享 Maven 模块不会被误画成可独立部署的服务。
