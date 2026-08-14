# Dishwasher Card 🍽️

一体化洗碗机状态卡片（Home Assistant Lovelace 自定义卡片 + 集成）。

一张卡片显示洗碗机的**电源开关、洗涤进度、剩余时间、当前阶段、洗涤程序、实时功率与总能耗**。
点击卡片任意处即可开关电源；点击「详情」打开实体详情。

[▶ 在线预览卡片 demo（docs/preview.html）](docs/preview.html)

## 功能

- 🌀 状态徽章：`运行中`（绿）/ `空闲`（灰）/ `完成`（绿）
- 📊 洗涤进度条（自动变色：<50% 绿、<90% 黄、≥90% 红）
- ⏱️ 剩余时间自动格式化（`45 分钟` / `1小时20分`）
- ⚡ 当前功率（超 1kW 自动换算为 kW）
- 🧾 明细行：当前阶段 / 洗涤程序 / 总能耗 / 循环次数
- 🔘 点击卡片 = 开关电源；`详情` 按钮 = 打开实体详情
- 🌐 支持深色/浅色主题，自动跟随 HA 主题变量

## 安装

### 方式一：HACS（推荐）

1. HACS → 右上角 ⋮ → **自定义存储库**
2. 仓库地址：`https://github.com/greenmini/dishwasher-card`
3. 类别选择：**集成 (Integration)** → 添加
4. HACS → 集成 → 搜索 `Dishwasher Card` → 下载
5. 重启 Home Assistant

安装后卡片 JS 由 HA 自己托管并自动注入前端，**无需手动添加 Lovelace 资源**。

### 方式二：手动

1. 将 `custom_components/dishwasher_card/` 整个文件夹复制到 HA 的 `custom_components/` 目录
2. 重启 Home Assistant

## 使用

在仪表盘任意卡片里添加：

```yaml
type: custom:dishwasher-card
entity: switch.cp7_cp7_relay            # 电源开关（必填）
name: 洗碗机
state: sensor.washing_machine_state
running: binary_sensor.washing_machine_running
progress: sensor.washing_machine_progress
time_remaining: sensor.washing_machine_time_remaining
current_power: sensor.washing_machine_current_power
phase: sensor.washing_machine_current_phase
program: sensor.washing_machine_program
energy: sensor.chu_fang_dishwasher_energy_total
cycle_count: sensor.washing_machine_cycle_count
```

### 配置项

| 键 | 必填 | 说明 |
|---|---|---|
| `entity` | ✅ | 洗碗机电源开关实体（点击卡片切换） |
| `name` | ❌ | 卡片标题，默认 `洗碗机` |
| `state` | ❌ | 状态传感器（`off`/`running`/`finish`…） |
| `running` | ❌ | 运行中 binary_sensor（`on` 表示运行中） |
| `progress` | ❌ | 进度传感器（0-100 %） |
| `time_remaining` | ❌ | 剩余时间传感器（分钟） |
| `current_power` | ❌ | 实时功率传感器（W） |
| `phase` | ❌ | 当前阶段传感器 |
| `program` | ❌ | 洗涤程序传感器 |
| `energy` | ❌ | 总能耗传感器（kWh） |
| `cycle_count` | ❌ | 循环次数传感器 |

## 状态判定逻辑

- 任一信号为「运行中」即显示 `运行中`：`running` 为 `on`、或 `state` 非 `off/idle/unknown…`、或功率 > 10W
- `state` 为 `finish/finished/done/clean` 时显示 `完成`

## 支持的设备

卡片不绑定具体品牌，只要 HA 里有对应的传感器即可，特别适配：

- **ha_washdata** 集成生成的 `washing_machine_*` 系列实体（洗碗机状态机）
- 任意电源开关实体（如 ESPHome 继电器 `cp7_*`）

## 常见问题

**卡片显示「Card not found」** → 集成未加载或 JS 未注入，检查：
1. 是否已重启 HA
2. 浏览器是否缓存了旧页面（强制刷新 Ctrl+F5）

**开关按钮无效** → 确认 `entity` 是 switch 域且 HA 能正常控制它。

## License

MIT
