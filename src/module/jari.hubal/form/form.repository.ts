'use strict';

import { QueryTypes } from 'sequelize';
import DocMou from './document.mou.model';
import conn from '../../../config/database';
import Attachment from './attachment.model';
import HistoryStatus from './history.status.model';

export default class Respository {
  public listAttachment(data: any) {
    return Attachment.findAll({
      where: data?.condition,
      order: [['id', 'DESC']],
    });
  }

  public async createAttachment(data: any) {
    return Attachment.create(data?.payload);
  }

  public bulkCreateAttachment(data: any) {
    return Attachment.bulkCreate(data?.payload);
  }

  public updateAttachment(data: any) {
    return Attachment.update(data?.payload, {
      where: data?.condition,
    });
  }

  public deleteAttachment(data: any) {
    return Attachment.destroy({
      where: data?.condition,
    });
  }

  public listHistoryStatus(data: any) {
    return HistoryStatus.findAll({
      where: data?.condition,
      order: [['id', 'DESC']],
    });
  }

  public async createHistoryStatus(data: any) {
    return HistoryStatus.create(data?.payload);
  }

  public bulkCreateHistoryStatus(data: any) {
    return HistoryStatus.bulkCreate(data?.payload);
  }

  public updateHistoryStatus(data: any) {
    return HistoryStatus.update(data?.payload, {
      where: data?.condition,
    });
  }

  public deleteHistoryStatus(data: any) {
    return HistoryStatus.destroy({
      where: data?.condition,
    });
  }

  public listDocMou(data: any) {
    return DocMou.findAll({
      where: data?.condition,
      order: [['id', 'DESC']],
    });
  }

  public detailDocMou(condition: any) {
    return DocMou.findOne({
      where: condition,
    });
  }

  public async createDocMou(data: any) {
    return DocMou.create(data?.payload);
  }

  public bulkCreateDocMou(data: any) {
    return DocMou.bulkCreate(data?.payload);
  }

  public updateDocMou(data: any) {
    return DocMou.update(data?.payload, {
      where: data?.condition,
    });
  }

  public deleteDocMou(data: any) {
    return DocMou.destroy({
      where: data?.condition,
    });
  }

  public async listForm(data: any) {
    let query: string = `
      SELECT z.*
      FROM (
        SELECT
          a.nama_lembaga,
          a.pic_name,
          a.pic_phone,
          a.pic_email,
          a.no_register,
          a.pengajuan_ke,
          a.perihal_audiensi AS title,
          a.area_province_id,
          ap.name AS area_province_name,
          a.area_regencies_id,
          ar.name AS area_regencies_name,
          a.status,
          dm.path_url AS doc_mou,
          dm.masa_berlaku,
          dm.keterangan AS ket_mou,
          a.created_by,
          a.created_date,
          a.modified_by,
          a.modified_date
        FROM form_pengajuan_audiensi a
        LEFT JOIN area_provinces ap ON ap.id = a.area_province_id
        LEFT JOIN area_regencies ar ON ar.id = a.area_regencies_id
        LEFT JOIN form_document_mou dm ON dm.id_pengajuan_audiensi = a.id
        WHERE a.status IN (5,8)

        UNION

        SELECT
          k.nama_lembaga,
          k.pic_name,
          k.pic_phone,
          k.pic_email,
          k.no_register,
          k.pengajuan_ke,
          k.nama_kerjasama AS title,
          k.area_regencies_id,
          ap.name AS area_province_name,
          k.area_province_id,
          ar.name AS area_regencies_name,
          k.status,
          dm.path_url AS doc_mou,
          dm.masa_berlaku,
          dm.keterangan AS ket_mou,
          k.created_by,
          k.created_date,
          k.modified_by,
          k.modified_date
        FROM form_pengajuan_kerjasama k
        LEFT JOIN area_provinces ap ON ap.id = k.area_province_id
        LEFT JOIN area_regencies ar ON ar.id = k.area_regencies_id
        LEFT JOIN form_document_mou dm ON dm.id_pengajuan_kerjasama = k.id
        WHERE k.status IN (5,8)
      ) AS z
    `;
    if (
      data?.date ||
      data?.area_province_id ||
      data?.area_regencies_id ||
      data?.keyword
    ) {
      query += ` WHERE`;

      if (data?.date) {
        query += ` z.masa_berlaku = '${data?.date}'`;
      }
      if (data?.area_province_id) {
        if (data?.date) query += ` AND`;
        query += ` z.area_province_id = '${data?.area_province_id}'`;
      }
      if (data?.area_regencies_id) {
        if (data?.date || data?.area_province_id) query += ` AND`;
        query += ` z.area_regencies_id = '${data?.area_regencies_id}'`;
      }
      if (data?.keyword) {
        if (data?.date || data?.area_province_id || data?.area_regencies_id)
          query += ` AND`;
        query += ` (
          z.title LIKE '%${data?.keyword}%'
          OR z.nama_lembaga LIKE '%${data?.keyword}%'
          OR z.pic_name LIKE '%${data?.keyword}%'
          OR z.no_register LIKE '%${data?.keyword}%'
          OR z.ket_mou LIKE '%${data?.keyword}%'
        )`;
      }
    }
    const count = await conn.sequelize.query(
      `SELECT COUNT(c.no_register) AS total FROM (${query}) AS c`,
      {
        type: QueryTypes.SELECT,
      }
    );

    if (data?.limit) query += ` LIMIT ${data?.limit}`;
    if (data?.offset) query += ` OFFSET ${data?.offset}`;

    const rows = await conn.sequelize.query(query, {
      type: QueryTypes.SELECT,
    });

    return { total: count[0]?.total, values: rows };
  }
}

export const repository = new Respository();
