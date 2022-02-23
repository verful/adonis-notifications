import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import { createNotificationsTable, createUsersTable } from '../bin/test/database'
import createNotificationModel from '../src/Models/DatabaseNotification'

test.group('DatabaseNotification', async (group) => {
  group.each.setup(async () => {
    await createUsersTable()
    await createNotificationsTable()
  })

  group.each.teardown(async () => {
    await Database.connection().truncate('notifications')
    await Database.connection().truncate('users')
  })

  test('Model created succesfully', ({ expect }) => {
    const Model = createNotificationModel('test')
    expect(Model).toBeDefined()
    expect(Model.table).toBe('test')
  })

  test('DatabaseNotification.markAsRead', async ({ expect, getNotifiable }) => {
    const user = await getNotifiable()
    const Model = createNotificationModel('notifications')

    const notification = await Model.create({
      notifiableId: user.id,
      data: {},
    })

    expect(notification.read).toBe(false)
    await notification.markAsRead()
    expect(notification.read).toBe(true)
  })

  test('DatabaseNotification.markAsUnread', async ({ expect, getNotifiable }) => {
    const user = await getNotifiable()
    const Model = createNotificationModel('notifications')

    const notification = await Model.create({
      notifiableId: user.id,
      data: {},
    })

    await notification.markAsRead()
    expect(notification.unread).toBe(false)
    await notification.markAsUnread()
    expect(notification.unread).toBe(true)
  })
})
