'use strict';

import { repository as repoForm } from '../form.repository';

export default class Transformer {
  public async list(data: any) {
    let result: Array<object> = [];
    for (let i in data) {
      const historyStatus: any = await repoForm.listHistoryStatus({
        condition: { id_pengajuan_audiensi: data[i]?.dataValues?.id },
      });
      const attachment: any = await repoForm.listAttachment({
        condition: { id_pengajuan_audiensi: data[i]?.dataValues?.id },
      });

      const audiensi: any = {
        ...data[i]?.dataValues,
        history_status: historyStatus,
        attachment: attachment,
      };
      result.push(audiensi);
    }
    return result;
  }

  public async detail(data: any) {
    const audiensi = data?.dataValues;
    const historyStatus: any = await repoForm.listHistoryStatus({
      condition: { id_pengajuan_audiensi: audiensi?.id },
    });
    const attachment: any = await repoForm.listAttachment({
      condition: { id_pengajuan_audiensi: audiensi?.id },
    });

    const result: any = {
      ...audiensi,
      history_status: historyStatus,
      attachment: attachment,
    };
    return result;
  }
}

export const transformer = new Transformer();
