'use strict';

import { repository as repoForm } from '../form.repository';

export default class Transformer {
  public async list(data: any, user: any) {
    let result: Array<object> = [];
    for (let i in data) {
      const historyStatus: any = await repoForm.listHistoryStatus({
        condition: { id_pengajuan_kerjasama: data[i]?.dataValues?.id },
      });
      const attachment: any = await repoForm.listAttachment({
        condition: { id_pengajuan_kerjasama: data[i]?.dataValues?.id },
      });

      let isApproved: boolean = false;
      if (user) {
        isApproved =
          user?.role_name &&
          user?.role_name.includes(data[i]?.dataValues?.pengajuan_ke) &&
          [1, 2, 3, 7].includes(data[i]?.dataValues?.status);
      }

      const kerjasama: any = {
        ...data[i]?.dataValues,
        history_status: historyStatus,
        attachment: attachment,
        is_approved: isApproved,
      };
      result.push(kerjasama);
    }
    return result;
  }

  public async detail(data: any, user: any) {
    const kerjasama = data?.dataValues;
    const historyStatus: any = await repoForm.listHistoryStatus({
      condition: { id_pengajuan_kerjasama: kerjasama?.id },
    });
    const attachment: any = await repoForm.listAttachment({
      condition: { id_pengajuan_kerjasama: kerjasama?.id },
    });

    let isApproved: boolean = false;
    if (user) {
      isApproved =
        user?.role_name &&
        user?.role_name.includes(kerjasama?.pengajuan_ke) &&
        [1, 2, 3, 7].includes(kerjasama?.status);
    }

    const result: any = {
      ...kerjasama,
      history_status: historyStatus,
      attachment: attachment,
      is_approved: isApproved,
    };
    return result;
  }
}

export const transformer = new Transformer();
