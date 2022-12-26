# 手写板

这是一个基于canvas的手写板工具，兼容pc端和移动端，支持设置笔的粗细和颜色，支持撤销重做，下载图片等功能。

## 使用示例

首先下载npm包
```
npm i web-handwriting-board --save
```

以vue为例
```vue
<template>
  <div id="web-handwriting-board"></div>
</template>

<script>
import { HandwritingBoard } from "web-handwriting-board";

export default {
  mounted() {
    new HandwritingBoard({
      el: "#web-handwriting-board",
    })
  }
};
</script>
```

## 配置
可以向构造函数参数传入手写板的配置参数

```typescript
interface IOption {
  el?: string | HTMLElement; // 手写板的挂载点
  canvasClass?: string; // 手写板的自定义class类
  width?: number; // 手写板的宽度
  height?: number; // 手写板的高度
  lineWidth?: number; // 线条的宽度
  lineColor?: string; // 线条的颜色
  lineCap?: "butt" | "round" | "square"; // 指定如何绘制每一条线段末端的属性
}
```

## 实例方法

```typescript
  /**
   * 讲canvas挂载某一个元素下
   * @param el
   */
  public mount(el?: string | HTMLElement) {}

  /**
   * 撤销
   */
  public undo() {}

  /**
   * 重做
   */
  public redo() {}

  /**
   * 重置手写板
   */
  public reset() {}

  /**
   * 获取图片的bese64字符串
   * @param format
   * @param encoderOptions
   * @returns
   */
  public getImage(format = "image/png", encoderOptions = 0.92) {}

  /**
   * 获取图片的blob对象
   * @param format
   * @param encoderOptions
   * @returns
   */
  public getImageBlob(format = "image/png", encoderOptions = 0.92) {}

  /**
   * 下载图片
   * @param fileName
   */
  public download(fileName = "") {}
```