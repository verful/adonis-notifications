import 'reflect-metadata'

import { expect } from '@japa/expect'
import { specReporter } from '@japa/spec-reporter'
import { runFailedTests } from '@japa/run-failed-tests'
import { processCliArgs, configure, run, TestContext } from '@japa/runner'
import { Application } from '@adonisjs/core/build/standalone'
import { Filesystem } from '@poppinss/dev-utils'
import { resolve } from 'path'

import {
  createAppConfig,
  createDatabaseConfig,
  createMailConfig,
  createNotificationConfig,
} from './config'
import { NotificationContract } from '@ioc:Verful/Notification'
import { MessageContract } from '@ioc:Adonis/Addons/Mail'
/*
|--------------------------------------------------------------------------
| Configure tests
|--------------------------------------------------------------------------
|
| The configure method accepts the configuration to configure the Japa
| tests runner.
|
| The first method call "processCliArgs" process the command line arguments
| and turns them into a config object. Using this method is not mandatory.
|
| Please consult japa.dev/runner-config for the config docs.
*/
const fs = new Filesystem(resolve(__dirname, '..', 'tmp'))

configure({
  ...processCliArgs(process.argv.slice(2)),
  ...{
    files: ['tests/**/*.spec.ts'],
    plugins: [expect()],
    reporters: [specReporter()],
    importer: (filePath: string) => import(filePath),
    setup: [
      async () => {
        await fs.add('.env', '')
        await createAppConfig(fs)
        await createDatabaseConfig(fs)
        await createMailConfig(fs)
        await createNotificationConfig(fs)

        const app = new Application(fs.basePath, 'test', {
          providers: [
            '@adonisjs/core',
            '@adonisjs/mail',
            '@adonisjs/lucid',
            '../../providers/NotificationProvider',
          ],
        })

        await app.setup()
        await app.registerProviders()
        await app.bootProviders()

        return async () => {
          const db = app.container.use('Adonis/Lucid/Database')
          await db.manager.closeAll()
          await app.shutdown()
          await fs.cleanup()
        }
      },
    ],
  },
})

/**
 * Setup context
 */
TestContext.getter('app', () => require('@ioc:Adonis/Core/Application'))
TestContext.macro(
  'getNotification',
  (
    channels = ['database'],
    toDatabase = {
      title: 'test',
    }
  ): NotificationContract => ({
    via() {
      return channels
    },
    toDatabase() {
      return toDatabase
    },
  })
)
TestContext.macro('getMailer', async (subject = 'Test', target = 'test@example.com') => {
  const { BaseMailer } = await import('@ioc:Adonis/Addons/Mail')
  return new (class extends BaseMailer {
    public prepare(message: MessageContract) {
      return message.subject(subject).from('test@test.com').to(target)
    }
  })()
})
TestContext.macro('getNotifiable', async (tableName = 'notifications', persisted = true) => {
  const { default: notifiableFactory } = await import('./notifiableFactory')
  return notifiableFactory(tableName, persisted)
})
/*
|--------------------------------------------------------------------------
| Run tests
|--------------------------------------------------------------------------
|
| The following "run" method is required to execute all the tests.
|
*/
run()
