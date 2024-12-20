'use strict';

import path from 'path';
import moment from 'moment';
import dotenv from 'dotenv';
import { Op } from 'sequelize';
import { Request, Response } from 'express';
import { variable } from './kerjasama.variable';
import { repository } from './kerjasama.repository';
import { helper } from '../../../../helpers/helper';
import { transformer } from './kerjasama.transformer';
import { response } from '../../../../helpers/response';
import { repository as repoForm } from '../form.repository';
import { auth as authController } from '../../../auth/auth.controller';

dotenv.config();
const date: string = helper.date();

const insertAttachs = async (req: Request, id: number) => {
  if (req?.body?.attach_delete) {
    const attach_delete: any = JSON.parse(req?.body?.attach_delete);
    if (attach_delete?.length > 0) {
      const arrId = attach_delete.map((t: any) => t);
      await repository.deleteAttachment({
        condition: { id: { [Op.in]: arrId } },
      });
    }
  }

  if (req?.files && req?.files?.attachs) {
    const attachs = req?.files?.attachs;
    const ketAttach = JSON.parse(req?.body?.keterangan_attach);
    let insert: Array<Object> = [];
    if (attachs?.length > 0) {
      for (let i in attachs) {
        let checkFile = helper.checkExtention(attachs[i], 'file');
        if (checkFile != 'allowed') return checkFile;

        const path_url = await helper.upload(attachs[i], 'form_kerjasama');
        insert.push({
          id_pengajuan_kerjasama: id,
          path_url: path_url,
          keterangan: ketAttach[i],
          created_by: req?.user?.id || 0,
          created_date: date,
        });
      }
    } else {
      let checkFile = helper.checkExtention(attachs, 'file');
      if (checkFile != 'allowed') return checkFile;

      const path_url = await helper.upload(attachs, 'form_kerjasama');
      insert.push({
        id_pengajuan_kerjasama: id,
        path_url: path_url,
        keterangan: ketAttach?.length > 0 ? ketAttach[0] : null,
        created_by: req?.user?.id || 0,
        created_date: date,
      });
    }

    if (insert?.length > 0) {
      await repository.bulkCreateAttach({ payload: insert });
    }
  }
};

export default class Controller {
  public async index(req: Request, res: Response) {
    try {
      const limit: any = req?.query?.perPage || 10;
      const offset: any = req?.query?.page || 1;
      const keyword: any = req?.query?.q;
      const conditionArea: object = helper.conditionArea(req?.user);
      const { count, rows } = await repository.index(
        {
          limit: parseInt(limit),
          offset: parseInt(limit) * (parseInt(offset) - 1),
          keyword: keyword,
        },
        conditionArea
      );
      if (rows?.length < 1) return response.failed('Data not found', 404, res);
      const kerjasama = await transformer.list(rows, req?.user);
      return response.successDetail(
        'Data kerjasama',
        { total: count, values: kerjasama },
        res
      );
    } catch (err) {
      return helper.catchError(`kerjasama index: ${err?.message}`, 500, res);
    }
  }

  public async detail(req: Request, res: Response) {
    try {
      const id: any = req.params.id || 0;
      const result: Object | any = await repository.detail({ id: id });
      if (!result) return response.failed('Data not found', 404, res);
      const kerjasama = await transformer.detail(result, req?.user);
      return response.successDetail('Data kerjasama', kerjasama, res);
    } catch (err) {
      return helper.catchError(`kerjasama detail: ${err?.message}`, 500, res);
    }
  }

