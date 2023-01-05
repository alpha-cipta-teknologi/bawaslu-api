'use strict';

import axios from 'axios';
import dotenv from 'dotenv';
import { Op } from 'sequelize';
import redis from '../../config/redis';
import { Request, Response } from 'express';
import { helper } from '../../helpers/helper';
import { response } from '../../helpers/response';
import { helperauth } from '../../helpers/auth.helper';
import { variable } from '../app/resource/resource.variable';
import { repository } from '../app/resource/resource.repository';
import { transformer } from '../app/resource/resource.transformer';
import { repository as repoRole } from '../app/role/role.respository';
import { repository as repoTema } from '../reff/tema/tema.respository';

dotenv.config();
const date: string = helper.date();
const base_url_sso: string = process.env.BASE_URL_SSO || '';
const client_id: string = process.env.CLIENT_ID || '';
const client_secret: string = process.env.CLIENT_SECRET || '';

export default class Controller {
  public async login(req: Request, res: Response) {
    const user = req?.user;
    const isMatch = await helper.compareIt(req?.body?.password, user?.password);
    if (isMatch) {
      const role = user?.getDataValue('role');
      const payload: Object = {
        id: user?.getDataValue('resource_id'),
        username: user?.getDataValue('username'),
        role_name: role?.getDataValue('role_name'),
        is_sso: 0,
        is_public:
          role?.getDataValue('role_name') == 'public'
            ? { created_by: user?.getDataValue('resource_id') }
            : {},
      };

      try {
        const token: string = helperauth.token(payload);
        const refresh: string = helperauth.refresh(payload);
        const getUser: Object = await transformer.detail(user);

        await repository.update({
          payload: { total_login: user?.total_login + 1 },
          condition: { resource_id: user?.resource_id },
        });

        const data: Object = {
          userdata: {
            ...getUser,
            total_login: user?.total_login + 1,
          },
          access_token: token,
          refresh_token: refresh,
        };
        return response.successDetail('Login success', data, res);
      } catch (err) {
        return helper.catchError(`login: ${err?.message}`, 500, res);
      }
    } else {
      return response.failed('Password incorrect', 400, res);
    }
  }

  public async refresh(req: Request, res: Response) {
    const result = await repository.detail({
      resource_id: req?.user?.id,
    });
    if (!result) return response.failed('User not found', 404, res);

    const payload = {
      id: result?.getDataValue('resource_id'),
      username: result?.getDataValue('username'),
      role_name: result?.getDataValue('role')?.role_name,
      is_sso: 0,
      is_public:
        result?.getDataValue('role')?.role_name == 'public'
          ? { created_by: result?.getDataValue('resource_id') }
          : {},
    };

    try {
      const refresh: string = helperauth.token(payload);
      const data: Object = {
        userdata: await transformer.detail(result),
        access_token: refresh,
        refresh_token: req?.body?.refresh_token,
      };
      response.successDetail('New access token', data, res);
    } catch (err) {
      return helper.catchError(`refresh: ${err?.message}`, 500, res);
    }
  }

  public async register(req: Request, res: Response) {
    try {
      const checkEmail = await repository.check({
        email: { [Op.like]: `%${req?.body?.email}%` },
      });
      if (checkEmail) return response.failed('Data already exists', 400, res);

      let username: string = req?.body?.email.split('@')[0];
      const checkUsername = await repository.check({
        username: username,
      });
      if (checkUsername) username = username + 1;

      const password: string = await helper.hashIt(req?.body?.password);
      const confirm_hash = await helper.hashIt(username, 6);
      const only: Object = helper.only(variable.fillable(), req?.body);

      const role = await repoRole.detail({
        role_name: { [Op.like]: '%public%' },
      });

      const { province_id, regency_id, komunitas_id, tema_id } = req?.body;
      let komunitas: any = null;
      if (komunitas_id) komunitas = komunitas_id;
      const resource = await repository.create({
        payload: {
          ...only,
          username: username,
          password: password,
          confirm_hash: confirm_hash,
          area_province_id: province_id?.value || 0,
          area_regencies_id: regency_id?.value || 0,
          role_id: role?.getDataValue('role_id') || 0,
          komunitas_id: komunitas?.value || 0,
          created_by: req?.user?.id || 0,
        },
      });

      if (tema_id?.length > 0) {
        const insert: Array<Object> = tema_id.map((item: any) => ({
          resource_id: resource?.getDataValue('resource_id'),
          tema_id: item,
        }));

        if (insert?.length > 0) {
          await repoTema.bulkCreateTemaMap({
            payload: insert,
          });
        }
      }

      await helper.sendEmail({
        to: req?.body?.email,
        subject: 'Welcome to Bawaslu Forum',
        content: `
            Hi ${req?.body?.full_name},
            Congratulation to join as a member, below this link to activation your account:

            ${process.env.BASE_URL_FE}/account-verification?confirm_hash=${confirm_hash}
        `,
      });

      return response.success(true, 'success register', res);
    } catch (err) {
      return helper.catchError(`register: ${err?.message}`, 500, res);
    }
  }

