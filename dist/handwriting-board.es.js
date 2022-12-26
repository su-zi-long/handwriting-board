function createCanvas(width, height, canvasClass) {
  const canvas = document.createElement("canvas");
  if (canvasClass)
    canvas.classList.add(canvasClass);
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio;
  canvas.style.cssText = `width:${width}px;height:${height}px;`;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);
  return { canvas, ctx };
}
function getDistanceToBody(el) {
  const result = {
    top: 0,
    left: 0
  };
  let element = el;
  while (element !== document.body) {
    result.top += element.offsetTop;
    result.left += element.offsetLeft;
    if (!element.offsetParent)
      return result;
    element = element.offsetParent;
  }
  return result;
}
const defaultOption = {
  width: 500,
  height: 300,
  lineWidth: 5,
  lineColor: "#000000",
  lineCap: "round",
  eraserSize: 20
};
const isMobile = function isMobile2() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}();
class HandwritingBoard {
  constructor(option) {
    this.isMousedown = false;
    this.undoStack = [];
    this.redoStack = [];
    this.option = Object.assign(defaultOption, option);
    const { canvas, ctx } = createCanvas(
      this.option.width,
      this.option.height,
      this.option.canvasClass
    );
    this.canvas = canvas;
    this.ctx = ctx;
    this._initEvent(this.canvas);
    if (this.option.el)
      this.mount(this.option.el);
  }
  _initEvent(canvas) {
    let startPoint;
    const getPosition = (event) => {
      if (event.offsetX >= 0 && event.offsetY >= 0)
        return { offsetX: event.offsetX, offsetY: event.offsetY };
      const { top, left } = getDistanceToBody(this.canvas);
      const touche = event.changedTouches[0];
      return {
        offsetX: touche.pageX - left,
        offsetY: touche.pageY - top
      };
    };
    const mousedownHandle = (event) => {
      this.isMousedown = true;
      const { offsetX, offsetY } = getPosition(event);
      this.undoStack.push([[offsetX, offsetY]]);
      startPoint = [offsetX, offsetY];
    };
    const mousemoveHandle = (event) => {
      if (!this.isMousedown)
        return;
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
  _renderLine(startPoint, endPoint) {
    const { ctx } = this;
    ctx.save();
    ctx.beginPath();
    ctx.lineCap = this.option.lineCap;
    ctx.moveTo(startPoint[0], startPoint[1]);
    ctx.lineTo(endPoint[0], endPoint[1]);
    ctx.strokeStyle = this.option.lineColor;
    ctx.lineWidth = this.option.lineWidth;
    ctx.stroke();
    ctx.restore();
  }
  _clearCanvas() {
    this.ctx.clearRect(0, 0, this.option.width, this.option.height);
  }
  _render(lines) {
    this._clearCanvas();
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (let j = 1; j < line.length; j++) {
        this._renderLine(line[j - 1], line[j]);
      }
    }
  }
  mount(el) {
    if (typeof el === "string")
      el = document.querySelector(el);
    if (!el)
      throw new Error("Please provide the mount point");
    el.appendChild(this.canvas);
  }
  undo() {
    if (this.undoStack.length === 0)
      return;
    this.redoStack.push(this.undoStack.pop());
    this._render(this.undoStack);
  }
  redo() {
    if (this.redoStack.length === 0)
      return;
    this.undoStack.push(this.redoStack.pop());
    this._render(this.undoStack);
  }
  reset() {
    this._clearCanvas();
    this.undoStack = [];
    this.redoStack = [];
  }
  getImage(format = "image/png", encoderOptions = 0.92) {
    return this.canvas.toDataURL(format, encoderOptions);
  }
  getImageBlob(format = "image/png", encoderOptions = 0.92) {
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
  download(fileName = "") {
    const a = document.createElement("a");
    a.download = fileName;
    a.href = this.getImage();
    a.click();
  }
}
export { HandwritingBoard };
