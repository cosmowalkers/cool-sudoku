# Cool Sudoku 体验升级设计

## 概述

提升数独 App 的游戏体验和质感，参考多邻国的激励机制（连胜/即时反馈/成就收集），分 5 个阶段递进实施。

## Phase 1：微交互打磨

### 1.1 填数动画

- 数字出现时 scale 0.6→1.0 + opacity 0→1，spring 弹跳曲线（150ms）
- 使用 `react-native-reanimated` 的 `useAnimatedStyle` + `withSpring`

### 1.2 错误抖动

- 错误放置时格子水平抖动：左右各 4px，3 次，200ms
- 使用 `withSequence` + `withTiming` 实现
- 配合已有的 haptic error 反馈

### 1.3 行/列/宫完成闪光

- 当一行/列/宫完整填满且无冲突时：
- 该组所有格子同时 opacity pulse（0→0.3→0，300ms）
- 检测逻辑：placeNumber 后扫描相关行/列/宫是否完整

### 1.4 数字面板按压

- 按下：scale 0.9 + opacity 0.8（withSpring）
- 松开：spring 弹回 1.0
- 使用 `Gesture.Tap` + `useAnimatedStyle`

### 1.5 选中格子脉冲

- 选中格子边框 opacity 循环 0.6↔1.0（1.5s 周期）
- 使用 `withRepeat` + `withTiming`
- 尊重 reduced-motion：关闭时取消脉冲

---

## Phase 2：完成庆祝

### 2.1 撒彩纸（Lottie）

- 使用 `lottie-react-native` 播放 confetti 动画 JSON
- 素材来源：LottieFiles 免费 confetti 动画
- 全屏覆盖，`autoPlay` + `loop={false}`，播完通过 `onAnimationFinish` 隐藏
- 动画文件放在 `assets/lottie/confetti.json`
- 尊重 reduced-motion：开启时跳过 Lottie，直接显示成绩卡

### 2.2 成绩卡片

- 庆祝动画后从底部 slide-in（300ms ease-out）
- 内容：难度标签 + 用时 + 错误次数 + 提示次数
- 新纪录时高亮 "🏆 新纪录！"
- 底部按钮："分享" + "新游戏"
- 视觉：圆角 16px、surface 背景、轻阴影

### 2.3 分享功能

- 使用 `react-native-view-shot` 截取成绩卡区域为图片
- 使用 `expo-sharing` 调用系统分享面板
- 图片内容：App 名称 + 难度 + 用时 + 水印
- 新增依赖：`react-native-view-shot`、`expo-sharing`

---

## Phase 3：音效系统

### 3.1 音效清单

| ID | 触发时机 | 风格 | 时长 |
|----|----------|------|------|
| `pop` | 填入数字 | 轻柔气泡 | ~80ms |
| `error` | 错误放置 | 低沉短促 | ~120ms |
| `undo` | 撤销 | 倒带回退 | ~100ms |
| `lineClear` | 行/列/宫完成 | 上升音阶 | ~200ms |
| `complete` | 通关 | 庆祝短旋律 | ~800ms |
| `achievement` | 成就解锁 | 金属徽章掉落 | ~300ms |

### 3.2 技术实现

- 使用 `expo-av` 的 `Audio.Sound`
- 创建 `lib/audio/index.ts`：
  - App 启动时 `preloadSounds()` 预加载所有音效到内存
  - 导出 `playSound(id: SoundId)` 函数
- 音效文件：MP3 格式，放在 `assets/sounds/`
- 音量统一 0.3-0.5

### 3.3 静音控制

- `useLocaleStore`（或新建 `useSettingsStore`）中添加 `isMuted: boolean`
- 统计页语言切换旁加静音 toggle 按钮
- `playSound` 内部检查 `isMuted`，为 true 时不播放

### 3.4 克制原则

- 无背景音乐
- 无按钮点击音（只有填数有声音）
- 无选格音效
- 尊重系统静音模式（`expo-av` 会自动遵循）

---

## Phase 4：连胜系统

### 4.1 规则

- 每自然日完成 ≥1 局（任意难度）= 保持连胜
- 整天未完成 = 连胜归零
- 最小单位：天（不是局）

### 4.2 数据模型

在 `useStatsStore` 新增字段（persist）：

```typescript
currentStreak: number;      // 当前连胜天数
bestStreak: number;         // 历史最高
lastCompletedDate: string | null; // "YYYY-MM-DD"
```

更新逻辑（每次 `recordGame` 时）：
- 如果 `lastCompletedDate === today` → 不变
- 如果 `lastCompletedDate === yesterday` → currentStreak++
- 如果 `lastCompletedDate` 更早或 null → currentStreak = 1
- 更新 `bestStreak = max(bestStreak, currentStreak)`
- 设置 `lastCompletedDate = today`

### 4.3 视觉状态

