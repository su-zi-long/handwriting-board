import { ILine } from "./interface/ILine";
import { IOption } from "./interface/IOption";
import { IPoint } from "./interface/IPoint";

function createCanvas(width: number, height: number, canvasClass?: string) {
  const canvas = document.createElement("canvas");
  if (canvasClass) canvas.classList.add(canvasClass);
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  // 调整分辨率
  const dpr = window.devicePixelRatio;
  canvas.style.cssText = `width:${width}px;height:${height}px;`;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);
  return { canvas, ctx };
}

/**
 * 获取元素到 body 的距离
 * @param el
 * @returns
 */
function getDistanceToBody(el: HTMLElement) {
  const result = {
    top: 0,
    left: 0,
  };
  let element: HTMLElement = el;

  while (element !== document.body) {
    result.top += element.offsetTop;
    result.left += element.offsetLeft;
    if (!element.offsetParent) return result;
    element = element.offsetParent as HTMLElement;
  }
  return result;
}

const defaultOption = {
  width: 500,
  height: 300,
  lineWidth: 5,
  lineColor: "#000000",
  lineCap: "round",
  eraserSize: 20,
};

const isMobile = (function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
})();

/**
 * 手写板
 */
export class HandwritingBoard {
  private option: IOption;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private isMousedown = false;
  private undoStack: ILine[] = [];
  private redoStack: ILine[] = [];

  constructor(option: IOption) {
    this.option = Object.assign(defaultOption, option);

    const { canvas, ctx } = createCanvas(
      this.option.width,
      this.option.height,
      this.option.canvasClass
    );
    this.canvas = canvas;
    this.ctx = ctx;

    this._initEvent(this.canvas);

    if (this.option.el) this.mount(this.option.el);
  }

  /**
   * 监听canvas上的的事件（兼容pc端和移动端）
   * @param canvas
   */
  private _initEvent(canvas: HTMLCanvasElement) {
    let startPoint: IPoint;

    const getPosition = (event) => {
      if (event.offsetX >= 0 && event.offsetY >= 0)
        return { offsetX: event.offsetX, offsetY: event.offsetY };
      const { top, left } = getDistanceToBody(this.canvas);
      const touche = event.changedTouches[0];
      return {
        offsetX: touche.pageX - left,
        offsetY: touche.pageY - top,
      };
    };

    const mousedownHandle = (event) => {
      this.isMousedown = true;
      const { offsetX, offsetY } = getPosition(event);
      this.undoStack.push([[offsetX, offsetY]]);
      startPoint = [offsetX, offsetY];
    };

    const mousemoveHandle = (event) => {
      if (!this.isMousedown) return;
      const { offsetX, offsetY } = getPosition(event);
      const lastLine = this.undoStack[this.undoStack.length - 1];
      lastLine.push([offsetX, offsetY]);
      this._renderLine(startPoint, [offsetX, offsetY]);
      startPoint = [offsetX, offsetY];
    };

    const mouseupHandle = () => {
      this.isMousedown = false;
    };

    if (isMobile) {
      canvas.addEventListener("touchstart", mousedownHandle, false);
      canvas.addEventListener("touchmove", mousemoveHandle, false);
      canvas.addEventListener("touchend", mouseupHandle, false);
    } else {
      canvas.addEventListener("mousedown", mousedownHandle, false);
      canvas.addEventListener("mousemove", mousemoveHandle, false);
      canvas.addEventListener("mouseup", mouseupHandle, false);
      canvas.addEventListener("mouseleave", () => {
        this.isMousedown = false;
      }, false);
    }
  }

  /**
   * 根据开始点和结束点渲染线
   * @param startPoint
   * @param endPoint
   */
  private _renderLine(startPoint: IPoint, endPoint: IPoint) {
    const { ctx } = this;
    ctx.save();
    ctx.beginPath();
    ctx.lineCap = this.option.lineCap;
    ctx.moveTo(startPoint[0], startPoint[1]);
    ctx.lineTo(endPoint[0], endPoint[1]);
    ctx.strokeStyle = this.option.lineColor; // 设置线的颜色
    ctx.lineWidth = this.option.lineWidth; // 设置线的宽度
    ctx.stroke();
    ctx.restore();
  }

  /**
   * 清空画布
   */
  private _clearCanvas() {
    this.ctx.clearRect(0, 0, this.option.width, this.option.height);
  }

  /**
   * 渲染
   * @param lines
   */
  private _render(lines: ILine[]) {
    this._clearCanvas();
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (let j = 1; j < line.length; j++) {
        this._renderLine(line[j - 1], line[j]);
      }
    }
  }

  /**
   * 挂载
   * @param el
   */
  public mount(el?: string | HTMLElement) {
    if (typeof el === "string") el = document.querySelector(el) as HTMLElement;
    if (!el) throw new Error("Please provide the mount point");
    el.appendChild(this.canvas);
  }

  /**
   * 撤销
   */
  public undo() {
    if (this.undoStack.length === 0) return;
    this.redoStack.push(this.undoStack.pop());
    this._render(this.undoStack);
  }

  /**
   * 重做
   */
  public redo() {
    if (this.redoStack.length === 0) return;
    this.undoStack.push(this.redoStack.pop());
    this._render(this.undoStack);
  }

  /**
   * 重置
   */
  public reset() {
    this._clearCanvas();
    this.undoStack = [];
    this.redoStack = [];
  }

  /**
   * 获取图片的bese64字符串
   * @param format
   * @param encoderOptions
   * @returns
   */
  public getImage(format = "image/png", encoderOptions = 0.92) {
    return this.canvas.toDataURL(format, encoderOptions);
  }

  /**
   * 获取图片的blob对象
   * @param format
   * @param encoderOptions
   * @returns
   */
  public getImageBlob(format = "image/png", encoderOptions = 0.92) {
    return new Promise((resolve, reject) => {
      this.canvas.toBlob(
        (blob) => {
          blob ? resolve(blob) : reject(blob);
        },
        format,
        encoderOptions
      );
    });
  }

  /**
   * 下载
   * @param fileName
   */
  public download(fileName = "") {
    const a = document.createElement("a");
    a.download = fileName;
    a.href = this.getImage();
    a.click();
  }
}
