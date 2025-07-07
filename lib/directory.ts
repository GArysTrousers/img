export class Directory {
  path: string;
  recurse: boolean;
  directories: Directory[] = [];
  files: string[] = [];

  constructor(path: string, filter: RegExp, recurse: boolean) {
    this.path = path;
    this.recurse = recurse;

    for (const dir of Deno.readDirSync(path)) {
      if (recurse && dir.isDirectory) {
        this.directories.push(new Directory(`${path}/${dir.name}`, filter, recurse));
      } else if (dir.isFile && dir.name.match(filter)) {
        this.files.push(dir.name);
      }
    }
  }

  getFilePaths() {
    const files = this.files.map((v) => `${this.path}/${v}`);
    if (this.recurse) {
      this.directories.map((d) => d.getFilePaths()).forEach((f) => {files.push(...f)})
    }
    return files;
  }
}