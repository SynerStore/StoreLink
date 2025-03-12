export class PathHistory {
  private history: string[];
  public curPath: string;

  constructor({ path = '' }: { path?: string }) {
    this.history = [path];
    this.curPath = path;
  }

  getIndex() {
    const index = this.history.indexOf(this.curPath);
    return index;
  }

  forward(): string {
    const index = this.getIndex();
    if (index < this.history.length - 1) this.curPath = this.history[index + 1];
    return this.curPath;
  }

  back(): string {
    const index = this.getIndex();
    if (index > 0) {
      this.curPath = this.history[index - 1];
    }
    return this.curPath;
  }

  go(path: string): string {
    const index = this.getIndex();
    // 假如当前 path 不是最后一位，替换 path 的后的路径为 go path
    if (index === this.history.length - 1) {
      this.history.push(path);
    } else {
      this.history = [...this.history.slice(0, index + 1), path];
    }
    this.curPath = path;
    return this.curPath;
  }

  canBack() {
    const index = this.getIndex();
    return index > 0;
  }

  canForward() {
    const index = this.getIndex();
    return index < this.history.length - 1;
  }
}
