'use strict';

import { Request, Response } from 'express';
import { helper } from '../../../helpers/helper';
import { response } from '../../../helpers/response';
import { repository as rAudiensi } from '../form/audiensi/audiensi.repository';
import { transformer as tAudiensi } from '../form/audiensi/audiensi.transformer';
import { repository as rKerjasama } from '../form/kerjasama/kerjasama.repository';
import { transformer as tKerjasama } from '../form/kerjasama/kerjasama.transformer';

export default class Controller {
  public async lacak(req: Request, res: Response) {
    try {
      const no_register: any = req?.body?.no_register;
      if (!no_register)
        return response.failed('no_register is a required', 422, res);

      let data = null;
      if (no_register.includes('kerjasama')) {
        const resultKerjasama: Object | any = await rKerjasama.detail({
          no_register: no_register,
        });
        if (!resultKerjasama)
          return response.failed('Data not found', 404, res);
        data = await tKerjasama.detail(resultKerjasama);
      } else if (no_register.includes('audiensi')) {
        const resultAudiensi: Object | any = await rAudiensi.detail({
          no_register: no_register,
        });
        if (!resultAudiensi) return response.failed('Data not found', 404, res);
        data = await tAudiensi.detail(resultAudiensi);
      }

      if (!data) return response.failed('Data not found', 404, res);

      return response.successDetail('Data lacak pengajuan', data, res);
    } catch (err) {
      return helper.catchError(`lacak pengajuan: ${err?.message}`, 500, res);
    }
  }
}
export const form = new Controller();