  public async verify(req: Request, res: Response) {
    if (!req?.query?.confirm_hash)
      return response.failed('Confirm has is required', 422, res);

    try {
      const result = await repository.detail({
        confirm_hash: req?.query?.confirm_hash,
      });
      if (!result) return response.failed('Data not found', 404, res);

      if (result?.getDataValue('status') === 'A')
        return response.failed('Account has been verified', 400, res);

      await repository.update({
        payload: { status: 'A' },
        condition: { confirm_hash: req?.query?.confirm_hash },
      });

      return response.success(true, 'Account verified', res);
    } catch (err) {
      return helper.catchError(`verify: ${err?.message}`, 500, res);
    }
  }

  public async forgot(req: Request, res: Response) {
    try {
      const { email } = req?.body;
      if (!email) return response.failed('Email is required', 422, res);

      const result = await repository.detail({
        email: email,
      });
      if (!result) return response.failed('Data not found', 404, res);

      const confirm_hash = await helper.hashIt(email, 6);
      await repository.update({
        payload: {
          confirm_hash: confirm_hash,
          modified_date: date,
        },
        condition: { email: email },
      });

      await helper.sendEmail({
        to: email,
        subject: 'Reset Password',
        content: `
            Hi ${result?.getDataValue('full_name')},
            Below this link to reset password your account:

            ${
              process.env.BASE_URL_FE
            }/reset-password?confirm_hash=${confirm_hash}
        `,
      });

      return response.success(true, 'success forgot password', res);
    } catch (err) {
      return helper.catchError(`forgot: ${err?.message}`, 500, res);
    }
  }

  public async reset(req: Request, res: Response) {
    const { confirm_hash } = req?.query;
    if (!confirm_hash)
      return response.failed('Confirm has is required', 422, res);
    const { password } = req?.body;
    if (!password) return response.failed('Password is required', 422, res);

    try {
      const result = await repository.detail({
        confirm_hash: confirm_hash,
      });
      if (!result) return response.failed('Data not found', 404, res);

      let newPassword: any = null;
      const isMatch: boolean = await helper.compareIt(
        password,
        result?.getDataValue('password')
      );
      if (!isMatch) {
        newPassword = await helper.hashIt(password);
      } else {
        return response.failed('Password does not same old', 500, res);
      }

      await repository.update({
        payload: {
          password: newPassword,
          modified_date: date,
        },
        condition: { confirm_hash: confirm_hash },
      });

      return response.success(true, 'success reset password', res);
    } catch (err) {
      return helper.catchError(`reset: ${err?.message}`, 500, res);
    }
  }

  public async loginSSO(req: Request, res: Response) {
    const user: any = req?.user;
    const role: any = user?.getDataValue('role');
    const payload: Object = {
      id: user?.getDataValue('resource_id'),
      username: user?.getDataValue('username'),
      role_name: role?.getDataValue('role_name'),
      is_sso: 1,
      is_public:
        role?.getDataValue('role_name') == 'public'
          ? { created_by: user?.getDataValue('resource_id') }
          : {},
    };

    try {
      const token: string = helperauth.token(payload);
      const refresh: string = helperauth.refresh(payload);
      const getUser: Object = await transformer.detail(user);

      await repository.update({
        payload: { total_login: user?.total_login + 1 },
        condition: { resource_id: user?.resource_id },
      });

      const data: Object = {
        userdata: {
          ...getUser,
          total_login: user?.total_login + 1,
        },
        access_token: token,
        refresh_token: refresh,
      };
      return response.successDetail('Login SSO success', data, res);
    } catch (err) {
      return helper.catchError(`login sso: ${err?.message}`, 500, res);
    }
  }

  public async logout(req: Request, res: Response) {
    try {
      const user = req?.user;

      if (user?.is_sso == 1) {
        const getRedisUser: string = (await redis.get(user?.username)) || '0';
        const token_sso: any = JSON.parse(getRedisUser);
        if (token_sso != 0) {
          const url: string = `${base_url_sso}/logout`;
          const payload: Object = {
            grant_type: 'logout',
            client_id: client_id,
            client_secret: client_secret,
            refresh_token: token_sso?.refresh_token,
          };

          axios.defaults.headers.post['Content-Type'] =
            'application/x-www-form-urlencoded';
          const response = await axios.post(url, payload);
          await redis.del(user?.username);

          // sso logs
          await helper.SSOLogs({
            url: url,
            request: JSON.stringify(payload),
            response: JSON.stringify(response?.data),
            created_by: user?.username,
            created_date: date,
          });
        }
      }
      return response.success(true, 'logout success', res);
    } catch (err) {
      return helper.catchError(`logout: ${err?.message}`, 500, res);
    }
  }
}

export const auth = new Controller();
