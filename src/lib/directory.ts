import { readdirSync, statSync } from "node:fs";
import { parse } from "node:path";

export class Directory {
  path: string;
  recurse: boolean;
  directories: Directory[] = [];
  files: string[] = [];

  constructor(dirPath: string, filter: RegExp, recurse: boolean) {
    this.path = dirPath;
    this.recurse = recurse;

    for (const itemPathStr of readdirSync(dirPath)) {
      try {
        const itemPath = parse(`${dirPath}/${itemPathStr}`);
        const itemStats = statSync(`${dirPath}/${itemPathStr}`);
        if (recurse && itemStats.isDirectory()) {
          this.directories.push(
            new Directory(`${itemPath.dir}/${itemPath.name}`, filter, recurse)
          );
        } else if (itemStats.isFile() && itemPath.base.match(filter)) {
          this.files.push(itemPath.base);
        }
      } catch (e) {}
    }
  }

  getFilePaths() {
    const files = this.files.map((v) => `${this.path}/${v}`);
    if (this.recurse) {
      this.directories
        .map((d) => d.getFilePaths())
        .forEach((f) => {
          files.push(...f);
        });
    }
    return files;
  }
}