  public async create(req: Request, res: Response) {
    let message: string = '';
    let noRegister: string = `${helper.dateForNumber()}|kerjasama|insert_id`;

    try {
      if (!helper.checkIsAdminPanel(req)) {
        const { otp, pic_email } = req?.body;
        const { status, message } = await authController.verifyOtpSubmit(
          otp,
          pic_email
        );
        if (!status) return response.failed(message, 400, res);
      }

      let regency_id: any = null;
      let province_id: any = null;
      let bentuk_kerjasama: any = null;
      if (req?.body?.regency_id) regency_id = JSON.parse(req?.body?.regency_id);
      if (req?.body?.province_id)
        province_id = JSON.parse(req?.body?.province_id);
      if (req?.body?.bentuk_kerjasama)
        bentuk_kerjasama = JSON.parse(req?.body?.bentuk_kerjasama);

      const only: Object = helper.only(variable.fillable(), req?.body);
      const kerjasama = await repository.create({
        payload: {
          ...only,
          no_register: noRegister,
          area_province_id: province_id?.value || 0,
          area_regencies_id: regency_id?.value || 0,
          id_bentuk_kerjasama: bentuk_kerjasama?.value || 0,
          nama_kerjasama: bentuk_kerjasama?.label || null,
          status: 1,
          created_by: req?.user?.id || 0,
        },
      });
      const kerjasamaId = kerjasama?.getDataValue('id');
      noRegister = noRegister.replace('insert_id', kerjasamaId);

      await repository.update({
        payload: {
          no_register: noRegister,
        },
        condition: { id: kerjasamaId },
      });

      if (req?.files) {
        await insertAttachs(req, kerjasamaId);
      }

      await repoForm.createHistoryStatus({
        payload: {
          id_pengajuan_kerjasama: kerjasamaId || null,
          keterangan: req?.body?.keterangan || null,
          status: 1,
          created_by: req?.user?.id || 0,
          created_date: date,
        },
      });

      message = 'Data success saved';
    } catch (err) {
      return helper.catchError(`kerjasama create: ${err?.message}`, 500, res);
    }

    try {
      await helper.sendEmail({
        to: req?.body?.pic_email,
        subject: 'Pengajuan Kerjasama',
        content: `
          <h3>Hi ${req?.body?.pic_name},</h3>
          <p>Pengajuan berhasil, berikut nomor pendaftaran untuk pelacakan status pengajuan:</p>
          <h3>${noRegister}</h3>
        `,
      });
    } catch (err) {
      message = `<br /> error send email: ${err?.message}`;
    }

    return response.success(true, message, res);
  }

  public async update(req: Request, res: Response) {
    try {
      const id: any = req.params.id || 0;
      const check = await repository.check({ id: id });
      if (!check) return response.failed('Data not found', 404, res);

      let regency_id: any = null;
      let province_id: any = null;
      let bentuk_kerjasama: any = null;
      if (req?.body?.regency_id) regency_id = JSON.parse(req?.body?.regency_id);
      if (req?.body?.province_id)
        province_id = JSON.parse(req?.body?.province_id);
      if (req?.body?.bentuk_kerjasama)
        bentuk_kerjasama = JSON.parse(req?.body?.bentuk_kerjasama);

      const only: any = helper.only(variable.fillable(), req?.body, true);
      await repository.update({
        payload: {
          ...only,
          area_province_id:
            province_id?.value || check?.getDataValue('area_province_id'),
          area_regencies_id:
            regency_id?.value || check?.getDataValue('area_regencies_id'),
          id_bentuk_kerjasama:
            bentuk_kerjasama?.value ||
            check?.getDataValue('id_bentuk_kerjasama'),
          nama_kerjasama:
            bentuk_kerjasama?.label || check?.getDataValue('nama_kerjasama'),
          modified_by: req?.user?.id || 0,
        },
        condition: { id: id },
      });

      if (req?.files) {
        await insertAttachs(req, id);
      }

      return response.success(true, 'Data success updated', res);
    } catch (err) {
      return helper.catchError(`kerjasama update: ${err?.message}`, 500, res);
    }
  }

