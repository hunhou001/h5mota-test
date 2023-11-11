import { listenOnce } from "./dom";
import { createImageFromBlob } from "./file";

interface LocalImage {
  source: HTMLImageElement;
  name: string;
}

export const openLocalImage = async () => {
  // const { promise, resolve, reject } = withResolvers<LocalImage | undefined>();
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/png";
  await listenOnce(input, "change", () => input.click());
  if (!input.files) return;
  const [file] = input.files;
  const image = await createImageFromBlob(file);
  return {
    source: image,
    name: file.name,
  } as LocalImage;
};
