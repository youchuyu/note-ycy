import SparkMD5 from "spark-md5";
import { InstanceClient, UploadClient } from "@current/service";
import { PartialMessage } from "@bufbuild/protobuf";
import { SaveImageReq } from "@lipu/web-api/raccoon/instance/instance_pb";
import { UploadType } from "@lipu/web-api/raccoon/upload/uploadservice_pb";
import { reportImgUpload } from "./expo";

const computeMD5 = async (blob: Blob): Promise<string> => {
  const reader = new FileReader();

  return new Promise((resolve) => {
    // 当文件读取完成时，计算 MD5
    reader.onload = function (event) {
      const arrayBuffer = event.target.result;
      const md5Hash = SparkMD5.ArrayBuffer.hash(arrayBuffer);
      const binaryMD5 = SparkMD5.ArrayBuffer.hash(arrayBuffer, true);
      const base64MD5 = btoa(binaryMD5);
      console.log("base64MD5", btoa(binaryMD5));
      console.log("md5Hash", btoa(md5Hash));
      resolve(base64MD5);
    };

    // 将 Blob 读取为 ArrayBuffer
    reader.readAsArrayBuffer(blob);
  });
};

// 图片上传
export const uploadImage = async (blob: Blob, type: UploadType) => {
  const md5 = await computeMD5(blob);

  console.log("preUploadImage===>", md5);

  const uploadRes = await UploadClient.preUploadImage({
    uploadType: type,
    contentMd5: md5,
    format: blob?.type?.split("/")[1],
    size: BigInt(blob.size),
  });

  const formData = new FormData();

  uploadRes.fields.map((item) => {
    formData.append(item.key, item.val);
  });
  console.log("uploadRes===>", uploadRes, new Date().toLocaleDateString());

  formData.append("file", blob);

  const now = new Date().getTime();

  const res = await fetch(uploadRes.reqTosUrl, {
    method: "POST",
    body: formData,
  });

  const dur = new Date().getTime() - now;
  reportImgUpload({
    dur,
    url: uploadRes.reqTosUrl,
    fields: JSON.stringify(uploadRes.reqTosUrl),
  });

  // await res.json()

  console.log("objectName===>", {
    objectName: uploadRes.objectName,
  });

  return await UploadClient.finishUploadImage({
    objectName: uploadRes.objectName,
  });
};

// 保存图片到狸史相册
export const saveImageToHistoryAlbum = async (
  req: PartialMessage<SaveImageReq>
) => {
  return await InstanceClient.saveImage(req);
};
