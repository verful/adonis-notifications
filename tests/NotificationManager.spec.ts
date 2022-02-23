import Database from '@ioc:Adonis/Lucid/Database'
import { LucidModel } from '@ioc:Adonis/Lucid/Orm'
import Event from '@ioc:Adonis/Core/Event'
import { test } from '@japa/runner'
import { createNotificationsTable, createUsersTable } from '../bin/test/database'
import DatabaseChannel from '../src/Channels/Database'
import MailChannel from '../src/Channels/Mail'
import NotificationManager from '../src/Notification'

test.group('NotificationManager', (group) => {
  group.each.setup(async () => {
    await createUsersTable()
    await createNotificationsTable()
  })

  group.each.teardown(async () => {
    await Database.connection().truncate('notifications')
    await Database.connection().truncate('users')
  })

  test('Can create a manager', ({ expect, app }) => {
    expect.assertions(1)
    const manager = new NotificationManager(app, app.config.get('notification'))
    expect(manager).toBeInstanceOf(NotificationManager)
  })

  test('Can get the default channel', async ({ expect, app }) => {
    expect.assertions(1)
    const manager = new NotificationManager(app, app.config.get('notification'))
    expect(manager.use()).toBeInstanceOf(DatabaseChannel)
  })

  test('Can send notifications using the manager', async ({
    expect,
    app,
    getNotifiable,
    getNotification,
  }) => {
    expect.assertions(1)
    const manager = new NotificationManager(app, app.config.get('notification'))
    const notifiable = await getNotifiable()
    await manager.send(notifiable, getNotification(['database']))
    await notifiable.load('notifications')
    expect(notifiable.notifications.length).toBe(1)
  })

  test('Can send delayed notifications using the manager', async ({
    expect,
    app,
    getNotifiable,
    getNotification,
  }) => {
    expect.assertions(1)
    const manager = new NotificationManager(app, app.config.get('notification'))
    const notifiable = await getNotifiable()
    await manager.sendLater(notifiable, getNotification(['database']))
    await notifiable.load('notifications')
    expect(notifiable.notifications.length).toBe(1)
  })

  test('Can send notifications to many notifiables using the manager', async ({
    expect,
    app,
    getNotifiable,
    getNotification,
  }) => {
    expect.assertions(1)
    const manager = new NotificationManager(app, app.config.get('notification'))
    const notifiables: any[] = []

    for (let i = 0; i < 3; i++) {
      notifiables.push(await getNotifiable())
    }

    await manager.send(notifiables, getNotification(['database']))
    const notifications = await (notifiables[0].constructor as LucidModel).$relationsDefinitions
      .get('notifications')!
      .relatedModel()
      .query()

    expect(notifications.length).toBe(3)
  })

  test('Can get MailChannel from manager', async ({ expect, app }) => {
    expect.assertions(1)
    const manager = new NotificationManager(app, app.config.get('notification'))
    expect(manager.use('mail')).toBeInstanceOf(MailChannel)
  })

  test('Can get DatabaseChannel from manager', async ({ expect, app }) => {
    expect.assertions(1)
    const manager = new NotificationManager(app, app.config.get('notification'))
    expect(manager.use('database')).toBeInstanceOf(DatabaseChannel)
  })

  test('Default queue monitor logs errors', async ({ app, getNotifiable }) => {
    const config = {
      channel: 'error',
      channels: {
        error: {
          driver: 'error',
        },
      },
    }

    const errorChannel = {
      send: async (notification) => {
        throw new Error(`Test - ${notification}`)
      },
    }

    const manager = new NotificationManager(app, config as any)
    manager.extend('error', () => errorChannel)
    const notifiable = await getNotifiable()
    manager.sendLater(notifiable, {
      via: () => 'error',
      toError: () => 'Error message',
    } as any)
  })

  test('Can set a queue monitor callback', async ({ expect, app }) => {
    expect.assertions(1)
    const manager = new NotificationManager(app, app.config.get('notification'))
    const callback = () => {
      console.log('Queue monitor callback')
    }
    manager.monitorQueue(callback)
    expect(manager['queueMonitor']).toBe(callback)
  })

  test('Sending a notification emits a event', async ({
    expect,
    app,
    getNotifiable,
    getNotification,
  }) => {
    expect.assertions(1)
    const manager = new NotificationManager(app, app.config.get('notification'))
    const notifiable = await getNotifiable()
    Event.trap('notification:sent', (data) => {
      expect(data).toEqual({
        notification: { title: 'test' },
        notifiable,
        channel: 'database',
      })
    })
    await manager.send(notifiable, getNotification(['database']))
  })

  test('Sending a delayed notification emits a event', async ({
    expect,
    app,
    getNotifiable,
    getNotification,
  }, done) => {
    expect.assertions(1)
    const manager = new NotificationManager(app, app.config.get('notification'))
    const notifiable = await getNotifiable()
    Event.trap('notification:sent', (data) => {
      expect(data).toEqual({
        notification: { title: 'test' },
        notifiable,
        channel: 'database',
      })
      done()
    })
    await manager.sendLater(notifiable, getNotification(['database']))
  }).waitForDone()
})
