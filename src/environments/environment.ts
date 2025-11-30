import { Environment } from '@abp/ng.core';

const baseUrl = 'http://localhost:4200';

export const environment = {
  production: false,
  application: {
    baseUrl,
    name: 'APME',
    logoUrl: '',
  },
  oAuthConfig: {
    issuer: 'https://localhost:44326/',
    redirectUri: baseUrl,
    clientId: 'APME_App',
    scope: 'offline_access APME',
    requireHttps: true,
  },
  apis: {
    default: {
      url: 'https://localhost:44326',
      rootNamespace: 'APME',
    },
  },
} as Environment;
