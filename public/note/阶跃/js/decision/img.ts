import { UploadType } from "@lipu/web-api/raccoon/upload/uploadservice_pb";
import { ImageSizeType, formatTosUrl } from "@lipu/web-utils/tos";
import { CanvasDraw } from "./canvas";
import { uploadImage } from "./upload";

export const loadImg = (
  src: string,
  size?: ImageSizeType
): Promise<HTMLImageElement> => {
  if (!src) return;

  const image = new Image();
  if (size) {
    image.src = formatTosUrl(src, { size });
  } else {
    image.src = src;
  }

  return new Promise((resolve, reject) => {
    image.onload = (res) => {
      resolve(image);
    };
    image.onerror = (err) => {
      reject(err);
    };
  });
};

export interface ImgSize {
  width: number;
  height: number;
}

// 图片裁切，默认居中(只考虑 16:9 -> 4:3)
export const cropImg = async ({
  url,
  ratio,
}: {
  url: string;
  ratio: ImgSize;
}) => {
  const img = await loadImg(url, "size2");
  const rawSize: ImgSize = { width: img.width, height: img.height };

  const cropSize: ImgSize = {
    width: (img.height / ratio.height) * ratio.width,
    height: img.height,
  };

  const canvasInstance = document.createElement("canvas");
  canvasInstance.width = cropSize.width;
  canvasInstance.height = cropSize.height;
  const ctx = canvasInstance.getContext("2d");
  const draw = new CanvasDraw(ctx);

  await draw.drawImg(url, {
    x: (cropSize.width - rawSize.width) / 2,
    y: 0,
    ...rawSize,
  });

  const imgData = ctx.getImageData(0, 0, cropSize.width, cropSize.height);

  // 随机修改一个像素 => 获取不同的 md5
  const randomPixel = Math.floor((Math.random() * imgData.data.length) / 4);
  imgData.data[randomPixel * 4 + 3] = Math.floor(Math.random() * 256); // 改变透明度
  ctx.putImageData(imgData, 0, 0);

  // return canvasInstance

  const blob: Blob = await new Promise((resolve) => {
    canvasInstance.toBlob((blob) => {
      resolve(blob);
    });
  });

  const res = await uploadImage(blob, UploadType.IMAGE_INSTANCE);

  return res.image;
};
