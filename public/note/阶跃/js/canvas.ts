interface SvgBasicRec {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Shadow {
  offsetX?: number;
  offsetY?: number;
  color?: string;
  blur?: number;
}

interface SvgRec extends SvgBasicRec {
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  backgroundColor?: string;
  overFlowHidden?: boolean;
  shadow?: Shadow;
}
interface SvgImg extends SvgBasicRec {
  isGrey?: boolean;
}

export interface SvgText {
  x: number;
  y: number;
  color?: string;
  borderColor?: string;
  // font: string
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: "normal" | "bold" | "bolder" | "lighter";
  fontStyle?: "normal" | "italic" | "oblique";
  textType?: "fill" | "border" | "borderFill";
  borderWidth?: number;
  textBaseline?: CanvasTextBaseline;
  textAlign?: CanvasTextAlign;
  multipleLine?: {
    lineHeight: number;
    // lineCount: number
    lineWidth: number;
  };
}

export type SvgTextByLine = Required<Pick<SvgText, "multipleLine">> &
  Omit<SvgText, "multipleLine"> & { startOffset?: number };

interface SvgArc {
  // Required. The x-coordinate of the arc's center
  x: number;
  // Required. The y-coordinate of the arc's center
  y: number;
  // Required. The radius of the arc
  radius: number;
  // Required. The angle where the arc starts in radians
  startAngle: number;
  // Required. The angle where the arc ends in radians
  endAngle: number;
  // Optional. A boolean value. If set to true, it draws the arc counter-clockwise between the start and end angles. The default is false (clockwise)
  counterclockwise?: boolean;

  lineWidth?: number;
  lineColor?: string;
}

const DEFAULT_FONT = getComputedStyle(document.documentElement).fontFamily;

export class CanvasDraw {
  private ctx: CanvasRenderingContext2D;
  private scale: number;

  constructor(ctx: CanvasRenderingContext2D, scale: number = 1) {
    this.ctx = ctx;
    this.scale = scale;
  }

  async drawImg(
    url: string,
    { x: _x, y: _y, width: _width, height: _height, isGrey = false }: SvgImg
  ) {
    try {
      if (!url) return;

      const ctx = this.ctx;
      const scale = this.scale;

      const x = _x * scale;
      const y = _y * scale;
      const width = _width * scale;
      const height = _height * scale;

      // 创建一个图片
      let image: HTMLImageElement;

      if (isGrey) {
        image = await getGreyImgByUrl(url);
      } else {
        image = new Image();
        image.crossOrigin = "";
        image.src = url;
        // 等待图片加载
        await new Promise((resolve, reject) => {
          image.onload = resolve;
          image.onerror = reject;
        });
      }

      ctx.drawImage(image, x, y, width, height);

      return this;
    } catch (e) {
      console.log("drawImg", e);
      // throw e
    }
  }

  drawRec({
    x: _x,
    y: _y,
    width: _width,
    height: _height,
    borderRadius: _borderRadius = 0,
    ...extra
  }: SvgRec) {
    const ctx = this.ctx;
    const scale = this.scale;

    const x = _x * scale;
    const y = _y * scale;
    const width = _width * scale;
    const height = _height * scale;
    const borderRadius = _borderRadius * scale;

    ctx.beginPath();
    ctx.moveTo(x + borderRadius, y);
    ctx.lineTo(x + width - borderRadius, y);
    ctx.arcTo(x + width, y, x + width, y + borderRadius, borderRadius);
    ctx.lineTo(x + width, y + height - borderRadius);
    ctx.arcTo(
      x + width,
      y + height,
      x + width - borderRadius,
      y + height,
      borderRadius
    );
    ctx.lineTo(x + borderRadius, y + height);
    ctx.arcTo(x, y + height, x, y + height - borderRadius, borderRadius);
    ctx.lineTo(x, y + borderRadius);
    ctx.arcTo(x, y, x + borderRadius, y, borderRadius);
    ctx.closePath();

    if (extra.shadow) {
      ctx.shadowColor = extra.shadow?.color ?? "black";
      ctx.shadowBlur = (extra.shadow?.blur ?? 0) * scale;
      ctx.shadowOffsetX = (extra.shadow?.offsetX ?? 0) * scale;
      ctx.shadowOffsetY = (extra.shadow?.offsetY ?? 0) * scale;
    }

    if (extra.backgroundColor) {
      ctx.fillStyle = extra.backgroundColor;
      ctx.fill();
    }

    if (extra.borderColor) {
      ctx.strokeStyle = extra.borderColor;
    }

    if (extra.borderWidth) {
      ctx.lineWidth = extra.borderWidth * scale;
      ctx.stroke();
    }

    if (extra.overFlowHidden) {
      ctx.clip();
    }

    return this;
  }

  setFont({
    color = "black",
    borderColor = "black",
    fontWeight = "normal",
    fontStyle = "normal",
    fontSize = 14,
    fontFamily = DEFAULT_FONT,
    borderWidth = 0,
    textType = "fill",
    textBaseline = "bottom",
    textAlign = "start",
  }: Omit<SvgText, "x" | "y" | "multipleLine">) {
    const ctx = this.ctx;
    const scale = this.scale;

    ctx.font = `${fontStyle} ${fontWeight} ${fontSize * scale}px ${
      fontFamily || DEFAULT_FONT
    }`;
    ctx.textBaseline = textBaseline;
    ctx.textAlign = textAlign;

    if (borderWidth) {
      ctx.lineWidth = borderWidth * scale;
    }

    if (textType === "fill") {
      ctx.fillStyle = color;
    } else if (textType === "border") {
      ctx.strokeStyle = borderColor;
    } else {
      ctx.strokeStyle = borderColor;
      ctx.fillStyle = color;
    }
  }

  drawText(
    text: string,
    {
      x: _x,
      y: _y,
      color = "black",
      borderColor = "black",
      fontWeight = "normal",
      fontStyle = "normal",
      fontSize = 14,
      fontFamily = DEFAULT_FONT,
      borderWidth = 0,
      textType = "fill",
      textBaseline = "bottom",
      textAlign = "start",
      multipleLine,
    }: SvgText
  ) {
    const ctx = this.ctx;
    const scale = this.scale;

    const x = _x * scale;
    const y = _y * scale;

    // ctx.font = `${fontStyle} ${fontWeight} ${fontSize * scale}px ${fontFamily || DEFAULT_FONT}`
    // ctx.textBaseline = textBaseline
    // ctx.textAlign = textAlign

    // if (borderWidth) {
    // 	ctx.lineWidth = borderWidth * scale
    // }

    this.setFont({
      color,
      borderColor,
      fontWeight,
      fontStyle,
      fontSize,
      fontFamily,
      borderWidth,
      textType,
      textBaseline,
      textAlign,
    });

    const _drawText = (t: string, y: number) => {
      if (textType === "fill") {
        // ctx.fillStyle = color
        ctx.fillText(t, x, y);
      } else if (textType === "border") {
        // ctx.strokeStyle = borderColor
        ctx.strokeText(t, x, y);
      } else {
        // ctx.strokeStyle = borderColor
        ctx.strokeText(t, x, y);
        // ctx.fillStyle = color
        ctx.fillText(t, x, y);
      }
    };

    if (multipleLine) {
      let ptr = 0;

      const textList = getWrapText({
        ctx: ctx,
        text,
        lineWidth: multipleLine.lineWidth * scale,
      });

      const lines = textList.length;

      while (ptr < lines) {
        _drawText(textList[ptr], y + ptr * multipleLine.lineHeight * scale);
        ptr++;
      }
    } else {
      _drawText(text, y);
    }

    return this;
  }

  drawTextByLine(
    text: string,
    {
      x: _x,
      y: _y,
      startOffset: _startOffset = 0,
      color = "black",
      borderColor = "black",
      fontWeight = "normal",
      fontStyle = "normal",
      fontSize = 14,
      fontFamily = DEFAULT_FONT,
      borderWidth = 0,
      textType = "fill",
      textBaseline = "bottom",
      textAlign = "start",
      multipleLine,
    }: SvgTextByLine
  ) {
    const ctx = this.ctx;
    const scale = this.scale;

    const x = _x * scale;
    const y = _y * scale;
    const startOffset = _startOffset * scale;

    // ctx.font = `${fontStyle} ${fontWeight} ${fontSize * scale}px ${fontFamily || DEFAULT_FONT}`
    // ctx.textBaseline = textBaseline
    // ctx.textAlign = textAlign

    // if (borderWidth) {
    // 	ctx.lineWidth = borderWidth * scale
    // }

    this.setFont({
      color,
      borderColor,
      fontWeight,
      fontStyle,
      fontSize,
      fontFamily,
      borderWidth,
      textType,
      textBaseline,
      textAlign,
    });

    const _drawText = (t: string, x: number, y: number) => {
      if (textType === "fill") {
        // ctx.fillStyle = color
        ctx.fillText(t, x, y);
      } else if (textType === "border") {
        // ctx.strokeStyle = borderColor
        ctx.strokeText(t, x, y);
      } else {
        // ctx.strokeStyle = borderColor
        ctx.strokeText(t, x, y);
        // ctx.fillStyle = color
        ctx.fillText(t, x, y);
      }
    };

    let ptr = 0;

    const textList = getWrapText({
      ctx: ctx,
      text,
      lineWidth: multipleLine.lineWidth * scale,
      offset: startOffset,
    });

    const lines = textList.length;

    while (ptr < lines) {
      const xStartPosition = ptr === 0 ? x + startOffset : x;
      _drawText(
        textList[ptr],
        xStartPosition,
        y + ptr * multipleLine.lineHeight * scale
      );
      ptr++;
    }

    return {
      x:
        _x +
        ctx.measureText(textList[lines - 1]).width / scale +
        (lines === 1 ? _startOffset : 0),
      y: _y + multipleLine.lineHeight * (lines - 1),
    };
  }

  drawArc({
    x: _x,
    y: _y,
    radius: _radius,
    startAngle,
    endAngle,
    counterclockwise = false,
    ...extra
  }: SvgArc) {
    const ctx = this.ctx;
    const scale = this.scale;

    const x = _x * scale;
    const y = _y * scale;
    const radius = _radius * scale;

    ctx.beginPath();
    ctx.arc(x, y, radius, startAngle, endAngle, counterclockwise);

    if (extra.lineColor) {
      ctx.strokeStyle = extra.lineColor;
    }

    if (extra.lineWidth) {
      ctx.lineWidth = extra.lineWidth * scale;
      ctx.stroke();
    }

    return this;
  }

  save() {
    this.ctx.save();
  }

  restore() {
    this.ctx.restore();
  }

  useCtx(callback: (ctx: CanvasRenderingContext2D) => void) {
    callback(this.ctx);
    return this;
  }
  getCtx() {
    return this.ctx;
  }
}

export function getWrapText({
  ctx,
  text,
  lineWidth,
  offset = 0,
}: {
  ctx: CanvasRenderingContext2D;
  text: string;
  lineWidth: number;
  offset?: number;
}) {
  let txtList: string[] = [];
  let str = "";

  for (let i = 0, len = text?.length ?? 0; i < len; i++) {
    const char = text.charAt(i);
    str += char;
    // const curLineWidth = ctx.measureText(str).width
    const curLineWidth =
      ctx.measureText(str).width + (txtList.length === 0 ? offset : 0);

    if (curLineWidth > lineWidth) {
      txtList.push(str.substring(0, str.length - 1));
      str = "";
      i--;
    }
  }
  txtList.push(str);
  return txtList;
}

const imageToGrayScale = (imgSrc: string): Promise<string> => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const img = new Image();

  img.crossOrigin = ""; // 解决跨域问题
  img.src = imgSrc;

  return new Promise((resolve, reject) => {
    img.onload = () => {
      // 设置 canvas 尺寸为图片尺寸
      canvas.width = img.width;
      canvas.height = img.height;

      // 绘制图片到 canvas
      ctx.drawImage(img, 0, 0);

      // 获取像素数据
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // 遍历每个像素，转换为灰度
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]; // 红色通道
        const g = data[i + 1]; // 绿色通道
        const b = data[i + 2]; // 蓝色通道

        // 计算灰度值
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;

        // 将灰度值赋值给 RGB 通道
        data[i] = data[i + 1] = data[i + 2] = gray;
      }

      // 将修改后的像素数据重新绘制到 canvas
      ctx.putImageData(imageData, 0, 0);

      // 将 canvas 转为图片 URL
      const grayImage = canvas.toDataURL();
      resolve(grayImage);

      img.onerror = (err) => {
        console.error("Image failed to load:", err);
        reject(err);
      };
    };
  });
};

const getGreyImgByUrl = async (url: string): Promise<HTMLImageElement> => {
  const urlGrey = await imageToGrayScale(url);
  const grayImg = new Image();

  grayImg.src = urlGrey;
  grayImg.crossOrigin = "";

  return await new Promise((resolve, reject) => {
    grayImg.onload = () => {
      // grayImg.src = urlGrey // 要加载的图片 url
      console.log("onload!!!");

      resolve(grayImg);
    };
    grayImg.onerror = () => {
      // grayImg.src = urlGrey // 要加载的图片 url
      console.log("onerror!!!");

      reject("");
    };
  });
};
