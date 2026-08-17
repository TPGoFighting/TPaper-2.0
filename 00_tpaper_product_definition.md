# tpaper 产品定义与核心原则

## 1. 产品定义

**tpaper** 是一个 AI 试卷智能转换与在线答题工具。

它允许用户上传：

- PDF
- 扫描 PDF
- Word / DOCX
- JPG / PNG 等图片
- 复习资料、习题资料、试卷

然后由 AI 自动将这些内容转换成一个可以直接在线使用的交互式网页试卷。

一句话定义：

> **tpaper — Turn any paper into an interactive test.**

中文表达：

> 上传 PDF、Word 或图片，让 AI 自动把试卷和复习资料变成可在线作答、自动评分、查看解析并分享的交互式网页。

---

## 2. 核心产品链路

```text
用户上传原始资料
        ↓
AI 理解文档内容
        ↓
Agent 设计适合该试卷的 Web Experience
        ↓
Agent 直接生成完整单 HTML
        ↓
在线答题 / 自动评分 / 查看解析
        ↓
发布
        ↓
生成可分享 URL
```

例如：

```text
https://tpaper.tpgofighting.top/p/abc123
```

或未来独立内容域：

```text
https://paper.tpaper.ai/p/abc123
```

---

## 3. 最重要的产品原则：HTML Artifact，而不是传统题库

tpaper 不应被设计成传统的：

```text
Document
  ↓
OCR
  ↓
Question JSON
  ↓
Question Database
  ↓
固定模板
  ↓
Exam Page
```

而应该是：

```text
Document
  ↓
AI Understanding
  ↓
Experience Design
  ↓
Complete HTML Artifact
```

最终正式产物是：

```html
<!doctype html>
<html>
  <head>
    <style>
      ...
    </style>
  </head>
  <body>
    ...
    <script>
      ...
    </script>
  </body>
</html>
```

这个 HTML 自身就可以包含：

- 题目
- 选项
- 输入框
- 数学公式
- 图片
- 答题状态
- 题目导航
- 倒计时
- 判分逻辑
- 答案
- 解析
- 结果页
- 动效
- 样式
- JavaScript 交互

---

## 4. “不结构化”不等于“完全没有中间理解”

产品层面不建立长期的 Question Schema：

```json
{
  "question": "...",
  "options": [],
  "answer": "A"
}
```

但 Agent 内部可以存在短生命周期的中间理解结果，例如：

```text
Paper Brief

高等数学期中考试
共 22 题

Section A
1–10 单选

Section B
11–16 填空

Section C
17–22 解答

Q8 有函数图像
Q17 跨页
答案从第 9 页开始
```

以及：

```text
Experience Plan

Style:
minimal academic

Navigation:
left question index

Interaction:
single choice + text input

Scoring:
submit once

Explanation:
show after submission
```

这些信息只服务于 Agent 生成与 QA，不必成为产品数据库中的核心题库模型。

---

## 5. tpaper 的差异化

tpaper 的竞争点不应该只是：

- OCR 更准
- 能识别 PDF
- 能提取题目

真正的差异化应该是：

> **AI 根据不同内容，直接设计并生成适合这份试卷的 Web Experience。**

因此不同试卷可以拥有不同的：

- 页面布局
- 题目呈现方式
- 导航方式
- 视觉主题
- 交互方式
- 解析方式
- 结果呈现方式

产品需要提供的是：

> **Design Rules，而不是固定 Template。**

---

## 6. 核心用户体验

用户不应该看到：

```text
OCR
Chunking
Schema Extraction
DOM Validation
LLM Reasoning
```

而应该看到：

```text
TP is reading your paper...
Found 32 questions.
Designing your test...
Making it interactive...
Checking everything...
Done ✓
```

最终：

> **Your paper is alive.**

核心按钮：

```text
Start Test
Publish & Share
```

---

## 7. 产品能力

### 文档输入

支持：

- PDF
- 扫描 PDF
- DOCX
- JPG / PNG
- 混合图文资料

### AI 转换

Agent 自动完成：

- 理解内容
- 理解题型
- 识别原题结构
- 判断答案与解析
- 设计网页答题体验
- 生成 HTML

### 在线答题

可以包含：

- 单选
- 多选
- 填空
- 简答
- 解答题
- 数学公式
- 图片题
- 定时考试
- 题目导航
- 答题进度

### 结果与解析

可以包含：

- 得分
- 正确 / 错误数
- 正确答案
- 逐题解析
- 错题状态
- 完成时间
- 表现统计

### 分享

每份试卷可以发布为独立 URL：

```text
/p/{slug}
```

别人打开即可直接作答。

---

## 8. 数据模型的产品思想

正式数据更接近 Artifact，而不是 Question Bank。

```text
Paper
├── original_file
├── generated_html
├── assets
├── thumbnail
├── metadata
├── generation_logs
└── versions
```

核心表可以围绕：

```text
papers
paper_versions
generation_jobs
publications
test_sessions
```

而不是一开始就建立：

```text
questions
question_options
answers
question_tags
question_bank
```

---

## 9. 产品长期方向

tpaper 可以逐渐从“AI 试卷转换器”发展成：

> **AI-native Interactive Paper Platform**

即：

```text
Static Document
      ↓
AI
      ↓
Interactive Web Artifact
```

试卷只是第一种最清晰、最有价值的 Artifact 类型。
