'use strict';

import { Request, Response } from 'express';
import { response } from '../../helpers/response';
import { repository as RepoMenu } from '../app/menu/menu.respository';

const nestedChildren = (data: any, parent: number = 0) => {
  let result: Array<object> = [];
  data.forEach((item: any) => {
    const menu: any = item?.dataValues;
    if (menu?.parent_id === parent) {
      let children: any = nestedChildren(data, menu?.menu_id);
      result.push({
        ...menu,
        children,
      });
    }
  });
  return result;
};

export default class Controller {
  public index(req: Request, res: Response) {
    return response.success(
      true,
      'Hello from the Bawaslu RESTful API  !!!!!',
      res
    );
  }

  public async navigation(req: Request, res: Response) {
    const result = await RepoMenu.list();
    if (result?.length < 1) return response.failed('Data not found', 404, res);
    const navigation = nestedChildren(result);
    return response.successList('Data navigation', navigation, res);
  }
}

export const global = new Controller();
