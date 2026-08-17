# tpaper 品牌视觉系统

## 1. 核心视觉方向

tpaper 不采用传统“科技 SaaS”视觉，而采用：

> **极简漫画 × 日系编辑设计 × 工具产品视觉**

核心感觉：

- 简洁
- 年轻
- 智能
- 有一点 nerdy
- 有人味
- 不幼稚
- 不企业化
- 不强 AI 光效

---

## 2. 品牌母题：TP

`TP` 是最重要的品牌视觉资产。

用途：

- Logo Monogram
- Hero 超大字
- Mascot 互动装置
- 背景 Watermark
- Loading
- App Icon
- Badge
- Motion Graphic
- 社交媒体视觉

TP 应该：

- 黑色
- 粗
- 几何
- 平衡
- 易做大尺寸
- 易做单色
- 可与漫画角色互动

---

# 3. Logo

推荐 Logo 体系：

### Primary

```text
TP
tpaper
```

### Horizontal

```text
TP  tpaper
```

### Monogram

```text
TP
```

### Badge

圆形或方形：

```text
[ TP ]
```

Logo 主体应保持极简，手绘元素只作为外部辅助。

---

# 4. Color

建议：

```text
INK
#0F1115

SLATE
#6B7280

MIST
#E7E7EA

PAPER
#FAF7F1

HIGHLIGHT / ORANGE
#FF9D1A

LIME
#A6E22E
```

角色：

### Black

- 主标题
- Logo
- 强边框
- 主按钮

### Orange

- 下划线
- 状态
- Hover
- 箭头
- 星号
- 手绘标记

### Lime

只用于：

- Mascot
- Success
- 少量状态
- 极少视觉焦点

不要让绿色成为页面主色。

---

# 5. Grid Paper Background

背景建议：

```css
background-color: #FAF7F1;
```

叠加非常浅的：

```text
24px / 32px square grid
```

Grid opacity 必须很低。

作用：

- 强化 Paper 概念
- 让页面更像设计稿 / 草稿纸
- 与漫画 doodle 配合

---

# 6. Typography

推荐组合：

### Display

超粗 Grotesk / Sans。

特点：

- Black
- Tight
- Heavy
- 大尺寸

### UI

干净 Sans。

### Metadata

Mono。

使用场景：

```text
01 / UPLOAD
02 / BUILD
03 / ANSWER
```

这种编号特别适合 Mono。

---

# 7. Doodle Language

可以建立一套固定 doodle。

例如：

```text
*
+
x
○
△
{}
→
↗
~
...
```

以及：

- 橙色手绘下划线
- 小星星
- 箭头
- 虚线轨迹
- 铅笔圈
- 手绘括号

原则：

> Doodle 是品牌语气，不是背景噪声。

数量要克制。

---

# 8. Mascot

推荐保留：

> Lime Green Blob Mascot

性格：

```text
Curious
Friendly
A little nerdy
Helpful
Optimistic
```

形态：

- 圆润 Blob
- 大眼睛
- 小 antenna
- 很少细节
- 易做表情
- 易做小尺寸 icon

状态：

```text
happy
thinking
excited
sleepy
confused
focused
celebrating
```

---

# 9. Human Character

可以有一个固定漫画人物：

- 黑色乱发
- 圆框眼镜
- 黑色 Hoodie
- 黑裤
- 白鞋
- 极简日漫角色

用途：

- Hero
- 品牌故事
- 官网
- Launch Visual

但产品内部应该让 Mascot 比人物更高频。

---

# 10. Main Visual Element 方向

推荐 3 个核心视觉母题：

## A. Character + TP

人物靠在超大 TP 字母上。

Mascot 趴在 P 上。

用途：

- Hero
- About
- Social Cover

---

## B. Paper → TP → Interactive

一张试卷：

```text
PAPER
  ↓
 TP MAGIC
  ↓
INTERACTIVE TEST
```

用于解释产品核心概念。

---

## C. Focus / Learn / Improve

Mascot +：

- Pencil
- Notebook
- Score
- Chart
- Sticky Notes
- Timer
- Books

用于：

- Education
- Results
- Marketing

---

# 11. UI Shape Language

组件建议：

- 圆角不要太大
- 卡片偏“纸片”
- 边框明显
- 阴影很轻
- 不做 Glassmorphism
- 可以有轻微漫画式 Offset Shadow

例如：

```text
border: 1.5px solid #0F1115
border-radius: 12px
```

Hover：

```text
translateY(-2px)
rotate(0.3deg)
```

---

# 12. Button

### Primary

黑底：

```text
Turn it interactive →
```

### Secondary

Orange。

### Tertiary

白底 + 黑边框。

按钮避免：

- 大渐变
- Glow
- 3D 厚重效果

---

# 13. Quiz UI 元素语言

推荐组件：

- Question Card
- Radio Option
- Short Answer
- Timer Chip
- Score Ring
- Performance Bar
- Result Badge
- Pagination
- Share Link
- QR Placeholder

但官网展示时：

> 展示“局部组件”，不要展示完整后台 Dashboard。

---

# 14. Icon Style

统一：

- 1.5–2px 黑色 Stroke
- Rounded Linecap
- 简单几何
- 少量 Orange Accent

例如：

- File
- Upload
- Search
- Timer
- Share
- Result
- Chart
- Check
- Spark

---

# 15. 品牌语气

文案可以偏短、偏人性：

```text
Yep. Drop it.

Let TP read this.

Making it interactive...

Almost there.

Done ✓

Your paper is alive.
```

避免：

```text
Our advanced AI-powered infrastructure...
```

品牌表达应更像：

> 工具、朋友、创造者。

而不是企业级平台宣传口吻。
