import { resolve } from 'path'

import type { MailConfig } from '@ioc:Adonis/Addons/Mail'
import type { DatabaseConfig } from '@ioc:Adonis/Lucid/Database'
import type { NotificationConfig } from '@ioc:Verful/Notification'
import { Filesystem } from '@poppinss/dev-utils'

const database: DatabaseConfig = {
  connection: 'sqlite',
  connections: {
    sqlite: {
      client: 'sqlite',
      connection: {
        filename: resolve(__dirname, '../tmp/database.sqlite'),
      },
    },
  },
}

const notification: NotificationConfig = {
  channel: 'database',
  channels: {
    mail: {
      driver: 'mail',
    },
    database: {
      driver: 'database',
    },
  },
}

const mail: MailConfig = {
  mailer: 'smtp',
  mailers: {
    smtp: {
      driver: 'smtp',
      host: 'localhost',
      port: 587,
      auth: undefined,
    },
  },
}

export async function createAppConfig(fs: Filesystem) {
  await fs.add(
    'config/app.ts',
    `
		export const appKey = 'averylong32charsrandomsecretkey',
		export const http = {
			cookie: {},
			trustProxy: () => true,
		}
	`
  )
}

export async function createDatabaseConfig(fs: Filesystem) {
  await fs.add(
    'config/database.ts',
    `
		const databaseConfig = ${JSON.stringify(database, null, 2)}
		export default databaseConfig
	`
  )
}

export async function createNotificationConfig(fs: Filesystem) {
  await fs.add(
    'config/notification.ts',
    `
    const notificationConfig = ${JSON.stringify(notification, null, 2)}
    export default notificationConfig
  `
  )
}

export async function createMailConfig(fs: Filesystem) {
  await fs.add(
    'config/mail.ts',
    `
    const mailConfig = ${JSON.stringify(mail, null, 2)}
    export default mailConfig
  `
  )
}
