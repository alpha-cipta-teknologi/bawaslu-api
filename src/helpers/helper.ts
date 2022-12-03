'use strict';

import fs from 'fs';
import path from 'path';
import axios from 'axios';
import sharp from 'sharp';
import moment from 'moment';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { Response } from 'express';
import { response } from '../helpers/response';
import Telegram, { Telegram_ParseModes } from 'tele-sender';

dotenv.config();
const CHAT_ID_TELEGRAM: string = process.env.CHAT_ID_TELEGRAM || '';
const telegram = new Telegram(process.env.TOKEN_TELEGRAM || '');
const month: string = moment().format('YYYY-MM');

export default class Helper {
  public date() {
    return moment().locale('id').format('YYYY-MM-DD HH:mm:ss');
  }

  public only(keys: Array<string>, data: any, isUpdate: boolean = false) {
    const date = moment().locale('id').format('YYYY-MM-DD HH:mm:ss');
    let result: any = {};

    keys.forEach((i) => {
      if ((data[i] && data[i] !== undefined) || data[i] == 0) {
        result[i] = data[i];
      }
    });
    if (isUpdate) {
      result = {
        ...result,
        modified_date: date,
      };
    } else {
      result = {
        ...result,
        created_date: date,
      };
    }
    return result;
  }

  public async hashIt(password: string, length: number = 10) {
    const salt: string = await bcrypt.genSalt(length);
    const hashed: string = await bcrypt.hash(password, salt);
    return hashed;
  }

  public async compareIt(password: any, hashed: any) {
    return await bcrypt.compare(password, hashed);
  }

  public random(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  public async upload(file: any, folder: string = '') {
    const upload_path: string = `./public/uploads/${folder}/${month}`;
    if (!fs.existsSync(upload_path)) {
      fs.mkdirSync(upload_path, { recursive: true });
    }
    const name: string = file?.name.replace(/ /g, '');
    let uploadPath: string = `${upload_path}/${name}`;
    await file.mv(uploadPath, function (err: any) {
      if (err) {
        telegram.send(
          CHAT_ID_TELEGRAM,
          err?.message,
          Telegram_ParseModes.MarkdownV2
        );
        return err?.message;
      }
    });
    return uploadPath.replace('./public', '');
  }

  public async resize(file: any, fd: string, w: number, h: number = 0) {
    const size: string = `${w}${h == 0 ? '' : '_' + h}`;
    const rename = `${
      file?.name.replace(/ /g, '').split('.')[0]
    }_${size}.${file?.name.split('.').pop()}`;
    const upload_path: string = `./public/uploads/${fd}/${month}`;
    let uploadPath: string = `${upload_path}/${rename}`;
    if (!fs.existsSync(upload_path)) {
      fs.mkdirSync(upload_path, { recursive: true });
    }

    const resize = await sharp(path.resolve(file?.tempFilePath))
      .resize(w, h == 0 ? w : h)
      .toFile(path.resolve(uploadPath));

    return {
      ...resize,
      filename: rename,
      path_doc: uploadPath.replace('./public', ''),
    };
  }

  public async sendNotif(message: string) {
    // await telegram.send(
    //   CHAT_ID_TELEGRAM,
    //   message,
    //   Telegram_ParseModes.MarkdownV2
    // );
  }

  public async catchError(message: string, code: number, res: Response) {
    await this.sendNotif(message);    
    return response.failed(message, code, res);
  }

  public async sendEmail(data: Object | any) {
    try {
      const url: string = process.env.EMAIL_URL + '/send';
      axios.defaults.headers.common['apikey'] = process.env.EMAIL_APIKEY;
      await axios.post(url, {
        recipients: [data?.to],
        subject: data?.subject,
        encode: url,
        content: data?.content,
      });
    } catch (err) {
      await this.sendNotif(err?.message);
    }
  }
}

export const helper = new Helper();
