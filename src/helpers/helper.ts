'use strict';

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import axios from 'axios';
import moment from 'moment';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { Response } from 'express';
import nodemailer from 'nodemailer';
import { response } from '../helpers/response';
import { onesignal } from '../config/onesignal';
import SSOLogs from '../module/auth/sso.log.model';
import * as OneSignal from '@onesignal/node-onesignal';
import Telegram, { Telegram_ParseModes } from 'tele-sender';

interface mail {
  host: string;
  port: number;
  user: string;
  pass: string;
  sender: string;
}

dotenv.config();
const CHAT_ID_TELEGRAM: string = process.env.CHAT_ID_TELEGRAM || '';
const telegram = new Telegram(process.env.TOKEN_TELEGRAM || '');
const month: string = moment().format('YYYY-MM');
const configMail: mail = {
  host: process.env.MAIL_HOST || 'smtp.mailtrap.io',
  port: +(process.env.MAIL_PORT || 2525),
  user: process.env.MAIL_USERNAME || 'fce06934e4832d',
  pass: process.env.MAIL_PASSWORD || '27ceb283c382c4',
  sender: process.env.MAIL_SENDER || 'noreply@bawaslu.go.id',
};

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

    let resize: any = null;
    if (['gallery'].includes(fd)) {
      const metadata = await sharp(path.resolve(file?.tempFilePath)).metadata();
      const width: number = +(metadata?.width || 0);
      const height: number = +(metadata?.height || 0);
      const newWidth: number = Math.round(width / (height / w));

      resize = await sharp(path.resolve(file?.tempFilePath))
        .resize(newWidth, w)
        .toFile(path.resolve(uploadPath));
    } else {
      resize = await sharp(path.resolve(file?.tempFilePath))
        .resize(w, h == 0 ? w : h)
        .toFile(path.resolve(uploadPath));
    }

    return {
      ...resize,
      filename: rename,
      path_doc: uploadPath.replace('./public', ''),
    };
  }

  public async sendNotif(message: string) {
    await telegram.send(
      CHAT_ID_TELEGRAM,
      message,
      Telegram_ParseModes.MarkdownV2
    );
  }

  public async catchError(message: string, code: number, res: Response) {
    await this.sendNotif(message);
    return response.failed(message, code, res);
  }

  public async sendEmail(data: Object | any) {
    const transporter = nodemailer.createTransport({
      host: configMail?.host,
      port: configMail?.port,
      secure: true,
      requireTLS: true,
      auth: {
        user: configMail?.user,
        pass: configMail?.pass,
      },
      tls: {
        minVersion: 'TLSv1',
        rejectUnauthorized: false,
      },
      logger: true,
    });

    const mailOptions = {
      from: configMail?.sender,
      to: data?.to,
      subject: data?.subject,
      html: data?.content,
    };

    transporter.sendMail(mailOptions, async (error: any, info: any) => {
      if (error) {
        await this.sendNotif(`Email error: ${error}`);
        console.warn(`Email error: ${error}`);
      } else {
        console.warn(`Email sent: ${info?.response}`);
      }
    });
    // try {
    //   const url: string = 'https://dev-api-ckp.sphere154.com/sendmail';
    //   await axios.post(url, {
    //     email: [data?.to],
    //     subject: data?.subject,
    //     content: data?.content,
    //   });
    // } catch (err) {
    //   await this.sendNotif(`send email: ${err?.message}`);
    // }
  }

  public slug(string: string) {
    return string
      .replace(/ /g, '-')
      .replace(/[^a-zA-Z0-9-]+/g, '')
      .toLowerCase();
  }

  public async sendOneSignalCMS(data: any, usernames: Array<string>) {
    const onesignal_app_id: string = process.env.ONESIGNAL_APP_ID_CMS || '';
    const notification: OneSignal.Notification = new OneSignal.Notification();
    notification.app_id = onesignal_app_id;
    notification.included_segments = ['Subscribed Users'];
    notification.contents = { en: data?.title };
    notification.web_url = data?.web_url;
    notification.include_external_user_ids = usernames;
    const { id } = await onesignal.cms.createNotification(notification);

    return await onesignal.cms.getNotification(onesignal_app_id, id);
  }

  public async sendOneSignalForum(msg: string, usernames: Array<string>) {
    const onesignal_app_id: string = process.env.ONESIGNAL_APP_ID_FORUM || '';
    const notification: OneSignal.Notification = new OneSignal.Notification();
    notification.app_id = onesignal_app_id;
    notification.included_segments = ['Subscribed Users'];
    notification.contents = { en: msg };
    notification.web_url = process.env.BASE_URL_FE || '';
    notification.include_external_user_ids = usernames;
    const { id } = await onesignal.forum.createNotification(notification);

    return await onesignal.forum.getNotification(onesignal_app_id, id);
  }

  public async SSOLogs(data: any) {
    return SSOLogs.create(data);
  }
}

export const helper = new Helper();
