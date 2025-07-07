import { parse } from "@std/path";
import sharp from "sharp";

export interface ConversionOptions {
  inputDir: string;
  outputDir: string;
  type: string;
  size: string;
  quality: number;
  recurse: boolean;
  storage: string;
}

export async function convertImage(path: string, options: ConversionOptions) {
  const filename = parse(path);
  filename.dir;
  const newFile = sharp(path);
  const meta = await newFile.metadata();

  if (options.type === "png") newFile.png({ quality: options.quality });
  else if (options.type === "jpeg") newFile.jpeg();
  else if (options.type === "webp") newFile.webp();
  else throw Error("Unknown conversion type");

  if (options.size === "75%") newFile.resize(Math.round(meta.width * 0.75));
  else if (options.size === "50%") newFile.resize(Math.round(meta.width * 0.5));
  else if (options.size === "25%")
    newFile.resize(Math.round(meta.width * 0.25));
  const minusInputDir = filename.dir.replace(options.inputDir, "");
  const outputDir = `${options.outputDir}${minusInputDir}`;
  const outputFile = `${outputDir}/${filename.name}.${options.type}`;
  mkdirIfNotExist(outputDir);
  await newFile.toFile(outputFile);

  if (options.storage === "replace") Deno.removeSync(path);
  return outputFile;
}

export function mkdirIfNotExist(dir: string) {
  try {
    Deno.lstatSync(dir);
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) {
      Deno.mkdirSync(dir, { recursive: true });
    }
  }
}
