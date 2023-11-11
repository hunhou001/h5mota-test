import { withResolvers } from "./hooks/useResolver";

export const SUPPORT_FS = !!window.showOpenFilePicker;

export const readDataURLFromLocalFile = async (file: Blob) => {
  const { promise, resolve, reject } = withResolvers<string>();
  const fileReader = new FileReader();
  fileReader.addEventListener("load", () => {
    resolve(fileReader.result as string);
  });
  fileReader.readAsDataURL(file);
  return promise;
};

export const createImageFromDataURL = (dataURL: string) => {
  const { promise, resolve, reject } = withResolvers<HTMLImageElement>();
  const image = document.createElement("img");
  image.addEventListener("load", () => {
    resolve(image);
  });
  image.src = dataURL;
  return promise;
};

export const createImageFromBlob = (blob: Blob) => {
  const { promise, resolve, reject } = withResolvers<HTMLImageElement>();
  const image = document.createElement("img");
  const url = URL.createObjectURL(blob);
  image.addEventListener("load", () => {
    resolve(image);
    URL.revokeObjectURL(url);
  });
  image.src = url;
  return promise;
};

export const downloadFile = async (file: Blob, name?: string) => {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(file);
  if (name) {
    a.download = name;
  }
  a.click();
  URL.revokeObjectURL(a.href);
};

export const saveFileToLocal = async (
  fileHandle: FileSystemFileHandle,
  file: FileSystemWriteChunkType
) => {
  const stream = await fileHandle.createWritable();
  await stream.write(file);
  await stream.close();
};

export const saveImageToLocalFS = async (
  file: FileSystemWriteChunkType,
  suggestedName?: string
) => {
  const fileHandle = await window.showSaveFilePicker({
    types: [
      {
        description: "Images",
        accept: {
          "image/*": [".png"],
        },
      },
    ],
    excludeAcceptAllOption: true,
    suggestedName,
  });
  saveFileToLocal(fileHandle, file);
};
