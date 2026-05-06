## 1. 依赖安装与资源准备

- [ ] 1.0 安装 expo-dev-client 并配置 development build（react-native-view-shot 需要）
- [ ] 1.1 使用 npx expo install 安装 lottie-react-native（确保 Expo 兼容版本）
- [ ] 1.2 使用 npx expo install 安装 expo-av（音效播放）
- [ ] 1.3 使用 npx expo install 安装 react-native-view-shot 和 expo-sharing（截图分享）
- [ ] 1.4 下载 confetti Lottie 动画 JSON 放入 assets/lottie/
- [ ] 1.5 准备 6 个音效 MP3 文件放入 assets/sounds/（pop/error/undo/lineClear/complete/achievement）
- [ ] 1.6 扩展 i18n 字典（zh.ts + en.ts）：成就名称/描述、连胜文案、音效设置标签、成绩卡文案
- [ ] 1.7 扩展 GameResult 类型添加 hintsUsed 字段，修改 game-store 中 recordGame 调用传入 hintsUsed

## 2. 微交互动效 (Phase 1)

- [ ] 2.0 将 Cell.tsx 中的 Text/View 替换为 Animated.Text/Animated.View（Reanimated 前提）
- [ ] 2.1 实现 Cell 填数动画：useAnimatedStyle + withSpring（scale 0.6→1 + opacity）
- [ ] 2.2 实现错误抖动动画：withSequence + withTiming（水平 ±4px × 3 次）
- [ ] 2.3 实现行/列/宫完成闪光：在 store 中加 completedGroups 状态 + 检测逻辑 + Cell opacity pulse + Board 300ms 后 clearCompletedGroups
- [ ] 2.4 实现 NumberPad 按压动画：Gesture.Tap + useAnimatedStyle（scale 0.9 弹回）
- [ ] 2.5 实现选中格子脉冲：withRepeat + withTiming（border opacity 循环）
- [ ] 2.6 添加 reduced-motion 检测：useReducedMotion hook，所有动画条件判断

## 3. 通关庆祝 (Phase 2)

- [ ] 3.1 创建 components/Celebration/Confetti.tsx：Lottie 全屏播放组件
- [ ] 3.2 创建 components/Celebration/ResultCard.tsx：成绩卡片 UI（难度/时间/错误/提示）
- [ ] 3.3 实现新纪录检测逻辑：对比当前用时与 stats-store 中该难度 bestTime
- [ ] 3.4 实现截图分享功能：view-shot 截取 + expo-sharing 调用系统面板
- [ ] 3.5 重构游戏完成流程：替换现有完成 overlay → Confetti → ResultCard 序列
- [ ] 3.6 ResultCard slide-in 动画（300ms ease-out from bottom）

## 4. 音效系统 (先于庆祝，因为庆祝流程需要播放 complete 音效)

- [ ] 4.1 创建 lib/audio/index.ts：preloadSounds / playSound / unloadSounds 函数
- [ ] 4.2 在 stores/game-store.ts 或独立 settings 中添加 isMuted 状态（persist）
- [ ] 4.3 在 placeNumber action 后调用 playSound('pop')，错误时追加 playSound('error')
- [ ] 4.4 在 undo action 后调用 playSound('undo')
- [ ] 4.5 行/列/宫完成时调用 playSound('lineClear')
- [ ] 4.6 通关时调用 playSound('complete')
- [ ] 4.7 在统计页添加静音 toggle 按钮（🔊/🔇）
- [ ] 4.8 App 启动时预加载音效（在 _layout.tsx 或 useEffect 中）

## 5. 连胜系统 (Phase 4)

- [ ] 5.1 扩展 stats-store：添加 currentStreak / bestStreak / lastCompletedDate 字段 + persist version: 1 + migrate 从 history 计算初始 streak
- [ ] 5.2 在 recordGame 中实现连胜计算逻辑（today/yesterday/older 三分支），替换 getOverallStats 中的旧 streak 计算
- [ ] 5.3 创建 components/Streak/StreakBadge.tsx：火焰图标 + 天数显示
- [ ] 5.4 在游戏页顶栏集成 StreakBadge（橙色/灰色状态切换）
- [ ] 5.5 在统计页更新连胜卡片（带火焰图标）
- [ ] 5.6 实现里程碑庆祝弹窗（3/7/14/30/100 天触发 Lottie + 文案）

## 6. 成就徽章系统 (Phase 5)

- [ ] 6.1 创建 stores/achievement-store.ts：Achievement 定义 + state + checkAchievements
- [ ] 6.2 定义 18 个成就的 condition 函数（读取 stats snapshot 判断）
- [ ] 6.3 在 recordGame 后调用 checkAchievements()
- [ ] 6.4 创建 components/Achievement/UnlockCard.tsx：解锁弹窗 UI（Lottie + emoji + 名称）
- [ ] 6.5 在游戏完成流程中集成解锁弹窗（confetti → result → achievements 序列）
- [ ] 6.6 创建成就展示页 UI：网格布局 + 进度条 + 已解锁/未解锁状态
- [ ] 6.7 将成就页集成到统计 tab 中（作为 section 或子页面）
- [ ] 6.8 成就解锁时播放 playSound('achievement')

## 7. 收尾

- [ ] 7.1 全部动画添加 reduced-motion 降级（跳过动画只保留颜色反馈）
- [ ] 7.2 深色模式适配新组件（Confetti overlay / ResultCard / StreakBadge / AchievementGrid）
- [ ] 7.3 TypeScript 类型检查通过
- [ ] 7.4 运行已有单元测试确保不 break
