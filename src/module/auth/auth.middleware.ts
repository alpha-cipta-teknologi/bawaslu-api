'use strict';

import { Op } from 'sequelize';
import { helper } from '../../helpers/helper';
import { response } from '../../helpers/response';
import { helperauth } from '../../helpers/auth.helper';
import { Request, Response, NextFunction } from 'express';
import { repository } from '../app/resource/resource.repository';

type RequestBody<T> = Request<{}, {}, T>;
interface UserBody {
  username: string;
  password: string;
}

export default class Middleware {
  public async checkBearerToken(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const authorization: string = req?.headers['authorization'] || '';
    const token: string = await helperauth.decodeBearerToken(authorization);
    if (token === '')
      return response.failed('Auth Bearer is Required', 422, res);

    try {
      const auth: any = helperauth.decodeToken(token);
      req.user = auth;
      next();
      return;
    } catch (err) {
      if (err?.name === 'TokenExpiredError') {
        return response.failed(err?.message, 401, res);
      } else {
        return helper.catchError(
          `check token invalid: ${err?.message}`,
          401,
          res
        );
      }
    }
  }

  public async checkRefreshToken(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      req.user = helperauth.decodeRefreshToken(req?.body?.refresh_token);
      next();
      return;
    } catch (err) {
      if (err?.name === 'TokenExpiredError') {
        return response.failed(err?.message, 401, res);
      } else {
        return helper.catchError(
          `check refresh token invalid: ${err?.message}`,
          401,
          res
        );
      }
    }
  }

  public async checkExpiredToken(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const authorization: string = req?.headers['authorization'] || '';
    const token: string = helperauth.decodeBearerToken(authorization);
    if (token === '')
      return response.failed('Auth Bearer is Required', 422, res);

    try {
      req.user = helperauth.decodeToken(token);
      next();
      return;
    } catch (err) {
      if (err?.name === 'TokenExpiredError') {
        req.user = helperauth.decodeExpiredToken(token);
        next();
        return;
      } else {
        return helper.catchError(
          `check expired token invalid: ${err?.message}`,
          401,
          res
        );
      }
    }
  }

  public async checkVerify(
    req: RequestBody<UserBody>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const username: string = req?.body?.username;
      const password: string = req?.body?.password;
      if (!username || !password)
        return response.failed('Username or password is required', 422, res);

      const result = await repository.detail({
        [Op.or]: [{ email: username }, { username: username }],
      });
      if (!result) return response.failed('Data not found', 404, res);

      if (result?.getDataValue('status') === 'A') {
        req.user = result;
        next();
        return;
      } else {
        return response.failed('Your account need verification', 400, res);
      }
    } catch (err) {
      return helper.catchError(`check verify: ${err?.message}`, 400, res);
    }
  }
}

export const auth = new Middleware();