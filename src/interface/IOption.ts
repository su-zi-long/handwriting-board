export interface IOption {
  el?: string | HTMLElement;
  canvasClass?: string;
  width?: number;
  height?: number;
  lineWidth?: number;
  lineColor?: string;
  lineCap?: "butt" | "round" | "square"; // 指定如何绘制每一条线段末端的属性
}
