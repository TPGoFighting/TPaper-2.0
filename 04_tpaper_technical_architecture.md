# tpaper 技术架构设计

## 1. 架构目标

tpaper 当前适合：

> **模块化单体 Web + 异步 Queue + Agent Worker + Browser QA + Object Storage + 独立 Artifact Origin**

不建议第一版就上：

- Kubernetes
- 15 个微服务
- Kafka
- GraphQL
- Redis Cluster
- Event Sourcing
- Vector DB
- 复杂题库 Schema

---

# 2. 总体架构

```text
                         ┌──────────────────────┐
                         │       Browser        │
                         │   tpaper Web App     │
                         └──────────┬───────────┘
                                    │
                         Upload / API / SSE
                                    │
                                    ▼
┌───────────────────────────────────────────────────────────┐
│                    tpaper Application                     │
│                                                           │
│  Auth    Paper API    Publish API    Billing    SSE       │
│                                                           │
│                    Next.js / TypeScript                   │
└─────────────┬─────────────────────┬───────────────────────┘
              │                     │
              ▼                     ▼
       ┌─────────────┐       ┌───────────────┐
       │ PostgreSQL  │       │   Job Queue   │
       └─────────────┘       └───────┬───────┘
                                     │
              ┌──────────────────────┼───────────────────────┐
              │                      │                       │
              ▼                      ▼                       ▼
       ┌─────────────┐       ┌──────────────┐       ┌──────────────┐
       │ Document    │       │ Agent Worker │       │ Browser QA   │
       │ Processor   │       │              │       │ Playwright   │
       └──────┬──────┘       └──────┬───────┘       └──────┬───────┘
              │                     │                       │
              └───────────┬─────────┴────────────┬──────────┘
                          │                      │
                          ▼                      ▼
                    ┌────────────┐        ┌─────────────┐
                    │ AI Gateway │        │ Repair Loop │
                    └────────────┘        └─────────────┘
                          │
                          ▼
                   ┌───────────────┐
                   │ Object Storage│
                   └───────┬───────┘
                           │
                           ▼
               isolated user-content host
```

---

# 3. Control Plane 与 Artifact Plane

必须分离。

## Control Plane

```text
tpaper.tpgofighting.top
```

负责：

- 官网
- Dashboard
- Auth
- 上传
- 生成任务
- 管理
- Analytics
- Publish

## Artifact Plane

建议：

```text
paper.tpgofighting.top
```

或未来：

```text
usercontent.tpaper.ai
```

负责运行：

> AI 生成的 HTML。

这是安全隔离的关键。

---

# 4. Web 技术栈

推荐：

```text
Next.js
TypeScript
Tailwind CSS
motion/react
```

负责：

- Landing
- App
- Auth
- Upload
- Job Progress
- Publish
- Analytics

---

# 5. 文件上传

不要：

```text
Browser
  ↓ 50MB
Next.js API
  ↓
Storage
```

建议：

```text
Browser
  ↓
Request Signed URL
  ↓
API
  ↓
Signed URL
  ↓
Browser Direct Upload
  ↓
Object Storage
```

这样 Web Server 不承担大文件传输。

---

# 6. Object Storage

推荐对象存储，例如：

```text
Cloudflare R2
S3
MinIO
```

存：

```text
original file
page images
extracted images
generated HTML
QA screenshots
artifacts
```

目录建议：

```text
papers/
  {paper_id}/

    source/
      original.pdf

    pages/
      001.webp
      002.webp

    assets/
      q12-image.webp

    versions/
      v1.html
      v2.html
      v3.html

    qa/
      desktop.png
      mobile.png
```

---

# 7. PostgreSQL

数据库只存：

> 状态、关系、元数据、版本。

不要把：

- 大 PDF
- HTML 大文件
- 图片

直接塞数据库。

推荐表：

```text
users
papers
paper_versions
generation_jobs
generation_steps
publications
test_sessions
```

---

# 8. papers

示例：

```text
id
user_id
title

source_type
source_object_key
source_hash

status
current_version_id

visibility
slug

created_at
updated_at
published_at
```

状态：

```text
uploaded
processing
understanding
designing
generating
verifying
repairing
ready
published
failed
```

---

# 9. paper_versions

每次 AI 修改创建新版本。

```text
id
paper_id
version_number

html_object_key

generation_model
prompt_version

content_qa_score
browser_qa_score

created_at
```

流程：

```text
v1
↓
QA FAIL
↓
v2
↓
QA FAIL
↓
v3
↓
PASS
```

最终：

```text
paper.current_version_id = v3
```

绝对不要覆盖旧版本。

---

# 10. Queue

