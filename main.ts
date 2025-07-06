import { Select } from "@cliffy/prompt";
import { tty } from "@cliffy/ansi/tty";
import sharp from "sharp";
import { parse } from "@std/path";

const imageTypes = /(png|jpg|jpeg|webp|tif)$/gi;

const production = false;
const inputDir = production ? "." : "./input";
let outputDir = production ? "." : "./output";

const files = Deno.readDirSync(inputDir).toArray();
const imageFiles = files.filter((v) => v.name.match(imageTypes) !== null);
console.log("Image files found:", imageFiles.length);

const convertToType = await Select.prompt({
  message: "Select output file type",
  options: ["png", "jpeg", "webp"],
});

const reduceSize = await Select.prompt({
  message: "Select output file size",
  options: ["original", "75%", "50%", "25%"],
});

const quality = await Select.prompt({
  message: "Select output file quality",
  options: [
    { name: "original", value: 100 },
    { name: "90%", value: 90 },
    { name: "80%", value: 80 },
    { name: "70%", value: 70 },
  ],
});

const oldFiles = await Select.prompt({
  message: "What to do with files",
  options: ["new sub folder", "replace", "same folder"],
});

if (oldFiles === "new sub folder") {
  outputDir = "./converted";
  try {
    Deno.lstatSync(outputDir);
  } catch (e) {
    if (!(e instanceof Deno.errors.NotFound)) {
      Deno.mkdirSync(outputDir);
    }
  }
}

let startSize = 0;
let endSize = 0;

for (let i = 0; i < imageFiles.length; i++) {
  const filename = parse(imageFiles[i].name);
  console.log(
    `[${i + 1}/${imageFiles.length}] ${filename.name.substring(0, 30)}...`
  );
  const newFile = sharp(`${inputDir}/${filename.base}`);
  const meta = await newFile.metadata();
  startSize += meta.size || 0;

  if (convertToType === "png") newFile.png({ quality });
  else if (convertToType === "jpeg") newFile.jpeg();
  else if (convertToType === "webp") newFile.webp();
  else throw Error("Unknown conversion type");

  if (reduceSize === "75%") newFile.resize(Math.round(meta.width * 0.75));
  else if (reduceSize === "50%") newFile.resize(Math.round(meta.width * 0.5));
  else if (reduceSize === "25%") newFile.resize(Math.round(meta.width * 0.25));

  await newFile.toFile(`./${outputDir}/${filename.name}.${convertToType}`);

  endSize += (await newFile.metadata()).size || 0

  if (oldFiles === "replace") Deno.removeSync(filename.base);

  tty.cursorLeft().cursorDown().cursorUp(2);
}
console.log();
console.log("Finished!");
console.log('Start:', startSize);
console.log('End  :', endSize);
