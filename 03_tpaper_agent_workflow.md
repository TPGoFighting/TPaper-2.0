# tpaper Agent 工作流设计

## 1. 核心原则

不要做：

```text
用户上传 PDF
   ↓
一个 Agent
   ↓
一次性吐 HTML
```

更稳妥的架构：

> **1 个 Orchestrator + 分阶段生成 + Content QA + Browser QA + Repair Loop**

但产品表面仍然保持：

> Agent 直接生成最终单 HTML，不建立传统题库系统。

---

# 2. 总流程

```text
Upload
  ↓
Document Intake
  ↓
Document Understanding
  ↓
Experience Design
  ↓
HTML Generation
  ↓
Content QA
  ↓
Browser QA
  ↓
Repair Loop
  ↓
Publish
```

---

# 3. 状态机

建议：

```text
UPLOADED
   ↓
PARSING
   ↓
UNDERSTANDING
   ↓
DESIGNING
   ↓
GENERATING
   ↓
VERIFYING
   ↓
REPAIRING
   ↓
READY
   ↓
PUBLISHED
```

失败：

```text
FAILED
```

所有状态必须持久化，避免长任务不可恢复。

---

# 4. Orchestrator

Orchestrator 不直接写整个页面。

它负责：

- 判断文件类型
- 判断是否扫描件
- 判断复杂程度
- 调度模型
- 调度 Browser QA
- 调度 Repair
- 控制重试
- 更新状态
- 记录成本

典型判断：

```text
PDF / DOCX / Image？
扫描件？
多少页？
大量公式？
大量图片？
存在答案页？
是试卷还是复习资料？
```

---

# 5. Document Intake

输入：

```text
Original File
```

处理为：

```text
Source Text
Page Images
Extracted Images
Metadata
```

例如 PDF：

```text
original.pdf

page-001.webp
page-002.webp
page-003.webp
...
```

Document Processor 可以优先使用：

- 原生 PDF text layer
- DOCX XML
- 图片视觉识别
- OCR 作为扫描件补充

---

# 6. Document Understanding Agent

目标：

> 先完整理解试卷，而不是立刻写 HTML。

需要判断：

- 文档类型
- 标题
- 题目总数
- 题型
- 章节
- 跨页题
- 图片归属
- 公式
- 表格
- 答案
- 解析
- 特殊说明

输出临时：

# Paper Brief

例如：

```text
Paper Brief

高等数学期中考试
22 Questions

Section A
1–10 Single Choice

Section B
11–16 Fill Blank

Section C
17–22 Long Answer

Q8 includes function graph
Q17 spans page 4 and page 5
Answer section starts at page 9

Requirements:
- math formula rendering
- question navigation
- single-submit scoring
- explanations after submit
```

注意：

> Paper Brief 是 ephemeral，不是长期 Question DB。

---

# 7. Experience Designer Agent

职责：

> 决定“这份试卷应该变成怎样的 Web Experience”。

它应该根据：

- 年级
- 学科
- 题型
- 内容密度
- 图片
- 是否考试
- 是否复习资料

动态决定：

- 布局
- 导航
- 题卡
- 色彩
- 交互
- 提交流程
- 解析方式
- 结果方式

输出：

# Experience Plan

例如：

```text
Style:
minimal academic

Layout:
desktop: left navigation + center content
mobile: top progress + single column

Interaction:
single choice
fill blank
long answer

Scoring:
submit once

Explanation:
collapsed after submission

Special:
Q7 image below question
Q15 display math
```

---

# 8. HTML Builder Agent

输入：

```text
Original Document Context
+
Paper Brief
+
Experience Plan
+
tpaper HTML System Prompt
```

输出完整：

```html
<!doctype html>
<html>
...
</html>
```

必须：

- 单 HTML Artifact
- Inline CSS
- Inline JS
- 响应式
- 可答题
- 可提交
- 可判分
- 可显示解析
- 不依赖主站 DOM

---

# 9. 不使用固定模板

Builder Prompt 应提供：

## Hard Rules

```text
Readable
Responsive
Accessible
Easy to answer
All questions must be reachable
Submission must work
No missing content
```

