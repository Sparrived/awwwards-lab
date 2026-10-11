# <条目名>

- 类别：<category>
- 来源：[awwwards](<awwwards_url>) → [原站](<live_url>)
- 作者：<author> ｜ 获奖：<award_date>
- 萃取机制：<extracted_mechanism>

## 这是什么

<summary>

## 取证记录（真实测量，非推测）

| 项 | 值 | 来源 |
| --- | --- | --- |
| 主色 | `#------` | `getComputedStyle` on `.selector` |
| 字体 | `---` | 同上 |
| 动效时长 | `---ms` | `getAnimations()` |
| 缓动曲线 | `cubic-bezier(...)` | `getAnimations()[0].easing` |
| 触发条件 | scroll / hover / load | 交互实测 |

截图：`shots/hero.png`、`shots/section-1.png`

## 怎么用

```html
<!-- 最小用法示例 -->
```

调用说明：<api>

## 怎么改

- token 在 `src/component.css` 顶部的 `:root` 块；
- 行为参数在 `src/component.js` 顶部常量区；
- 断点/降级：<说明>

## 依赖

<deps 列表 + 断网时的降级行为；无依赖写「无」>

## 清洁室声明

未复制原站代码、图片、字体、视频或品牌文案；素材以 CSS 渐变 / 生成 SVG 占位。
字体替代：<商用字体 → 免费替代，或「原站即用免费字体」>。