Agent 工作流必须异步。

用户点击 Generate：

```text
POST /api/papers/{id}/generate
```

API：

```text
1. create generation_job
2. queue.send(job)
3. return jobId
```

立即返回：

```json
{
  "jobId": "...",
  "status": "queued"
}
```

后台 Worker 再真正执行。

---

# 11. Queue 第一版设计

MVP：

```text
paper-jobs
```

一条 Queue 即可。

后期再拆：

```text
document-processing
paper-understanding
html-generation
browser-validation
repair
publish
```

不要过早微服务化。

---

# 12. Worker 划分

建议：

## TypeScript Worker

负责：

- Orchestrator
- Model Gateway
- Prompt
- State Machine
- HTML Generation
- Repair
- DB
- Queue

## Python Document Processor

负责：

- PDF parsing
- DOCX parsing
- Page render
- OCR
- Image extraction
- Document metadata

MVP 可以先合并部署，逻辑分层即可。

---

# 13. Document Package

所有输入统一转成：

```text
Document Package
```

逻辑结构：

```text
sourceText

pages:
  - number
  - text
  - image

images

metadata
```

这是：

> 多格式输入统一层。

不是 Question Schema。

---

# 14. Model Gateway

代码中不要散落：

```ts
openai.responses.create(...)
```

应该统一：

```text
ModelGateway
```

接口概念：

```ts
model.generate({
  task: "paper-understanding",
  inputs,
  promptVersion: "v4"
})
```

内部可以路由：

```text
Understanding → Model A
HTML Coding   → Model B
Vision QA     → Model C
Repair        → Model B
```

优势：

- 易换模型
- 易做 fallback
- 易做成本控制
- 易 A/B

---

# 15. Workflow State Machine

建议明确：

```text
START

 ↓

UNDERSTAND

 ↓

DESIGN

 ↓

GENERATE_HTML

 ↓

SAVE_VERSION

 ↓

CONTENT_QA

 ↓

BROWSER_QA

 ↓ FAIL

REPAIR

 ↓

VERIFY

 ↓ PASS

READY

 ↓

PUBLISH
```

不要让 Agent 自由随机决定流程。

---

# 16. generation_steps

记录每一步。

```text
id
job_id

type
status

started_at
finished_at

model
input_tokens
output_tokens

error_code
error_message

metadata
```

可得到：

```text
Understanding       9.2s
Designing           5.6s
Generating HTML    24.8s
Content QA           6.2s
Browser QA           9.5s
Repair              14.1s
Browser QA           8.8s

Total               78.2s
```

这是后续性能与成本优化的基础。

---

# 17. Prompt Versioning

目录：

```text
prompts/

  understand/
    v1.md
    v2.md

  design/
    v1.md

  build/
    v1.md
    v2.md

  review/
    v1.md

  repair/
    v1.md
```

paper_version 记录：

```text
prompt_version = html-builder:v7
```

后续统计：

```text
v7 pass rate = 82%
v8 pass rate = 93%
```

---

# 18. Browser QA Service

建议单独 Docker Service：

```text
browser-runner
```

技术：

```text
Node.js
Playwright
Chromium
```

输入：

```text
paperVersionId
htmlUrl
```

执行：

```text
Desktop: 1440 × 900
Mobile: 390 × 844
```

动作：

```text
load
check console
click answer
type text
navigate
submit
check result
screenshot
```

---

# 19. Browser QA 两层

## Rule QA

代码完成：

- JS Error
- 404
- Overflow
- Button Missing
- Submit Missing
- Input Disabled
- DOM Height
- Navigation
- Mobile viewport

## Vision QA

模型看截图：

- 遮挡
- 可读性
- 公式
- 图片
- 空白
- 视觉层级
- Mobile 崩溃

---

# 20. Repair

失败：

```text
HTML
+
QA Report
+
Console
+
Screenshot
+
Relevant Source Pages
```

传给 Repair Agent。

生成：

```text
v2.html
```

再次：

```text
Browser QA
```

---

# 21. source_hash

上传后计算：

```text
SHA256
```

存：

```text
source_hash
```

如果重复上传完全相同文件：

```text
reuse preprocessing
```

以后可以继续：

```text
reuse understanding
```

降低 AI 成本。

---

# 22. SSE

生成进度属于：

```text
Server → Browser
```

因此 MVP 推荐：

```text
SSE
```

而不是 WebSocket。

接口：

```text
GET /api/jobs/{jobId}/events
```

事件：

```text
event: step
data: {"step":"understanding"}

event: step
data: {"step":"generating"}

event: progress
data: {"percent":62}

event: ready
data: {"paperId":"..."}
```

