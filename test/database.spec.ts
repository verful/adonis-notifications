import test from 'japa'

import { cleanup, getUserModel, TestNotification, setup, reset } from '../test-helpers'
import { ApplicationContract } from '@ioc:Adonis/Core/Application'

let app: ApplicationContract

test.group('Database Channel', (group) => {
  group.beforeEach(async () => {
    app = await setup()
  })

  group.afterEach(async () => {
    await reset(app)
  })

  group.after(async () => {
    await cleanup(app)
  })

  test('can create a database notification using the channel', async (assert) => {
    assert.plan(1)
    const Notification = app.container.use('Verful/Notification')
    const Notifiable = app.container.use('Verful/Notification/Mixin')
    const { BaseModel } = app.container.use('Adonis/Lucid/Orm')
    const UserModel = getUserModel(BaseModel, Notifiable, Notification)
    const user = await UserModel.create({})
    await Notification.use('database').send({ test: 'channel' }, user)
    const notification = await user.related('notifications').query().firstOrFail()
    assert.deepEqual(notification.data, { test: 'channel' })
  })

  test('can create a database notification using the manager', async (assert) => {
    assert.plan(1)
    const Notification = app.container.use('Verful/Notification')
    const Notifiable = app.container.use('Verful/Notification/Mixin')
    const { BaseModel } = app.container.use('Adonis/Lucid/Orm')
    const UserModel = getUserModel(BaseModel, Notifiable, Notification)
    const user = await UserModel.create({})
    await Notification.send(user, TestNotification('database', { test: 'manager' }))
    const notification = await user.related('notifications').query().firstOrFail()
    assert.deepEqual(notification.data, { test: 'manager' })
  })

  test('can create a database notification using the NotifiableModel.notify method', async (assert) => {
    assert.plan(1)
    const Notifiable = app.container.use('Verful/Notification/Mixin')
    const Notification = app.container.use('Verful/Notification')
    const { BaseModel } = app.container.use('Adonis/Lucid/Orm')
    const UserModel = getUserModel(BaseModel, Notifiable, Notification)
    const user = await UserModel.create({})
    await user.notify(TestNotification('database', { test: 'notify' }))
    const notification = await user.related('notifications').query().firstOrFail()
    assert.deepEqual(notification.data, { test: 'notify' })
  })

  test('can create a database notification using the NotifiableModel.notifyLater method', async (assert) => {
    assert.plan(1)
    const Notifiable = app.container.use('Verful/Notification/Mixin')
    const Notification = app.container.use('Verful/Notification')
    const { BaseModel } = app.container.use('Adonis/Lucid/Orm')
    const UserModel = getUserModel(BaseModel, Notifiable, Notification)
    const user = await UserModel.create({})
    await user.notifyLater(TestNotification('database', { test: 'notifyLater' }))
    const notification = await user.related('notifications').query().firstOrFail()
    assert.deepEqual(notification.data, { test: 'notifyLater' })
  })
})
