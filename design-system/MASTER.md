# Cool Sudoku - Design System

## Style: Swiss Modernism 2.0 + Clean Game

数独是专注型益智游戏，设计风格应保持**沉静、高对比度、不刺眼**，让用户可以长时间注视数字网格而不疲劳。

### Design Principles

1. **Content-First**: 棋盘是核心，所有装饰让位于数字可读性
2. **Mathematical Precision**: 网格对齐、等距间距、严格的 8dp spacing system
3. **Calm Focus**: 柔和背景 + 精确高亮，不分散注意力
4. **Minimal Decoration**: 没有多余的渐变/阴影/动效，仅在交互反馈时使用

---

## Color Tokens

### Light Mode

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-primary` | `#2563EB` | 选中格高亮、主按钮 |
| `--color-primary-light` | `#DBEAFE` | 关联格（同行/列/宫）淡蓝背景 |
| `--color-secondary` | `#7C3AED` | 相同数字高亮 |
| `--color-secondary-light` | `#EDE9FE` | 相同数字格背景 |
| `--color-accent` | `#F59E0B` | 完成/成就金色 |
| `--color-background` | `#F8FAFC` | 页面背景（极浅灰蓝） |
| `--color-surface` | `#FFFFFF` | 棋盘/卡片表面 |
| `--color-foreground` | `#0F172A` | 主文本（Given 数字） |
| `--color-foreground-muted` | `#64748B` | 次要文本 |
| `--color-user-input` | `#2563EB` | 用户输入数字（蓝色区分） |
| `--color-error` | `#DC2626` | 冲突/错误标记 |
| `--color-error-light` | `#FEE2E2` | 错误格背景 |
| `--color-border` | `#E2E8F0` | 细边框（格线） |
| `--color-border-thick` | `#334155` | 粗边框（宫格分隔） |
| `--color-note` | `#64748B` | 笔记数字 |
| `--color-hint` | `#059669` | 提示数字（绿色） |

### Dark Mode

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-primary` | `#60A5FA` | 选中格高亮 |
| `--color-primary-light` | `#1E3A5F` | 关联格背景 |
| `--color-secondary` | `#A78BFA` | 相同数字高亮 |
| `--color-secondary-light` | `#2D2054` | 相同数字格背景 |
| `--color-accent` | `#FBBF24` | 完成金色 |
| `--color-background` | `#0F172A` | 页面背景 |
| `--color-surface` | `#1E293B` | 棋盘/卡片表面 |
| `--color-foreground` | `#F1F5F9` | 主文本 |
| `--color-foreground-muted` | `#94A3B8` | 次要文本 |
| `--color-user-input` | `#60A5FA` | 用户输入数字 |
| `--color-error` | `#F87171` | 冲突标记 |
| `--color-error-light` | `#451A1A` | 错误格背景 |
| `--color-border` | `#334155` | 细边框 |
| `--color-border-thick` | `#CBD5E1` | 粗边框 |
| `--color-note` | `#94A3B8` | 笔记数字 |
| `--color-hint` | `#34D399` | 提示数字 |

---

## Typography

### Font Family

- **Primary**: Inter (系统已安装 / expo-font 加载)
- **Numeric Display**: Inter with tabular-nums (等宽数字，防止布局偏移)

### Type Scale

| Usage | Size | Weight | Line Height |
|-------|------|--------|-------------|
| Given Number (棋盘) | 24px | 700 (Bold) | 1 |
| User Number (棋盘) | 24px | 500 (Medium) | 1 |
| Note Number (笔记) | 10px | 400 (Regular) | 1 |
| Timer | 20px | 600 (SemiBold) | 1 |
| Section Title | 18px | 600 (SemiBold) | 1.4 |
| Body Text | 16px | 400 (Regular) | 1.5 |
| Label | 14px | 500 (Medium) | 1.4 |
| Caption | 12px | 400 (Regular) | 1.4 |

