import test from 'japa'

import { cleanup, getUserModel, setup, TestNotification } from '../test-helpers'
import { ApplicationContract } from '@ioc:Adonis/Core/Application'

let app: ApplicationContract

test.group('DatabaseNotification', (group) => {
  group.beforeEach(async () => {
    app = await setup()
  })

  group.afterEach(async () => {
    await cleanup(app)
  })

  test('can see all read notifications from user', async (assert) => {
    assert.plan(3)
    const Notification = app.container.use('Verful/Notification')
    const Notifiable = app.container.use('Verful/Notification/Mixin')
    const { BaseModel } = app.container.use('Adonis/Lucid/Orm')
    const UserModel = getUserModel(BaseModel, Notifiable, Notification)
    const user = await UserModel.create({})
    for (let i = 0; i < 3; i++) {
      await Notification.send(user, TestNotification('database', { test: 'manager' }))
    }
    await user.markNotificationsAsRead()
    await user.load('notifications')
    for (const notification of await user.readNotifications()) {
      assert.isTrue(notification.read)
    }
  })

  test('can see all unread notifications from user', async (assert) => {
    assert.plan(3)
    const Notification = app.container.use('Verful/Notification')
    const Notifiable = app.container.use('Verful/Notification/Mixin')
    const { BaseModel } = app.container.use('Adonis/Lucid/Orm')
    const UserModel = getUserModel(BaseModel, Notifiable, Notification)
    const user = await UserModel.create({})
    for (let i = 0; i < 3; i++) {
      await Notification.send(user, TestNotification('database', { test: 'manager' }))
    }
    await user.markNotificationsAsRead()
    await user.markNotificationsAsUnread()
    await user.load('notifications')
    for (const notification of await user.unreadNotifications()) {
      assert.isTrue(notification.unread)
    }
  })

  test('can mark all notifications as read', async (assert) => {
    assert.plan(3)
    const Notification = app.container.use('Verful/Notification')
    const Notifiable = app.container.use('Verful/Notification/Mixin')
    const { BaseModel } = app.container.use('Adonis/Lucid/Orm')
    const UserModel = getUserModel(BaseModel, Notifiable, Notification)
    const user = await UserModel.create({})
    for (let i = 0; i < 3; i++) {
      await Notification.send(user, TestNotification('database', { test: 'manager' }))
    }
    await user.markNotificationsAsRead()
    const notifications = await user.related('notifications').query()
    for (const notification of notifications) {
      assert.isTrue(notification.read)
    }
  })

  test('can mark all notification as unread', async (assert) => {
    assert.plan(3)
    const Notification = app.container.use('Verful/Notification')
    const Notifiable = app.container.use('Verful/Notification/Mixin')
    const { BaseModel } = app.container.use('Adonis/Lucid/Orm')
    const UserModel = getUserModel(BaseModel, Notifiable, Notification)
    const user = await UserModel.create({})
    for (let i = 0; i < 3; i++) {
      await Notification.send(user, TestNotification('database', { test: 'manager' }))
    }
    await user.markNotificationsAsRead()
    await user.markNotificationsAsUnread()
    const notifications = await user.related('notifications').query()
    for (const notification of notifications) {
      assert.isTrue(notification.unread)
    }
  })
})
