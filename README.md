# Dishwasher Card · 像素版 🍽️

Nothing 点阵像素风的 Home Assistant 洗碗机状态卡片（Lovelace 自定义卡片 + 集成）。
与 [ha-air-quality-card](https://github.com/greenmini/ha-air-quality-card) **统一设计语言**。

> 🏠 属于 [greenmini · HA 卡片家族](https://github.com/greenmini/ha-cards)，设计语言见 [docs/design.md](https://github.com/greenmini/ha-cards/blob/main/docs/design.md)。

一张卡片显示洗碗机的**电源开关、洗涤进度、剩余时间、当前阶段、洗涤程序、实时功率与总能耗**。

[▶ 在线预览卡片 demo（docs/preview.html）](docs/preview.html)

## 特性

- **5×7 点阵字形渲染全部数值**（灭点保留 7% 底纹，像素屏质感，数值滚动 tween 动画）
- **状态大字**：`RUN` / `IDLE` / `DONE` 点阵渲染 + LED 呼吸灯 + 状态色
- **进度电平块**：4 格四等分（0/25/50/75/100%），颜色随进度切换（<50% 绿、<90% 黄、≥90% 红）
- **VU 分段电平条**：14 段逐段错峰点亮，进度 / 剩余时间 / 功率三路电平
- **微网格底**：22px 细格背景 38 秒缓慢漂移
- **动效**：点阵数字逐帧滚动、级联入场揭示、尊重 `prefers-reduced-motion`
- 🔘 点击卡片任意处 = 开关电源；`POWER` / `INFO` 按钮
- 深色底、等宽字体，与空气质量卡片风格完全统一

## 安装

### 方式一：HACS（推荐）

1. HACS → 右上角 ⋮ → **自定义存储库**
2. 仓库地址：`https://github.com/greenmini/dishwasher-card`
3. 类别选择：**集成 (Integration)** → 添加
4. HACS → 集成 → 搜索 `Dishwasher Card` → 下载
5. 重启 Home Assistant

安装后卡片 JS 由 HA 自己托管并自动注入前端，**无需手动添加 Lovelace 资源**。

### 方式二：手动（仅前端资源）

1. 下载 [dishwasher-card.js](https://raw.githubusercontent.com/greenmini/dishwasher-card/main/custom_components/dishwasher_card/dishwasher-card.js) 放到 `/config/www/`
2. 设置 → 仪表盘 → 资源 → 添加：
   ```yaml
   url: /local/dishwasher-card.js
   type: module
   ```
   或直接引用 CDN：
   ```yaml
   url: https://cdn.jsdelivr.net/gh/greenmini/dishwasher-card@main/custom_components/dishwasher_card/dishwasher-card.js
   type: module
   ```

## 使用

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

- 任一信号为「运行中」即显示 `RUN`：`running` 为 `on`、或 `state` 非 `off/idle/unknown…`、或功率 > 10W
- `state` 为 `finish/finished/done/clean` 时显示 `DONE`

## 支持的设备

卡片不绑定具体品牌，只要 HA 里有对应的传感器即可，特别适配：

- **ha_washdata** 集成生成的 `washing_machine_*` 系列实体（洗碗机状态机）
- 任意电源开关实体（如 ESPHome 继电器 `cp7_*`）

## 常见问题

**卡片显示「Card not found」** → 资源未加载，检查：
1. HACS 方式是否已重启 HA；手动方式是否已添加资源并强制刷新（Ctrl+F5）
2. 若同时通过多种方式加载（CDN + 本地 + 集成），只会注册一次，不会冲突（已做防重复保护）

**开关按钮无效** → 确认 `entity` 是 switch 域且 HA 能正常控制它。

## License

MIT
