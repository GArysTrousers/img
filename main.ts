import { Select, Confirm } from "@cliffy/prompt";
import { Directory } from "./lib/directory.ts";
import { ConversionOptions, convertImage } from "./lib/image.ts";

const imageTypes = /(png|jpg|jpeg|webp|tif)$/gi;

console.log(Deno.args);

const production = true;

const options: ConversionOptions = {
  inputDir: production ? "." : "./input",
  outputDir: production ? "." : "./output",
  type: await Select.prompt({
    message: "Select output file type",
    options: ["png", "jpeg", "webp"],
  }),
  size: await Select.prompt({
    message: "Select output file size",
    options: ["original", "75%", "50%", "25%"],
  }),
  quality: await Select.prompt({
    message: "Select output file quality",
    options: [
      { name: "original", value: 100 },
      { name: "90%", value: 90 },
      { name: "80%", value: 80 },
      { name: "70%", value: 70 },
    ],
  }),
  recurse: await Select.prompt({
    message: "Recurse through directories?",
    options: [
      { name: "yes", value: true },
      { name: "no", value: false },
    ],
  }),
  storage: await Select.prompt({
    message: "What to do with files",
    options: ["new sub folder", "replace", "same folder"],
  }),
};

const directory = new Directory(options.inputDir, imageTypes, options.recurse);
const files = directory.getFilePaths();

console.log(`Files Found: ${files.length}`);

if (!(await Confirm.prompt("Convert files?"))) process.exit();

if (options.storage === "new sub folder") {
  options.outputDir += "/converted";
}

let count = 1;

for (const file of files) {
  console.log(`[${count++}/${files.length}] ${file.substring(0, 50)}...`);
  await convertImage(file, options)
}

console.log();
console.log("Finished!");
