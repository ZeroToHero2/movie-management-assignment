export class BaseError extends Error {
  public data: any;
  public code: number;
  public status: number;
  public error: string;

  constructor(data: any, status: number) {
    super(data.message);

    this.status = status;
    this.name = data.error;
    this.code = data.code;
    this.error = data.error;
  }
}
