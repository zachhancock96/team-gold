import { createServer, ServerPlugin } from './server';
import notifySignupPlugin from './plugins/notify_signup';
import notifyNonLhsaaSchoolPlugin from './plugins/notify_non_lhsaa_school';
import notifyUserChangePlugin from './plugins/notify_user_change';
import notifyGameUpatePlugin from './plugins/notify_game_update';
import { env } from './env';

const serverConfig = {
  sql: {
    host: env('sql_host')!,
    user: env('sql_user')!,
    password: env('sql_password')!,
    timezone: env('sql_timezone')!,
    database: env('sql_database')!
  },
  http: {
    port: parseInt(env('http_port')!)
  },
  mail: {
    apiKey: env('mailgun_apikey'),
    domain: env('mailgun_domain'),
    from: env('email_from')
  }
} as ServerConfig;

const plugins: ServerPlugin[] = [
  notifySignupPlugin,
  notifyNonLhsaaSchoolPlugin,
  notifyUserChangePlugin,
  notifyGameUpatePlugin
];

createServer(serverConfig)
  .then(server => {
    plugins.forEach(plugin => plugin.use(server));
  });