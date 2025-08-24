# Nest Formula Renderer

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## 项目介绍

**Nest Formula Renderer** 是一个基于 NestJS 的数学公式渲染服务，提供高效、灵活的数学公式转换和渲染能力。该服务支持多种数学公式输入格式，并可输出为不同的格式，适用于教育、科研、文档系统等多种场景。

## 功能特点

- **多格式支持**：支持 TeX、MathML、AsciiMath 等多种数学公式输入格式
- **灵活输出**：可输出 HTML、SVG、PNG、MathML 等多种格式的渲染结果
- **高度可扩展**：采用工厂模式设计，便于添加新的渲染器
- **请求验证**：使用 class-validator 对输入参数进行严格验证
- **基于 NestJS**：利用 NestJS 框架的强大功能，提供高性能、可维护的服务

## 技术栈

- **核心框架**：NestJS
- **编程语言**：TypeScript
- **公式渲染**：MathJax
- **请求验证**：class-validator、class-transformer
- **代码规范**：ESLint、Prettier、Husky、Lint-Staged
- **提交规范**：Commitizen、Conventional Changelog

## 快速开始

### 项目安装

```bash
# 安装依赖
$ pnpm install
```

### 运行项目

```bash
# 开发模式（监听文件变化）
$ pnpm run start:dev

# 生产模式
$ pnpm run build
$ pnpm run start:prod
```

项目默认运行在 `http://localhost:8000`。

## API 使用指南

### 公式渲染接口

#### GET /formula

**功能**：渲染数学公式为指定格式

**参数**：

| 参数名 | 类型 | 是否必填 | 描述 | 取值范围 |
|--------|------|----------|------|----------|
| inputType | string | 是 | 输入公式类型 | `TeX`, `MathML`, `AsciiMath` |
| outputType | string | 是 | 输出结果类型 | `html`, `svg`, `png`, `mml` |
| formula | string | 是 | 数学公式内容 | - |
| scale | number | 否 | 缩放比例 | 0.1-100，默认 1 |
| product | string | 否 | 产品线名称 | - |
| token | string | 否 | 产品线密钥 | - |

**示例请求**：

```bash
# 使用 curl 请求示例
curl "http://localhost:8000/formula?inputType=TeX&outputType=html&formula=E%3Dmc%5E2&scale=1.2"
```

**示例响应**：

```json
{
  "result": "<div class='mathjax-container' style='display: inline-block; overflow-x: auto; overflow-y: hidden; max-width: 100%;'>...</div>",
  "success": true
}
```

## 项目结构

```
src/
├── app.controller.ts     # 应用根控制器
├── app.module.ts         # 应用根模块
├── app.service.ts        # 应用根服务
├── main.ts               # 应用入口文件
└── modules/
    └── formula/          # 公式渲染模块
        ├── dto/          # 数据传输对象
        │   └── formula.dto.ts
        ├── formula.controller.ts  # 公式控制器
        ├── formula.module.ts      # 公式模块
        ├── formula.service.ts     # 公式服务
        └── renderers/    # 渲染器实现
            ├── interfaces/         # 渲染器接口
            └── renderer.factory.ts # 渲染器工厂
```

## 开发指南

### 代码规范

项目使用 ESLint 和 Prettier 进行代码风格检查和格式化。提交代码前会自动执行这些检查：

```bash
# 格式化代码
$ pnpm run format

# 执行 lint 检查
$ pnpm run lint
```

### Git 提交规范

项目使用 Commitizen 管理 git 提交消息格式，确保提交信息清晰、规范：

```bash
# 使用交互式界面创建符合规范的提交
$ pnpm run commit

# 临时跳过 lint 检查的提交（仅在紧急情况下使用）
$ pnpm run commit:no-lint
```

提交消息格式遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范，格式为：

```
<type>(<scope>): <subject>

<body>

<footer>
```

## 测试

```bash
# 单元测试
$ pnpm run test

# 监视模式下的单元测试
$ pnpm run test:watch

# 测试覆盖率
$ pnpm run test:cov

# 端到端测试
$ pnpm run test:e2e
```

## 许可证

本项目使用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 联系方式

如有问题或建议，请提交 Issue 或联系项目维护者。
