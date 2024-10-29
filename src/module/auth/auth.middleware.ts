'use strict';

import axios from 'axios';
import dotenv from 'dotenv';
import moment from 'moment';
import fetch from 'node-fetch';
import { Op } from 'sequelize';
import redis from '../../config/redis';
import { helper } from '../../helpers/helper';
import { response } from '../../helpers/response';
import { helperauth } from '../../helpers/auth.helper';
import { Request, Response, NextFunction } from 'express';
import { repository } from '../app/resource/resource.repository';

dotenv.config();
const date: string = helper.date();
const base_url_sso: string = process.env.BASE_URL_SSO || '';
const client_id: string = process.env.CLIENT_ID || '';
const client_secret: string = process.env.CLIENT_SECRET || '';
type RequestBody<T> = Request<{}, {}, T>;
interface UserBody {
  username: string;
  password: string;
}
interface SSOTokenBody {
  access_token: string;
  refresh_token: string;
}

const tokenValidationSSO = async (
  username: string,
  token_sso: any,
  res: Response,
  next: NextFunction
) => {
  const url: string = `${base_url_sso}/userinfo`;
  const token: string = `Bearer ${token_sso?.access_token}`;

  axios.defaults.headers.common['Authorization'] = token;
  axios
    .get(url)
    .then(async (res) => {
      // sso logs
      await helper.SSOLogs({
        url: url,
        request: token,
        response: JSON.stringify(res?.data),
        created_by: username,
        created_date: date,
      });

      next();
      return;
    })
    .catch(async (err) => {
      if (err?.response?.status == 401) {
        const url_refresh: string = `${base_url_sso}/token`;
        const payload: Object = {
          grant_type: 'refresh_token',
          client_id: client_id,
          client_secret: client_secret,
          refresh_token: token_sso?.refresh_token,
        };

        axios.defaults.headers.post['Content-Type'] =
          'application/x-www-form-urlencoded';
        axios
          .post(url_refresh, payload)
          .then(async (res_refresh) => {
            const { access_token, refresh_token, expires_in } =
              res_refresh?.data;

            const countdown: number = expires_in - 60;
            const duration: any = moment().add(
              countdown > 0 ? countdown : 300,
              'seconds'
            );
            await redis.set(
              username,
              JSON.stringify({ access_token, refresh_token, duration })
            );
            // sso logs
            await helper.SSOLogs({
              url: url_refresh,
              request: JSON.stringify(payload),
              response: JSON.stringify(res_refresh?.data),
              created_by: username,
              created_date: date,
            });

            next();
            return;
          })
          .catch(async (err_refresh) => {
            // sso logs
            await helper.SSOLogs({
              url: url_refresh,
              request: JSON.stringify(payload),
              response: JSON.stringify(err_refresh?.response?.data),
              created_by: username,
              created_date: date,
            });

            return response.failed(`refresh token sso expired`, 401, res);
          });
      }
    });
};

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

      if (auth?.is_sso == 1) {
        const getRedisUser: string = (await redis.get(auth?.username)) || '0';
        const token_sso: any = JSON.parse(getRedisUser);
        if (token_sso != 0) {
          if (moment().diff(moment(token_sso?.duration)) >= 0) {
            return await tokenValidationSSO(
              auth?.username,
              token_sso,
              res,
              next
            );
          } else {
            next();
            return;
          }
        }
        return response.failed(
          `access and refresh token sso not found`,
          404,
          res
        );
      }

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

  public async recaptcha(req: Request, res: Response, next: NextFunction) {
    try {
      let recpatcha: boolean = false;
      const origin: string = req?.headers['origin'] || '';

      if (process.env.RECAPTCHA_CMS_STATUS == 'true' && origin.includes('cms'))
        recpatcha = true;
      else if (
        process.env.RECAPTCHA_STATUS == 'true' &&
        !origin.includes('cms')
      )
        recpatcha = true;

      console.warn(origin, recpatcha)

      if (recpatcha) {
        let secret_key: string = process.env.RECAPTCHA_SECRET_KEY || '';
        let url: string = `https://www.google.com/recaptcha/api/siteverify`;

        const result: any = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            secret: secret_key,
            response: req?.body?.captcha,
          }),
        }).then((res) => res.json());

        const { success } = result;
        if (!success)
          return response.failed('recaptcha verification failed', 422, res);
      }
      next();
    } catch (err) {
      return helper.catchError(`recaptcha: ${err?.message}`, 400, res);
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

  public async checkSSOToken(
    req: RequestBody<SSOTokenBody>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { access_token, refresh_token } = req?.body;
      if (!access_token || !refresh_token)
        return response.failed(
          'access_token and refresh_token is required',
          404,
          res
        );

      const payload = helperauth.decodeSSOToken(access_token);
      const { realm_access } = payload;
      if (!realm_access?.roles.includes('app_komunitas')) {
        return response.failed(`user does'nt have role access`, 401, res);
      }

      const resource = await repository.detail({
        [Op.or]: [
          { username: payload?.preferred_username },
          { email: payload?.email },
        ],
      });
      if (!resource) return response.failed('Data not found', 404, res);

      const countdown: number = payload?.expires_in - 60;
      const duration: any = moment().add(
        countdown > 0 ? countdown : 300,
        'seconds'
      );
      await redis.set(
        resource?.getDataValue('username'),
        JSON.stringify({ access_token, refresh_token, countdown, duration })
      );
      req.user = resource;
      next();
    } catch (err) {
      return response.failed(`check sso token: ${err?.message}`, 404, res);
    }
  }

  public async checkToken(req: Request, res: Response, next: NextFunction) {
    const authorization: string = req?.headers['authorization'] || '';
    const token: string = await helperauth.decodeBearerToken(authorization);

    try {
      const auth: any = helperauth.decodeToken(token);
      req.user = auth;

      next();
      return;
    } catch (err) {
      req.user = null;
      next();
    }
  }
}

export const auth = new Middleware();