而不是：

```text
Always use left sidebar
Always use same card
Always use same results page
```

否则 tpaper 会退化成模板引擎。

---

# 10. Content QA

生成 HTML 后先检查内容。

Content Reviewer 对比：

```text
Original Document
VS
Generated HTML
```

重点：

- 题目总数
- 是否漏题
- 是否重复题
- 是否改题
- 是否错误理解否定词
- 图片归属
- 数学公式
- 选项
- 答案
- 解析

典型危险：

```text
“选出错误的一项”
```

被 AI 改成：

```text
“选出正确的一项”
```

这种问题 Browser QA 无法发现，必须做 Content QA。

---

# 11. Browser QA

生成的 HTML 需要在真实 Chromium 中运行。

使用：

```text
Playwright + Chromium
```

自动执行：

```text
Load page
↓
Wait DOM
↓
Check console
↓
Check layout
↓
Select option
↓
Type answer
↓
Navigate
↓
Submit
↓
Verify result
```

---

# 12. Browser QA 硬规则

程序直接判断：

- 页面是否加载
- JS Error
- 资源 404
- 白屏
- 横向 Overflow
- 按钮不可点
- 输入框不可输入
- Submit 缺失
- 题目不可访问
- DOM 高度异常
- 移动端布局崩溃

这些尽量不消耗 LLM。

---

# 13. Vision QA

截图：

```text
1440 × 900
390 × 844
```

交给视觉模型检查：

- 遮挡
- 视觉层级
- 公式溢出
- 字体过小
- 图片异常
- Mobile 可读性
- 结果页是否正常

---

# 14. Repair Agent

如果 QA 失败：

输入：

```text
Current HTML
+
QA Report
+
Console Logs
+
Screenshots
+
Relevant Source Pages
```

指令：

```text
Fix only identified problems.
Preserve all existing questions.
Do not redesign unnecessarily.
Return complete corrected HTML.
```

Repair 后生成新版本：

```text
v2.html
```

而不是覆盖：

```text
v1.html
```

---

# 15. Repair Loop

流程：

```text
Generate v1
   ↓
Content QA
   ↓
Browser QA
   ↓
FAIL
   ↓
Repair v2
   ↓
Verify
   ↓
FAIL
   ↓
Repair v3
   ↓
Verify
```

建议最多：

```text
2–3 repair attempts
```

如果仍失败：

```text
FAILED / NEEDS_MANUAL_REVIEW
```

---

# 16. 发布条件

必须同时：

```text
Content QA = PASS
Browser QA = PASS
```

才：

```text
READY
```

然后：

```text
Publish
```

---

# 17. 用户看到的生成过程

工程过程复杂，但前端状态必须非常简单。

例如：

```text
TP is reading your paper...
```

↓

```text
Found 32 questions.
```

↓

```text
Designing your test...
```

↓

```text
Making it interactive...
```

↓

```text
Checking everything...
```

↓

```text
Done ✓
```

最终：

> **Your paper is alive.**

---

# 18. Agent 角色数量

MVP 不建议：

```text
OCR Agent
Question Agent
Answer Agent
CSS Agent
JS Agent
Scoring Agent
Design Agent
QA Agent
...
```

建议逻辑上：

```text
Orchestrator

1. Understand / Design
2. HTML Builder
3. Reviewer
4. Repair
```

实际底层模型可以根据任务动态路由。

---

# 19. Fast Path / Deep Path

根据复杂度选择工作流。

## Fast Path

例如：

```text
3-page digital PDF
plain English
no diagrams
```

流程可减少 Vision / Repair。

## Deep Path

例如：

```text
35 pages
scanned
math-heavy
geometry figures
tables
```

则：

- 全页视觉理解
- 多模态
- Content QA
- Browser QA
- Repair

这样可以控制成本。

---

# 20. 最终核心闭环

tpaper 最值得投入的不是：

> 让模型第一次就生成完美 HTML。

而是：

# Generate → Run → Inspect → Repair → Publish

只要这个闭环稳定，模型能力升级时，整个产品会自然变得更强。
