'use strict';

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
}

export const repository = new Respository();
