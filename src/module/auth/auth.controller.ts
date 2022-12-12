'use strict';

import dotenv from 'dotenv';
import { Op } from 'sequelize';
import conn from '../../config/database';
import { Request, Response } from 'express';
import { helper } from '../../helpers/helper';
import { response } from '../../helpers/response';
import { helperauth } from '../../helpers/auth.helper';
import { variable } from '../app/resource/resource.variable';
import { repository } from '../app/resource/resource.repository';
import { transformer } from '../app/resource/resource.transformer';
import { repository as repoRole } from '../app/role/role.respository';

dotenv.config();

export default class Controller {
  public async login(req: Request, res: Response) {
    const user = req?.user;
    const isMatch = await helper.compareIt(req?.body?.password, user?.password);
    if (isMatch) {
      const role = user?.getDataValue('role');
      const payload = {
        id: user?.resource_id,
        username: user?.username,
        role_name: user?.role?.name,
        is_public:
          role?.getDataValue('role_name') == 'public'
            ? { created_by: user?.resource_id }
            : {},
      };

      const t = await conn.sequelize.transaction();
      try {
        const token: string = helperauth.token(payload);
        const refresh: string = helperauth.refresh(payload);
        const getUser: Object = await transformer.detail(user);

        await repository.update({
          payload: { total_login: user?.total_login + 1 },
          condition: { resource_id: user?.resource_id },
          transaction: t,
        });

        const data: Object = {
          userdata: {
            ...getUser,
            total_login: user?.total_login + 1,
          },
          access_token: token,
          refresh_token: refresh,
        };
        await t.commit();
        return response.successDetail('Login success', data, res);
      } catch (err) {
        await t.rollback();
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
      role_name: result?.getDataValue('role')?.name,
      is_public:
        result?.getDataValue('role')?.name == 'public'
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
    const t = await conn.sequelize.transaction();
    try {
      const checkEmail = await repository.check({
        email: { [Op.like]: `%${req?.body?.email}%` },
      });
      if (checkEmail) return response.failed('Data already exists', 400, res);

      let username: string = req?.body?.email.split('@')[0];
      const checkUsername = await repository.check({
        username: { [Op.like]: `%${username}%` },
      });
      if (checkUsername) username = username + 1;

      const password: string = await helper.hashIt(req?.body?.password);
      const confirm_hash = await helper.hashIt(username, 6);
      const only: Object = helper.only(variable.fillable(), req?.body);

      const role = await repoRole.detail({
        role_name: { [Op.like]: '%public%' },
      });

      await repository.create({
        payload: {
          ...only,
          username: username,
          password: password,
          confirm_hash: confirm_hash,
          role_id: role?.getDataValue('role_id') || 0,
          created_by: req?.user?.id || 0,
        },
        transaction: t,
      });

      await helper.sendEmail({
        to: req?.body?.email,
        subject: 'Welcome to Bawaslu Forum,',
        content: `
            Hi ${req?.body?.full_name},
            Congratulation to join as a member, below this link to activation your account:

            ${process.env.BASE_URL_FE}/auth/verify?confirm_hash=${confirm_hash}
        `,
      });

      await t.commit();
      return response.success(true, 'success register', res);
    } catch (err) {
      await t.rollback();
      return helper.catchError(`register: ${err?.message}`, 500, res);
    }
  }

  public async verify(req: Request, res: Response) {
    if (!req?.query?.confirm_hash)
      return response.failed('Confirm has is required', 422, res);

    const t = await conn.sequelize.transaction();
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
        transaction: t,
      });

      await t.commit();
      return response.success(true, 'Account verified', res);
    } catch (err) {
      await t.rollback();
      return helper.catchError(`verify: ${err?.message}`, 500, res);
    }
  }
}

export const auth = new Controller();