前端可映射 Mascot 状态。

---

# 23. HTML Sandbox

这是最重要的安全架构之一。

AI 输出中包含：

```html
<script>
```

因此本质上运行的是：

> AI 自动生成 JavaScript。

绝对不要直接：

```js
mainApp.innerHTML = generatedHTML
```

正确：

```text
tpaper App
   │
   └── iframe sandbox
          │
          └── Agent HTML
```

推荐独立 Origin。

---

# 24. iframe

类似：

```html
<iframe
  sandbox="allow-scripts"
  src="https://paper.tpgofighting.top/p/..."
></iframe>
```

默认不要：

```text
allow-same-origin
```

除非后来有明确、无法替代的需求。

---

# 25. CSP

生成页面默认应极度限制网络能力。

方向：

```text
default-src 'none'

script-src 'unsafe-inline'

style-src
  'unsafe-inline'

img-src
  'self'
  data:
  blob:

font-src
  'self'
  data:

connect-src
  'none'

frame-src
  'none'

object-src
  'none'

base-uri
  'none'

form-action
  'none'
```

原则：

> Agent HTML 可以执行 JS，但默认不能随意访问网络。

---

# 26. TP Runtime

建议建立：

```text
packages/html-runtime
```

Agent HTML 内可以调用：

```js
TPaper.ready()

TPaper.progress({
  answered: 8,
  total: 20
})

TPaper.submit({
  score: 18,
  total: 20
})
```

Runtime 内部负责：

- postMessage
- analytics
- autosave
- height sync
- submission

Agent 不需要理解主站实现。

---

# 27. postMessage Protocol

白名单消息：

```text
TPAPER_READY
TPAPER_PROGRESS
TPAPER_SUBMIT
TPAPER_HEIGHT
```

主站校验：

- source
- schema
- type
- payload size

避免任意消息注入。

---

# 28. “单 HTML”与 Asset 的关系

产品概念仍是：

> 一个 HTML Artifact。

但工程上允许图片等二进制 Asset 单独放对象存储。

Agent 可以写：

```html
<img src="asset://q17-figure">
```

Publisher 替换成：

```text
https://paper.../assets/q17-figure.webp
```

避免：

```text
40-page scan
→ all base64
→ 50MB HTML
```

HTML 仍然是唯一逻辑内容 Artifact。

---

# 29. Publish

publication：

```text
id
paper_id
paper_version_id
slug
visibility
created_at
```

访问：

```text
/p/{slug}
```

服务器：

```text
slug
 ↓
publication
 ↓
version
 ↓
object storage HTML
 ↓
response
```

发布版本不可变，可强 CDN Cache。

---

# 30. Analytics

一开始只做：

```text
test_sessions
```

例如：

```text
id
paper_id

started_at
submitted_at

score
max_score
duration

anonymous_id
```

更细的数据以后再加。

不要因为 Analytics 需要，就提前把产品改造成传统 Question Database。

---

# 31. 成本记录

每份 Paper 建议记录：

```text
preprocess_cost
understand_tokens
design_tokens
generation_tokens
qa_tokens
repair_tokens
browser_seconds
total_cost
```

这样才能知道：

```text
Average cost / paper
```

进而设计：

- Credits
- Pricing
- Free limits
- Pro limits

---

# 32. 模型路由

建议：

```text
Document understanding
→ strong multimodal

Experience planning
→ medium model

HTML generation
→ strong coding model

Rule QA
→ code

Vision QA
→ cheaper vision model

Repair
→ strong coding model
```

复杂卷进入 Deep Path。

简单卷走 Fast Path。

---

# 33. Deployment

MVP：

```text
Web / API
→ Vercel or Cloudflare

PostgreSQL
→ Neon / Supabase / managed Postgres

Storage
→ Cloudflare R2

Queue
→ Cloudflare Queues / equivalent

Worker
→ Docker

Browser QA
→ Docker
```

长期运行程序可以先控制在：

```text
tpaper-web
tpaper-worker
tpaper-browser
```

---

# 34. Monorepo

推荐：

```text
tpaper/

apps/

  web/
  worker/
  browser/

packages/

  db/
  ai/
  prompts/
  schemas/
  shared/
  html-runtime/
  events/

services/

  document/

infra/

  docker/
  migrations/
  cloudflare/
```

---

# 35. 当前最值得投入复杂度的三个部分

## 1. Document → AI Context

让模型真正看懂原文档。

## 2. Generate → Verify → Repair

让系统不依赖“一次生成完美”。

## 3. HTML Sandbox + Runtime

让 AI HTML 可安全运行、可与平台通信。

这三个做好，tpaper 的技术底座就成立了。
