## Why

Cool Sudoku 已实现完整的核心玩法，但整体体验"粗糙"：无动画过渡、无音效反馈、无情感化设计。用户完成一局后没有"爆发感"，缺乏每天回来的动力。需要参考多邻国的激励机制，系统性提升游戏质感和留存。

## What Changes

- 新增微交互动效（填数弹跳、错误抖动、行列完成闪光、按压反馈）
- 新增通关庆祝（Lottie 撒彩纸 + 成绩卡片 + 分享功能）
- 新增极简音效系统（6 个关键操作音效 + 静音开关）
- 新增连胜系统（每日火焰 + 里程碑庆祝）
- 新增成就徽章体系（18 个徽章 + 解锁动画 + 展示页）

## Capabilities

### New Capabilities

- `micro-interactions`: 填数/错误/完成/按压的动画反馈系统
- `celebration`: 通关庆祝流程（Lottie confetti + 成绩卡 + 截图分享）
- `audio-system`: 极简音效引擎（预加载/播放/静音控制）
- `streak-system`: 每日连胜机制（计算/展示/里程碑）
- `achievements`: 成就徽章体系（定义/检测/解锁动画/展示页）

### Modified Capabilities

（无已有 capabilities 需修改，所有新功能叠加在现有架构之上）

## Impact

- **依赖**: 新增 lottie-react-native、expo-av、react-native-view-shot、expo-sharing
- **Store**: 新增 achievement-store，扩展 stats-store（连胜字段）、新增 settings 字段（静音）
- **Assets**: 新增 assets/lottie/（动画文件）、assets/sounds/（音效文件）
- **组件**: 新增动画 wrapper 组件、庆祝 overlay、成就展示页
- **i18n**: 扩展字典（成就名称/描述约 40 条新文本）
