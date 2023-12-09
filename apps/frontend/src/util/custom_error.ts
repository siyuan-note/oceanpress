export class Custom_err extends Error {
  constructor(message: string, rawErr: Error) {
    super(`${message}`);
    Object.assign(this, rawErr);
    this.name = "Custom_err";
  }
}
