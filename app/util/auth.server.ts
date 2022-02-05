import { Authenticator } from 'remix-auth';
import { GitHubStrategy } from 'remix-auth-github';
import { TwitterStrategy } from 'remix-auth-twitter';
import {
  Strategy,
  StrategyVerifyCallback,
  AuthenticateOptions,
} from 'remix-auth';
import type { SessionStorage } from 'remix';

import { sessionStorage } from './session.server';
import { getEnv } from '.';
import * as User from '~/models/User';

export const authenticator = new Authenticator<User.Schema>(sessionStorage);

authenticator.use(
  new GitHubStrategy(
    {
      clientID: getEnv('GITHUB_CLIENT_ID'),
      clientSecret: getEnv('GITHUB_CLIENT_SECRET'),
      callbackURL: getEnv(
        'GITHUB_CALLBACK_URL',
        'http://localhost:3000/auth/github/callback'
      ),
    },
    ({ profile }) =>
      User.findOrCreateByGithubId(profile.id, profile.displayName)
  )
);

authenticator.use(
  new TwitterStrategy(
    {
      clientID: getEnv('TWITTER_CLIENT_ID'),
      clientSecret: getEnv('TWITTER_CLIENT_SECRET'),
      callbackURL: getEnv(
        'TWITTER_CALLBACK_URL',
        'http://localhost:3000/auth/twitter/callback'
      ),
    },
    ({ profile }) =>
      User.findOrCreateByTwitterId(String(profile.id), profile.name)
  )
);

class DevStrategy<User> extends Strategy<User, void> {
  name = 'dev';

  constructor(verify: StrategyVerifyCallback<User, void>) {
    super(verify);
  }

  async authenticate(
    request: Request,
    sessionStorage: SessionStorage,
    options: AuthenticateOptions
  ): Promise<User> {
    return this.success(await this.verify(), request, sessionStorage, options);
  }
}

if (process.env.NODE_ENV != 'production') {
  authenticator.use(
    new DevStrategy(() => User.findOrCreateByTwitterId('dev', 'Test User'))
  );
}
