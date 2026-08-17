# tpaper 官网设计方案

目标站点：

```text
tpaper.tpgofighting.top
```

## 1. 官网设计目标

tpaper 官网不建议采用传统 AI SaaS 的：

- 蓝紫渐变
- 玻璃拟态
- AI 光效
- 宇宙背景
- 标准 Bento Grid
- 大量 Dashboard 截图

更适合的方向：

> **日系编辑设计 × 极简漫画 × Product Tool**

整个网站应该传达：

> 这不是一个严肃、笨重的考试系统，而是一个会把枯燥试卷变成好玩网页的 AI 工具。

关键词：

```text
Paper
Comic
Interactive
AI
Playful
Minimal
```

---

## 2. 推荐视觉系统

### 背景

```text
#FAF7F1
```

暖米白、纸张感。

背景加入很浅的：

- 方格纸 Grid
- 几何 doodle
- 铅笔线
- 箭头
- 圆
- 三角形
- 星号
- 手绘下划线

### 主色

```text
Ink       #0F1115
Slate     #6B7280
Mist      #E7E7EA
Paper     #FAF7F1
Orange    #FF9D1A
Lime      #A6E22E
```

### 字体方向

主标题：

- 超粗黑无衬线
- 大尺寸
- 极强排版冲击力

辅助字体：

- Mono
- 等宽字体
- 工具型、小标题型信息

---

# 3. TP 是整个网站的核心视觉资产

TP 不应只是 Logo。

应该成为：

- Hero 主体
- 页面背景
- 视觉容器
- 动效主体
- 流程节点
- Mascot 的互动对象

例如：

```text
TP
turns papers
into interactive tests.
```

或：

```text
PAPER → TP → INTERACTIVE
```

甚至：

```text
TP → HTML
```

整个网站形成一条 TP 的视觉叙事。

---

# 4. Navigation

建议尽量少。

第一版：

```text
tpaper

How it works
Examples
Pricing
GitHub

Try tpaper →
```

如果产品还非常早期：

```text
tpaper

Examples
About
GitHub

Try it →
```

原则：

> 官网像一个强品牌工具，而不是企业后台官网。

---

# 5. Hero Section

建议 Hero 直接承担产品理解与转化。

结构：

```text
tpaper

AI TEST CONVERTER /
INTERACTIVE HTML PAPER

TP
turns papers
into interactive tests.

[ Character + Mascot + TP ]

PDF / DOCX / IMAGE
       ↓
    AI MAGIC
       ↓
INTERACTIVE TEST

[ Upload your paper ]
Try example →
```

推荐主标题：

> **TP turns papers into interactive tests.**

其他备选：

> Turn papers into something worth answering.

> Your paper. Now interactive.

---

# 6. Hero 中直接放 Upload

不要只放一个：

```text
Start for free
```

应该把真正的上传入口直接做到 Hero 中。

普通状态：

```text
┌─────────────────────────────┐
│                             │
│            ↑                │
│                             │
│     Drop your paper here    │
│                             │
│ PDF · DOCX · JPG · PNG      │
│                             │
│       Choose file           │
│                             │
└─────────────────────────────┘
```

拖入状态：

> **Yep. Drop it.**

上传成功：

> **Got it. Let TP read this.**

处理中：

```text
Reading your paper...
Finding questions...
Building something better...
```

---

# 7. 第二屏：产品核心概念

不要叫：

```text
Features
```

建议直接做：

# ANY PAPER → TP → INTERACTIVE TEST

视觉：

```text
       PDF
        ↓
    ┌────────┐
    │ PAPER  │
    └────────┘
         \
DOCX →    TP    → INTERACTIVE TEST
         /
 IMAGE
```

配文：

> **No question bank.  
> No manual formatting.  
> Just give TP the paper.**

这里直接解释 tpaper 最核心的产品哲学。

---

# 8. Before / After

这是整个官网最值得强化的一屏。

左：

## Before

- 黑白 PDF
- 扫描卷
- 密密麻麻
- 静态纸张

中：

```text
→ TP →
```

Mascot 做“转换”。

右：

## After

- 在线答题
- 选择题
- 输入框
- 公式
- 自动评分
- 解析
- 分享

主文案：

> **Same questions. Much better experience.**

---

# 9. Experience Section

不要展示完整 Dashboard。

展示局部交互元素：

### Question

```text
Q12

lim sin(x)/x ?

○ 0
● 1
○ ∞
```

### Score

```text
86
/100
```

### State

```text
✓ Correct
```

### Timer

```text
02:45
```

### Share

```text
tpaper.co/t/8Fd2K
Copy →
```

大标题：

> **Not a PDF viewer. A real interactive test.**

关键词：

```text
Answer
Score
Explain
Share
```

---

# 10. How It Works

不要做传统 4 个 SaaS Feature Cards。

建议漫画分镜：

## 01 / READ

> Throw any paper at it.

支持：

```text
PDF
DOCX
SCAN
IMAGE
```

## 02 / BUILD

> TP turns it into a webpage.

Agent-generated HTML。

## 03 / ANSWER

> Take it like a real online test.

## 04 / SHARE

> One link. Anyone can open it.

---

# 11. Mascot 交互设计

绿色 Mascot 不要只做装饰。

它应该承担状态反馈。

### 默认

正常看向用户。

### 鼠标移动

眼睛跟随鼠标：

```text
pupil offset ± 5px
```

头部：

```text
rotate ± 3deg
```

antenna：

稍微延迟摆动。

### 拖文件

眼睛看向文件。

### 上传

Mascot “吃掉”文件。

### AI Processing

头上出现：

```text
...
?!
✦
```

### 完成

跳出来庆祝。

### 答对

开心。

### 答错

歪头。

原则：

> 80% 静态设计 + 20% 灵动交互。

---

# 12. 动效语言

不要做重型炫技动画。

推荐：

### SVG

- 下划线 Draw
- 箭头 Draw
- doodle Draw

### Framer Motion / motion/react

- `translateY`
- `scale`
- 小幅 `rotate`
- stagger
- spring

### Card Hover

```text
rotate(-0.5deg)
rotate(0.5deg)
translateY(-2px)
```

### Scroll Storytelling

```text
PAPER
  ↓
 TP
  ↓
HTML
```

可用轻量 scroll-driven animation。

---

# 13. 推荐首页完整结构

```text
01 HERO

TP turns papers
into interactive tests.

Character + Mascot + TP

Upload


02 THE IDEA

ANY PAPER
    ↓
   TP
    ↓
INTERACTIVE TEST


03 BEFORE / AFTER

PDF
 ↓
TP
 ↓
WEB TEST


04 HOW IT WORKS

01 READ
02 BUILD
03 ANSWER
04 SHARE


05 EXPERIENCE

Question
Timer
Score
Correct
Explanation
Share link


06 WHY TPAPER

No manual formatting.
No question-bank setup.
No rebuilding questions.

Just upload.


07 FORMATS

PDF
DOCX
IMAGE
SCAN


08 SHARE

One test.
One link.
Anyone can answer.


09 FINAL CTA

TP

Your next paper
shouldn't stay a paper.

Turn it interactive →
```

---

# 14. Final CTA

建议做得很大。

```text
TP

Your next paper
shouldn't stay a paper.
```

按钮：

```text
Turn it interactive →
```

Mascot 可以趴在 TP 上。

---

# 15. 官网实现优先级

第一阶段最应该做好：

1. Hero
2. Upload
3. Paper → TP → Interactive
4. Before / After
5. Mascot Cursor Interaction

只要这五个区域做得好，tpaper 的品牌和产品认知就基本成立。