---

## Spacing System (8dp)

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 4px | 笔记数字内间距 |
| `sm` | 8px | 格子内 padding、控制按钮间距 |
| `md` | 16px | 区块内 padding、元素间距 |
| `lg` | 24px | 区块间距 |
| `xl` | 32px | 页面级间距 |
| `2xl` | 48px | 主要区域分隔 |

---

## Grid & Board Layout

### Cell Dimensions

- Cell size: 根据屏幕宽度动态计算 `(screenWidth - 2 * horizontalPadding) / 9`
- 最小 cell: 36px（iPhone SE），最大 cell: 44px（大屏）
- 宫格粗边框: 2px
- 格子细边框: 0.5px (hairline)

### Board Structure

```
┌───┬───┬───┐  ← 2px 粗边框
│ · │ · │ · │  ← 0.5px 细边框
├───┼───┼───┤
│ · │ · │ · │
├───┼───┼───┤
│ · │ · │ · │
├═══╪═══╪═══┤  ← 2px 宫格分隔
│ · │ · │ · │
...
```

---

## Interaction Design

### Touch Targets

- Number pad button: 48×48dp minimum (实际可视 44×44 + 4dp spacing)
- Action button (undo/erase/note/hint): 44×44dp
- Cell tap area: 等于 cell size（最小 36×36dp，通过 hitSlop 扩展）

### Feedback

- **Cell selection**: 即时高亮（无延迟），背景色变化
- **Number placement**: 轻触觉反馈 (Haptics.impactAsync light)
- **Error placement**: 中等触觉反馈 (Haptics.notificationAsync error)
- **Puzzle complete**: 成功触觉反馈 (Haptics.notificationAsync success)
- **Button press**: opacity 0.7 during press (150ms transition)

### Animation

- **Duration**: 150ms for micro-interactions, 250ms for state transitions
- **Easing**: ease-out for entering states, ease-in for exiting
- **Reduced motion**: 尊重系统设置，禁用所有装饰性动画
- **NO animation on**: cell number rendering (must be instant for gameplay)

---

## Component Patterns

### Number Pad

- 1 行 9 个数字（横排），或 3×3 grid（竖排空间充裕时）
- 已完成数字（9 个都放置了）: opacity 0.3 + 不可点击
- Active mode indicator: 笔记模式时 pad 背景加深

### Action Bar

- 4 个按钮一行: Undo | Erase | Notes | Hint
- 使用 icon + label（不能只有 icon，需有 accessibilityLabel）
- Icon style: Lucide icons, stroke width 2px, size 20px

### Stats Cards

- 圆角 12px
- 内 padding 16px
- Shadow: none (flat style) 或极淡 shadow (0 1px 3px rgba(0,0,0,0.05))

---

## Accessibility Requirements

- [ ] 所有文本对比度 ≥ 4.5:1 (WCAG AA)
- [ ] 棋盘数字使用 tabular-nums 防止宽度跳动
- [ ] Touch target ≥ 44×44pt
- [ ] 支持 Dynamic Type（数字不截断）
- [ ] VoiceOver: cell 读出 "Row 3 Column 5, value 7" 或 "Row 3 Column 5, empty"
- [ ] 尊重 prefers-reduced-motion
- [ ] 错误不仅用红色，同时有文字提示
- [ ] 暂停按钮有明确的 accessibilityLabel

---

## Anti-Patterns (AVOID)

- ❌ 粉色/霓虹色主色调（长时间注视疲劳）
- ❌ 格子动画入场/出场（影响 gameplay 节奏）
- ❌ 渐变色背景（分散对数字的注意力）
- ❌ 圆形格子或非标准网格形状
- ❌ 数字使用 emoji 字符
- ❌ 过多的阴影/深度（保持平面清晰）
- ❌ 自定义字体用于棋盘数字（可读性优先）
- ❌ 横向滚动的任何内容