| 状态 | 图标 | 颜色 |
|------|------|------|
| 今日已完成 | 火焰 | 橙色 (#F59E0B) |
| 今日未完成 | 火焰 | 灰色 (#94A3B8) |
| 连胜为 0 | 无火焰 | — |

### 4.4 展示位置

- 游戏页顶栏：难度标签与重来按钮之间显示 `🔥 {n}`
- 统计页：现有连胜卡片升级为带火焰图标 + 进度条

### 4.5 里程碑庆祝

- 连胜达到 3/7/14/30/100 天时，完成那局后额外弹出：
  - 复用 Lottie 庆祝动画
  - 文案："连胜 {n} 天！" + 鼓励语
  - 关联成就徽章解锁

---

## Phase 5：成就徽章系统

### 5.1 徽章定义（18 个）

**入门（4）：**
- `first-win`：初出茅庐 — 完成第一局
- `zero-mistakes`：零失误 — 任意难度零错误通关
- `speed-easy`：闪电手 — 简单难度 5 分钟内通关
- `no-hints`：不靠提示 — 不使用提示通关

**进阶（6）：**
- `master-easy`：简单大师 — 简单完成 10 局
- `master-medium`：中等大师 — 中等完成 10 局
- `master-hard`：困难大师 — 困难完成 10 局
- `master-expert`：专家大师 — 专家完成 10 局
- `perfectionist`：完美主义 — 困难或专家零失误通关
- `speed-medium`：速度恶魔 — 中等 10 分钟内通关

**连胜（4）：**
- `streak-3`：三日之火 — 连胜 3 天
- `streak-7`：周冠军 — 连胜 7 天
- `streak-14`：半月达人 — 连胜 14 天
- `streak-30`：月度传奇 — 连胜 30 天

**里程碑（4）：**
- `games-10`：初具规模 — 累计完成 10 局
- `games-50`：半百成就 — 累计完成 50 局
- `games-100`：百局殿堂 — 累计完成 100 局
- `all-difficulties`：全难度通关 — 四个难度各完成 ≥1 局

### 5.2 技术架构

```typescript
// stores/achievement-store.ts
interface Achievement {
  id: string;
  name: string;          // 中英文通过 i18n key
  icon: string;          // emoji
  descriptionKey: string; // i18n key
  condition: (stats: StatsSnapshot) => boolean;
}

interface AchievementState {
  unlockedIds: string[];           // 已解锁 ID（persist）
  unlockedDates: Record<string, string>; // { id: "YYYY-MM-DD" }
  newlyUnlocked: string[];         // 本次新解锁的（用于触发弹窗）
  checkAchievements: () => void;
  clearNewlyUnlocked: () => void;
}
```

- `checkAchievements()` 在每次 `recordGame` 后调用
- 从 `useStatsStore` 读取快照（totalPlayed, streaks, 各难度完成数等）
- 遍历所有未解锁的 achievement，检查 condition

### 5.3 解锁动画

- 完成庆祝流程结束后检查 `newlyUnlocked`
- 依次弹出徽章卡片（间隔 500ms）：
  - Lottie 光芒/星星背景动画
  - 大号 emoji + 名称 + 解锁条件
  - 播放 `achievement` 音效
  - 2 秒后自动消失或点击关闭

### 5.4 成就展示页

- 在统计页添加"成就"section（或作为第三个 tab）
- 网格布局展示 18 个徽章：
  - 已解锁：彩色 emoji + 名称
  - 未解锁：灰色圆形 + "???"
- 顶部进度条："5/18 已解锁"
- 点击已解锁徽章 → 底部 sheet 显示解锁日期 + 描述

### 5.5 徽章图标

- MVP 使用 emoji 字符（🌱⭐⚡🧠🎯💎🚀🔥📊🏆）
- 仅用在成就系统内的装饰性展示
- 后续可替换为自定义 SVG 插画

---

## 新增依赖汇总

| 包名 | 用途 | Phase |
|------|------|-------|
| `lottie-react-native` | 庆祝/成就动画 | 2, 4, 5 |
| `react-native-view-shot` | 成绩卡截图 | 2 |
| `expo-sharing` | 系统分享 | 2 |
| `expo-av` | 音效播放 | 3 |

---

## 不做的事（YAGNI）

- 不做每日挑战（固定题目需要后端，留给后续）
- 不做排行榜（需要后端）
- 不做社交好友系统
- 不做付费解锁/广告
- 不做自定义主题换肤
- 不做复杂的等级/经验值系统

---

## i18n 扩展

所有新增的用户可见文本需要同时添加到 `lib/i18n/locales/zh.ts` 和 `en.ts`，包括：
- 成就名称和描述（18×2 = 36 条）
- 连胜相关文案（里程碑庆祝语、状态标签）
- 音效设置标签
- 成绩卡分享文案

---

## 验证标准

1. `npx tsc --noEmit` 通过
2. `npm test` 通过
3. 填入数字有弹跳动画 + pop 音效
4. 错误时抖动 + error 音效 + haptic
5. 通关时 confetti + 成绩卡 + 庆祝音效
6. 连胜计数正确（跨天测试）
7. 成就解锁弹窗正常展示
8. 静音开关生效
9. reduced-motion 下动画正确降级
10. 中英文切换后所有新文案正确显示
