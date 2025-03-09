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
    this.curPath = path;
    this.history.push(path);
    console.log('this.curPath', this.curPath);
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
