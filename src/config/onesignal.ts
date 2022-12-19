'use strict';

import dotenv from 'dotenv';
import * as OneSignal from '@onesignal/node-onesignal';
import { Configuration } from '@onesignal/node-onesignal';
import { PromiseDefaultApi } from '@onesignal/node-onesignal/dist/types/PromiseAPI';

dotenv.config();

// cms
const app_key_provider_cms: { getToken(): string } = {
  getToken(): string {
    return process.env.ONESIGNAL_REST_API_KEY_CMS || '';
  },
};

const configuration_cms: Configuration = OneSignal.createConfiguration({
  authMethods: {
    app_key: {
      tokenProvider: app_key_provider_cms,
    },
  },
});
const cms: PromiseDefaultApi = new OneSignal.DefaultApi(configuration_cms);

// forum
const app_key_provider_forum: { getToken(): string } = {
  getToken(): string {
    return process.env.ONESIGNAL_REST_API_KEY_FORUM || '';
  },
};

const configuration_forum: Configuration = OneSignal.createConfiguration({
  authMethods: {
    app_key: {
      tokenProvider: app_key_provider_forum,
    },
  },
});
const forum: PromiseDefaultApi = new OneSignal.DefaultApi(configuration_forum);

export const onesignal: { cms: PromiseDefaultApi; forum: PromiseDefaultApi } = {
  cms: cms,
  forum: forum,
};
