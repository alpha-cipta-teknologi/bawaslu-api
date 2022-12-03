'use strict';

import { Response } from 'express';

export default class DataResponse {
  public successList(message: string, data: Array<object>, res: Response) {
    res.json({
      status: true,
      message: message,
      data: data,
    });
    res.end();
  }

  public successDetail(message: string, data: Object, res: Response) {
    res.json({
      status: true,
      message: message,
      data: data,
    });
    res.end();
  }

  public success(status: boolean = true, message: string, res: Response) {
    res.json({
      status: status,
      message: message,
    });
    res.end();
  }

  public failed(message: any, code: number, res: Response) {
    res.status(code);
    res.json({
      status: false,
      message: message,
    });
    res.end();
  }
}

export const response = new DataResponse();
