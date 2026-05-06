## Context

Cool Sudoku 已有完整核心玩法（引擎/棋盘/控制/计时/统计/持久化/i18n），使用 Expo 54 + RN 0.81 + NativeWind + Zustand + react-native-reanimated。本次升级聚焦"体验质感"，不改变核心玩法逻辑。

参考对标：多邻国（Duolingo）的即时正向反馈 + 连胜压力 + 成就收集机制。

## Goals / Non-Goals

**Goals:**
- 每一步操作有即时视觉/触觉/听觉反馈
- 通关时有"爆发感"庆祝体验
- 连胜机制制造每日回来的动力
- 成就系统提供长期收集目标
- 所有动效尊重 reduced-motion 设置

**Non-Goals:**
- 每日挑战（需要后端固定题目）
- 排行榜/社交系统
- 付费/广告
- 背景音乐/环境音

## Decisions

### 1. 庆祝动画：Lottie vs 手写粒子系统

**选择**: Lottie (lottie-react-native)

**理由**:
- 预制动画文件性能稳定，不需要调试粒子物理
- LottieFiles 有大量免费 confetti 素材
- 工作量远小于手写粒子系统
- Expo 生态良好支持

### 2. 音效方案：expo-av vs react-native-sound

**选择**: expo-av

**理由**:
- 已在 Expo 生态内，无需额外 native 配置
- Audio.Sound API 支持预加载和即时播放
- 自动遵循系统静音模式

### 3. 动画框架：全部用 Reanimated vs 部分用 Animated API

**选择**: 全部用 react-native-reanimated（已安装）

**理由**:
- 统一技术栈，不混用两套动画 API
- Reanimated 在 UI 线程运行，性能更好
- withSpring/withSequence/withRepeat 覆盖所有需求场景

### 4. 成就存储：独立 store vs 扩展 stats-store

**选择**: 独立 `achievement-store.ts`

**理由**:
- 职责分离：stats 管统计数据，achievements 管解锁状态
- achievement 的 condition 检查需要读取 stats，但不应耦合在一起
- 独立 persist key 避免数据迁移问题

### 5. 分享截图：react-native-view-shot vs expo-media-library

**选择**: react-native-view-shot + expo-sharing

**理由**:
- view-shot 精确截取成绩卡区域（不是全屏截图）
- expo-sharing 调用原生分享面板，无需适配各平台
- 不需要保存到相册权限

### 6. 行/列/宫完成闪光的数据流

**选择**: Store 状态驱动 + UI 层自动清除

**方案**:
- game-store 新增 `completedGroups: {type: 'row'|'col'|'box', index: number}[]`
- placeNumber action 中检测哪些行/列/宫被完整填充（无冲突），写入 completedGroups
- Cell 组件通过 selector 判断自己是否属于 completedGroups 中的某个 group
- Board 组件用 useEffect 监听 completedGroups 变化，300ms 后调用 `clearCompletedGroups()` action
- 不在 store 中做 setTimeout（避免 store 副作用）

**替代方案**: EventEmitter 通知 UI → 引入额外通信机制，与 Zustand 单向数据流不一致。

### 7. 已有用户 streak 数据迁移

**选择**: Zustand persist version + migrate 一次性迁移

**方案**:
- stats-store persist 配置 `version: 1`
- 定义 `migrate(persisted, version)` 函数
- 当 version === 0（旧数据）且 history.length > 0 时，从 history 中计算 currentStreak/bestStreak/lastCompletedDate 并写入
- 迁移后新字段可直接读取，不再依赖 getOverallStats 每次重新计算

### 8. react-native-view-shot 需要 Development Build

**选择**: 分享功能使用 development build；开发时可降级为文字复制

**方案**:
- react-native-view-shot 不支持 Expo Go，需要 expo-dev-client
- 安装 expo-dev-client 作为前置步骤
- 开发期间如果不方便用 dev build，分享按钮暂时降级为复制文字成绩到剪贴板（`Clipboard.setString`）
- 正式构建（EAS Build）时 view-shot 正常工作

### 9. GameResult 类型扩展

**选择**: 扩展 GameResult 添加 hintsUsed 字段

**方案**:
- `GameResult` 接口新增 `hintsUsed: number`
- game-store 中两处 `recordGame` 调用（placeNumber 完成检测 + hint 完成检测）传入当前 hintsUsed
- 成就 condition 函数和 ResultCard 可据此判断"未使用提示"成就和显示提示次数
- 向后兼容：旧数据中 hintsUsed 为 undefined，展示时 fallback 为 0

## Risks / Trade-offs

- **Lottie 文件体积**: 一个 confetti JSON 约 50-100KB → 可接受，首次加载后缓存
- **音效预加载内存**: 6 个 <20KB 的 MP3 ≈ 120KB 常驻内存 → 可忽略
- **成就检测性能**: 每次完成游戏遍历 18 个条件 → O(18) 轻量计算，无需优化
- **Reduced motion**: 关闭所有装饰性动画后体验是否"无聊" → 保留核心功能反馈（颜色变化），只去除位移/缩放动画
- **react-native-view-shot**: 需要 development build，Expo Go 中不可用 → 开发期间降级为文字复制
- **数据迁移**: 已有用户升级后 streak 字段需要一次性迁移 → 使用 persist migrate 机制处理