  public async updateStatus(req: Request, res: Response) {
    let message: string = '';
    let check: any = null;
    let attachments: Array<Object> = [];
    const { status, masa_berlaku, keterangan } = req?.body;

    try {
      const id: any = req.params.id || 0;
      check = await repository.check({ id: id });
      if (!check) return response.failed('Data not found', 404, res);

      let path_url: string = '';
      if (req?.files && req?.files?.doc_mou) {
        const docMou = req?.files?.doc_mou;
        let checkFile = helper.checkExtention(docMou, 'file');
        if (checkFile != 'allowed') return checkFile;

        path_url = await helper.upload(docMou, 'form_kerjasama_mou');

        attachments = [
          {
            filename: docMou?.name,
            path: path.resolve(`./public/${path_url}`),
          },
        ];
      }

      const checkMou: Object | any = await repoForm.detailDocMou({
        id_pengajuan_kerjasama: id,
      });
      if (checkMou) {
        await repoForm.updateDocMou({
          payload: {
            path_url: path_url || checkMou?.getDataValue('path_url'),
            keterangan: keterangan || checkMou?.getDataValue('keterangan'),
            masa_berlaku:
              masa_berlaku || checkMou?.getDataValue('masa_berlaku'),
            modified_by: req?.user?.id || 0,
            modified_date: date,
          },
          condition: { id_pengajuan_kerjasama: id },
        });
      } else {
        await repoForm.createDocMou({
          payload: {
            id_pengajuan_kerjasama: id || null,
            path_url: path_url || null,
            masa_berlaku: masa_berlaku || date,
            keterangan: keterangan || null,
            created_by: req?.user?.id || 0,
          },
        });
      }

      await repository.update({
        payload: {
          keterangan: keterangan || check?.getDataValue('keterangan'),
          status: status || check?.getDataValue('status'),
          modified_by: req?.user?.id || 0,
          modified_date: date,
        },
        condition: { id: id },
      });

      await repoForm.createHistoryStatus({
        payload: {
          id_pengajuan_kerjasama: id || check?.getDataValue('id'),
          keterangan: keterangan || check?.getDataValue('keterangan'),
          status: check?.getDataValue('status'),
          created_by: req?.user?.id || 0,
          created_date: date,
        },
      });

      message = 'Data success updated';
    } catch (err) {
      return helper.catchError(
        `status kerjasama update: ${err?.message}`,
        500,
        res
      );
    }

    try {
      if (check?.getDataValue('pic_email')) {
        await helper.sendEmail({
          to: check?.getDataValue('pic_email'),
          subject: 'Status Pengajuan Kerjasama',
          content: `
            <h3>Hi ${check?.getDataValue('pic_name')},</h3>
            <p>Pengajuan dengan nomor pendaftaran <b>${check?.getDataValue(
              'no_register'
            )}</b>, status menjadi:</p>
            <h3>${helper.formPengajuanStatus(check?.getDataValue('status'))}</h3>
            ${
              keterangan && keterangan != undefined
                ? `Keterangan: ${keterangan}`
                : ''
            }
            ${
              status == 5
                ? `<p>Masa berlaku MoU sampai dengan ${moment(masa_berlaku)
                    .locale('id')
                    .format('DD MMMM YYYY')}</p>`
                : ''
            }
          `,
          attachments: attachments,
        });
      }
    } catch (err) {
      message = `<br /> error send email: ${err?.message}`;
    }

    return response.success(true, message, res);
  }

  public async delete(req: Request, res: Response) {
    try {
      const id: any = req.params.id || 0;
      const check = await repository.detail({ id: id });
      if (!check) return response.failed('Data not found', 404, res);
      await repository.update({
        payload: {
          status: 9,
          modified_by: req?.user?.id || 0,
          modified_date: date,
        },
        condition: { id: id },
      });

      await repoForm.createHistoryStatus({
        payload: {
          id_pengajuan_kerjasama: id || check?.getDataValue('id'),
          status: 9,
          keterangan: 'Kerjasama dihapus',
          created_by: req?.user?.id || 0,
          created_date: date,
        },
      });
      return response.success(true, 'Data success deleted', res);
    } catch (err) {
      return helper.catchError(`kerjasama delete: ${err?.message}`, 500, res);
    }
  }
}
export const kerjasama = new Controller();
