import test from 'japa'

import { cleanup, getUserModel, setup, TestNotification } from '../test-helpers'
import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { DateTime } from 'luxon'

let app: ApplicationContract

test.group('DatabaseNotification', (group) => {
  group.beforeEach(async () => {
    app = await setup()
  })

  group.afterEach(async () => {
    await cleanup(app)
  })

  test('can mark notification as read', async (assert) => {
    assert.plan(3)
    const Notification = app.container.use('Verful/Notification')
    const Notifiable = app.container.use('Verful/Notification/Mixin')
    const { BaseModel } = app.container.use('Adonis/Lucid/Orm')
    const UserModel = getUserModel(BaseModel, Notifiable, Notification)
    const user = await UserModel.create({})
    await Notification.send(user, TestNotification('database', { test: 'manager' }))
    const notification = await user.related('notifications').query().firstOrFail()
    await notification.markAsRead()
    assert.isTrue(notification.read)
    assert.isFalse(notification.unread)
    assert.instanceOf(notification.readAt, DateTime)
  })

  test('can mark notification as unread', async (assert) => {
    assert.plan(3)
    const Notification = app.container.use('Verful/Notification')
    const Notifiable = app.container.use('Verful/Notification/Mixin')
    const { BaseModel } = app.container.use('Adonis/Lucid/Orm')
    const UserModel = getUserModel(BaseModel, Notifiable, Notification)
    const user = await UserModel.create({})
    await Notification.send(user, TestNotification('database', { test: 'manager' }))
    const notification = await user.related('notifications').query().firstOrFail()
    await notification.markAsRead()
    await notification.markAsUnread()
    assert.isFalse(notification.read)
    assert.isTrue(notification.unread)
    assert.isNull(notification.readAt)
  })
})
