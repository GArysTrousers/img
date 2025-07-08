#!/usr/bin/env node
import { Directory } from "./lib/directory.js";
import { type ConversionOptions, convertImage } from "./lib/image.js";
import inquirer from "inquirer";

const imageTypes = /(png|jpg|jpeg|webp|tif)$/gi;

const production = true;

(async () => {
  const options: ConversionOptions = {
    inputDir: production ? "." : "./input",
    outputDir: production ? "." : "./output",
    ...(await inquirer.prompt([
      {
        name: "type",
        type: "list",
        message: "Select output file type",
        choices: ["png", "jpeg", "webp"],
      },
      {
        name: "size",
        type: "list",
        message: "Select output file size",
        choices: ["original", "75%", "50%", "25%"],
      },
      {
        name: "quality",
        type: "list",
        message: "Select output file quality",
        choices: [
          { name: "original", value: 100 },
          { name: "90%", value: 90 },
          { name: "80%", value: 80 },
          { name: "70%", value: 70 },
        ],
      },
      {
        name: "recurse",
        type: "list",
        message: "Recurse through directories?",
        choices: [
          { name: "yes", value: true },
          { name: "no", value: false },
        ],
      },
      {
        name: "storage",
        type: "list",
        message: "What to do with files",
        choices: ["new sub folder", "replace", "same folder"],
      },
    ])),
  };

  const directory = new Directory(
    options.inputDir,
    imageTypes,
    options.recurse
  );
  const files = directory.getFilePaths();

  console.log(`Files Found: ${files.length}`);

  if (
    !(await inquirer.prompt([
      {
        type: "confirm",
        message: "Convert files?",
      },
    ]))
  )
    process.exit();

  if (options.storage === "new sub folder") {
    options.outputDir += "/converted";
  }

  let count = 1;

  for (const file of files) {
    console.log(`[${count++}/${files.length}] ${file.substring(0, 50)}...`);
    await convertImage(file, options);
  }

  console.log();
  console.log("Finished!");
})();
