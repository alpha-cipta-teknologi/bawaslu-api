'use strict';

import { repository as repoForm } from '../form.repository';

export default class Transformer {
  public async list(data: any) {
    let result: Array<object> = [];
    for (let i in data) {
      const historyStatus: any = await repoForm.listHistoryStatus({
        condition: { id_pengajuan_kerjasama: data[i]?.dataValues?.id },
      });
      const attachment: any = await repoForm.listAttachment({
        condition: { id_pengajuan_kerjasama: data[i]?.dataValues?.id },
      });

      const kerjasama: any = {
        ...data[i]?.dataValues,
        history_status: historyStatus,
        attachment: attachment,
      };
      result.push(kerjasama);
    }
    return result;
  }

  public async detail(data: any) {
    const kerjasama = data?.dataValues;
    const historyStatus: any = await repoForm.listHistoryStatus({
      condition: { id_pengajuan_kerjasama: kerjasama?.id },
    });
    const attachment: any = await repoForm.listAttachment({
      condition: { id_pengajuan_kerjasama: kerjasama?.id },
    });

    const result: any = {
      ...kerjasama,
      history_status: historyStatus,
      attachment: attachment,
    };
    return result;
  }
}

export const transformer = new Transformer();
