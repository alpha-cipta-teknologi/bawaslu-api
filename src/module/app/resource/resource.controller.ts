'use strict';

import dotenv from 'dotenv';
import { Op } from 'sequelize';
import conn from '../../../config/database';
import { Request, Response } from 'express';
import { variable } from './resource.variable';
import { helper } from '../../../helpers/helper';
import { repository } from './resource.repository';
import { response } from '../../../helpers/response';
import { transformer } from './resource.transformer';

dotenv.config();
const date: string = helper.date();

export default class Controller {
  public async index(req: Request, res: Response) {
    try {
      const limit: any = req?.query?.perPage || 10;
      const offset: any = req?.query?.page || 1;
      const keyword: any = req?.query?.q;
      const { count, rows } = await repository.index(
        {
          limit: parseInt(limit),
          offset: parseInt(limit) * (parseInt(offset) - 1),
          keyword: keyword,
        },
        {}
      );
      if (rows?.length < 1) return response.failed('Data not found', 404, res);
      return response.successDetail(
        'Data resource',
        { total: count, values: rows },
        res
      );
    } catch (err) {
      return helper.catchError(`resource index: ${err?.message}`, 500, res);
    }
  }

  public async check(req: Request, res: Response) {
    try {
      const username: string = req.params.username;
      const result: Object | any = await repository.detail({
        username: username,
      });
      if (result) return response.success(false, 'Data already used', res);
      return response.success(true, 'Data can used', res);
    } catch (err) {
      return helper.catchError(`resource check: ${err?.message}`, 500, res);
    }
  }

  public async detail(req: Request, res: Response) {
    try {
      const id: any = req.params.id || 0;
      const result: Object | any = await repository.detail({ resource_id: id });
      if (!result) return response.failed('Data not found', 404, res);
      const getUser: Object = await transformer.detail(result);
      return response.successDetail('Data resource', getUser, res);
    } catch (err) {
      return helper.catchError(`resource detail: ${err?.message}`, 500, res);
    }
  }

  public async create(req: Request, res: Response) {
    const t = await conn.sequelize.transaction();
    try {
      const checkEmail = await repository.check({
        email: { [Op.like]: `%${req?.body?.email}%` },
      });
      if (checkEmail) return response.failed('Data already exists', 400, res);
      if (!req?.body?.password)
        return response.failed('Password is required', 422, res);

      let username: string = req?.body?.email.split('@')[0];
      const checkUsername = await repository.check({
        username: { [Op.like]: `%${username}%` },
      });
      if (checkUsername) username = username + 1;

      let role_id: any = null;
      let image_foto: any = null;
      let regency_id: any = null;
      let province_id: any = null;
      if (req?.body?.role_id) role_id = JSON.parse(req?.body?.role_id);
      if (req?.body?.regency_id) regency_id = JSON.parse(req?.body?.regency_id);
      if (req?.body?.province_id)
        province_id = JSON.parse(req?.body?.province_id);
      if (req?.files && req?.files.image_foto) {
        image_foto = await helper.upload(req?.files.image_foto, 'resource');
      }

      const password: string = await helper.hashIt(req?.body?.password);
      const confirm_hash = await helper.hashIt(username, 6);
      const only: Object = helper.only(variable.fillable(), req?.body);

      await repository.create({
        payload: {
          ...only,
          username: username,
          password: password,
          confirm_hash: confirm_hash,
          image_foto: image_foto,
          role_id: role_id?.value || 0,
          province_id: province_id?.value || 0,
          regency_id: regency_id?.value || 0,
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
      return response.success(true, 'Data success saved', res);
    } catch (err) {
      await t.rollback();
      return helper.catchError(`resource create: ${err?.message}`, 500, res);
    }
  }

  public async update(req: Request, res: Response) {
    const t = await conn.sequelize.transaction();
    try {
      const id: any = req.params.id || 0;
      const check = await repository.check({ resource_id: id });
      if (!check) return response.failed('Data not found', 404, res);

      let role_id: any = null;
      let province_id: any = null;
      let regency_id: any = null;
      let image_foto: any = null;
      if (req?.body?.role_id) role_id = JSON.parse(req?.body?.role_id);
      if (req?.body?.province_id)
        province_id = JSON.parse(req?.body?.province_id);
      if (req?.body?.regency_id) regency_id = JSON.parse(req?.body?.regency_id);
      if (req?.files && req?.files.image_foto) {
        image_foto = await helper.upload(req?.files.image_foto, 'resource');
      }

      let password: any = null;
      if (req?.body?.password) {
        const isMatch: boolean = await helper.compareIt(
          req?.body?.password,
          check?.getDataValue('password')
        );
        if (!isMatch) {
          password = await helper.hashIt(req?.body?.password);
        } else {
          return response.failed('Password does not same old', 500, res);
        }
      }

      const data: any = helper.only(variable.fillable(), req?.body, true);
      delete data?.username;
      await repository.update({
        payload: {
          ...data,
          password: password || check?.getDataValue('password'),
          role_id: role_id?.value || check?.getDataValue('role_id'),
          area_province_id:
            province_id?.value || check?.getDataValue('area_province_id'),
          area_regencies_id:
            regency_id?.value || check?.getDataValue('area_regencies_id'),
          image_foto: image_foto || check?.getDataValue('image_foto'),
          modified_by: req?.user?.id,
        },
        condition: { resource_id: id },
        transaction: t,
      });
      await t.commit();
      return response.success(true, 'Data success updated', res);
    } catch (err) {
      await t.rollback();
      return helper.catchError(`resource update: ${err?.message}`, 500, res);
    }
  }

  public async delete(req: Request, res: Response) {
    const t = await conn.sequelize.transaction();
    try {
      const id: any = req.params.id || 0;
      const check = await repository.detail({ resource_id: id });
      if (!check) return response.failed('Data not found', 404, res);
      await repository.update({
        payload: {
          status: 'D',
          modified_by: req?.user?.id,
          modified_date: date,
        },
        condition: { resource_id: id },
        transaction: t,
      });
      await t.commit();
      return response.success(true, 'Data success deleted', res);
    } catch (err) {
      await t.rollback();
      return helper.catchError(`resource delete: ${err?.message}`, 500, res);
    }
  }
}
export const resource = new Controller();