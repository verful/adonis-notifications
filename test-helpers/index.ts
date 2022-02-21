import { resolve } from 'path'
import { Filesystem } from '@poppinss/dev-utils'
import { Application } from '@adonisjs/core/build/standalone'
import {
  NotifiableMixin,
  NotifiableModel,
  NotificationChannelsList,
  NotificationConfig,
  NotificationContract,
  NotificationManager,
} from '@ioc:Verful/Notification'
import type { BaseMailer, MailConfig, MessageContract } from '@ioc:Adonis/Addons/Mail'
import { DatabaseConfig, QueryClientContract } from '@ioc:Adonis/Lucid/Database'
import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { LucidModel } from '@ioc:Adonis/Lucid/Orm'
import { compose } from '@poppinss/utils/build/helpers'

export function getUserModel(
  BaseModel: LucidModel,
  Notifiable: NotifiableMixin,
  Notification: NotificationManager
) {
  const UserModel = class User extends compose(BaseModel, Notifiable) {
    // Just to test email channel
    public email = 'user@test.com'

    // Replace this methods as the notification manager cannot be loaded without
    // the ioc bindings
    public async notify(notification: NotificationContract) {
      await Notification.send(this, notification)
    }

    public async notifyLater(notification: NotificationContract) {
      await Notification.sendLater(this, notification)
    }
  }

  UserModel.boot()
  UserModel.$addColumn('id', { isPrimary: true })

  return UserModel
}

export const TestMailer = (
  Mailer: typeof BaseMailer,
  user: InstanceType<ReturnType<typeof getUserModel>>,
  subject = 'Test Notification'
) => {
  return new (class extends Mailer {
    public prepare(message: MessageContract) {
      return message.subject(subject).from('test@test.com').to(user.email)
    }
  })()
}

export const database: DatabaseConfig = {
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

export const notification: NotificationConfig = {
  channel: 'mail',
  channels: {
    mail: {
      driver: 'mail',
      mailer: 'smtp',
    },
    database: {
      driver: 'database',
    },
  },
}

export const mail: MailConfig = {
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

export const fs = new Filesystem(resolve(__dirname, '..', 'tmp'))

export const TestNotification = (
  channels: keyof NotificationChannelsList | (keyof NotificationChannelsList)[],
  content?: any
) => ({
  via(_notifiable: NotifiableModel) {
    return [channels].flat()
  },
  toDatabase() {
    return (
      content || {
        title: 'Test Notification',
      }
    )
  },
  toMail() {
    return content
  },
})

async function createUsersTable(client: QueryClientContract) {
  await client.schema.createTableIfNotExists('users', (table) => {
    table.increments('id').primary()
  })
}

async function createNotificationsTable(client: QueryClientContract) {
  await client.schema.createTableIfNotExists('notifications', (table) => {
    table.increments('id').primary()
    table.integer('notifiable_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
    table.json('data').notNullable()
    table.timestamp('read_at', { useTz: true })
    table.timestamp('created_at', { useTz: true })
    table.timestamp('updated_at', { useTz: true })
  })
}

export async function setup(
  notificationConfig: NotificationConfig = notification,
  mailConfig: MailConfig = mail,
  databaseConfig: DatabaseConfig = database
) {
  await fs.add('.env', '')
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

  await fs.add(
    'config/database.ts',
    `
		const databaseConfig = ${JSON.stringify(databaseConfig || {}, null, 2)}
		export default databaseConfig
	`
  )

  await fs.add(
    'config/mail.ts',
    `
		const mailConfig = ${JSON.stringify(mailConfig || {}, null, 2)}
		export default mailConfig
	`
  )

  await fs.add(
    'config/notification.ts',
    `
    const notificationConfig = ${JSON.stringify(notificationConfig || {}, null, 2)}
    export default notificationConfig
  `
  )

  const app = new Application(fs.basePath, 'web', {
    providers: [
      '@adonisjs/core',
      '@adonisjs/mail',
      '@adonisjs/lucid',
      '../providers/NotificationProvider',
    ],
  })

  await app.setup()
  await app.registerProviders()
  await app.bootProviders()
  await app.start()

  const db = app.container.use('Adonis/Lucid/Database')
  await createUsersTable(db.connection())
  await createNotificationsTable(db.connection())

  return app
}

export async function cleanup(app: ApplicationContract) {
  const db = app.container.use('Adonis/Lucid/Database')
  await db.connection().schema.dropTableIfExists('notifications')
  await db.connection().schema.dropTableIfExists('users')
  await db.manager.closeAll()
  await fs.cleanup()
  await app.shutdown()
}

export async function reset(app: ApplicationContract) {
  const db = app.container.use('Adonis/Lucid/Database')
  await db.connection().truncate('notifications')
  await db.connection().truncate('users')
}
