'use strict';

import { Op } from 'sequelize';
import Pengguna from './pengguna.model';
import PenggunaKomunitas from './pengguna.komunitas.model';

export default class Respository {
  public pengguna(data: any) {
    console.warn(data?.condition);

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
}

export const repository = new Respository();
