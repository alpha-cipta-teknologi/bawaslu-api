'use strict';

import Pengguna from './pengguna.model';
import { Op, QueryTypes } from 'sequelize';
import conn from '../../../config/database';
import ArticleTema from './article.tema.model';
import PenggunaProvinve from './pengguna.province.model';
import ArticleKomunitas from './article.komunitas.model';
import PenggunaKomunitas from './pengguna.komunitas.model';
import PenggunaProvinveKomunitas from './pengguna.province.komunitas.model';

export default class Respository {
  public pengguna(data: any) {
    let query: Object = {
      offset: data?.offset,
      limit: data?.limit,
      where: data?.condition,
    };
    if (data?.keyword !== undefined && data?.keyword != null) {
      query = {
        ...query,
        where: {
          ...data?.condition,
          [Op.or]: [
            { provinces: { [Op.like]: `%${data?.keyword}%` } },
            { regencies: { [Op.like]: `%${data?.keyword}%` } },
          ],
        },
      };
    }
    return Pengguna.findAndCountAll(query);
  }

  public penggunaKomunitas(data: any) {
    let query: Object = {
      offset: data?.offset,
      limit: data?.limit,
      where: data?.condition,
    };
    if (data?.keyword !== undefined && data?.keyword != null) {
      query = {
        ...query,
        where: {
          ...data?.condition,
          [Op.or]: [
            { provinces: { [Op.like]: `%${data?.keyword}%` } },
            { regencies: { [Op.like]: `%${data?.keyword}%` } },
            { komunitas_name: { [Op.like]: `%${data?.keyword}%` } },
          ],
        },
      };
    }
    return PenggunaKomunitas.findAndCountAll(query);
  }

  public articleTema(data: any) {
    let query: Object = {
      offset: data?.offset,
      limit: data?.limit,
      where: data?.condition,
    };
    if (data?.keyword !== undefined && data?.keyword != null) {
      query = {
        ...query,
        where: {
          ...data?.condition,
          [Op.or]: [
            { provinces: { [Op.like]: `%${data?.keyword}%` } },
            { regencies: { [Op.like]: `%${data?.keyword}%` } },
            { tema_name: { [Op.like]: `%${data?.keyword}%` } },
          ],
        },
      };
    }
    return ArticleTema.findAndCountAll(query);
  }

  public articleKomunitas(data: any) {
    let query: Object = {
      offset: data?.offset,
      limit: data?.limit,
      where: data?.condition,
    };
    if (data?.keyword !== undefined && data?.keyword != null) {
      query = {
        ...query,
        where: {
          ...data?.condition,
          [Op.or]: [
            { provinces: { [Op.like]: `%${data?.keyword}%` } },
            { regencies: { [Op.like]: `%${data?.keyword}%` } },
            { komunitas_name: { [Op.like]: `%${data?.keyword}%` } },
          ],
        },
      };
    }
    return ArticleKomunitas.findAndCountAll(query);
  }

  public async dashboard() {
    return await conn.sequelize.query(
      `
        SELECT
        (SELECT COUNT(1) FROM app_resource WHERE status = 'A' AND role_id = 3) AS pengguna,
        (SELECT COUNT(1) FROM gallery WHERE status <> 9) AS gallery,
        (SELECT COUNT(1) FROM forum_article WHERE status <> 9) AS article,
        (SELECT COUNT(1) FROM forum_bawaslu_update WHERE status <> 9) AS bawaslu_update,
        (SELECT COUNT(1) FROM laporan_aduan WHERE status <> 9) AS laporan_aduan,
        (SELECT COUNT(1) FROM laporan_article WHERE status <> 9) AS laporan_article
      `,
      { type: QueryTypes.SELECT }
    );
  }

  public penggunaProvince(data: any) {
    let query: Object = {
      offset: data?.offset,
      limit: data?.limit,
      where: data?.condition,
    };
    if (data?.keyword !== undefined && data?.keyword != null) {
      query = {
        ...query,
        where: {
          ...data?.condition,
          [Op.or]: [{ provinces: { [Op.like]: `%${data?.keyword}%` } }],
        },
      };
    }
    return PenggunaProvinve.findAndCountAll(query);
  }

  public penggunaProvinceKomunitas(data: any) {
    let query: Object = {
      offset: data?.offset,
      limit: data?.limit,
      where: data?.condition,
    };
    if (data?.keyword !== undefined && data?.keyword != null) {
      query = {
        ...query,
        where: {
          ...data?.condition,
          [Op.or]: [
            { provinces: { [Op.like]: `%${data?.keyword}%` } },
            { komunitas_name: { [Op.like]: `%${data?.keyword}%` } },
          ],
        },
      };
    }
    return PenggunaProvinveKomunitas.findAndCountAll(query);
  }
}

export const repository = new Respository();
