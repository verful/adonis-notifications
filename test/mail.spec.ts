import test from 'japa'

import { cleanup, getUserModel, reset, setup, TestMailer, TestNotification } from '../test-helpers'
import { ApplicationContract } from '@ioc:Adonis/Core/Application'

let app: ApplicationContract

test.group('Mail Channel', (group) => {
  group.beforeEach(async () => {
    app = await setup()
  })

  group.afterEach(async () => {
    app.container.use('Adonis/Addons/Mail').restore()
    await reset(app)
  })

  group.after(async () => {
    await cleanup(app)
  })

  test('can create a mail notification using the channel', async (assert) => {
    assert.plan(1)
    const Notification = app.container.use('Verful/Notification')
    const Notifiable = app.container.use('Verful/Notification/Mixin')
    const Mail = app.container.use('Adonis/Addons/Mail')
    const { BaseModel } = app.container.use('Adonis/Lucid/Orm')
    const UserModel = getUserModel(BaseModel, Notifiable, Notification)
    const user = await UserModel.create({})
    Mail.trap((message) => {
      assert.exists(message)
    })
    await Notification.use('mail').send(TestMailer(Mail['BaseMailer'], user, 'channel'))
  })

  test('can create a mail notification using the manager', async (assert) => {
    assert.plan(1)
    const Notification = app.container.use('Verful/Notification')
    const Notifiable = app.container.use('Verful/Notification/Mixin')
    const Mail = app.container.use('Adonis/Addons/Mail')
    const { BaseModel } = app.container.use('Adonis/Lucid/Orm')
    const UserModel = getUserModel(BaseModel, Notifiable, Notification)
    const user = await UserModel.create({})
    Mail.trap((message) => {
      assert.exists(message)
    })
    await Notification.send(
      user,
      TestNotification('mail', TestMailer(Mail['BaseMailer'], user, 'manager'))
    )
  })

  test('can create a mail notification using the NotifiableModel.notify method', async (assert) => {
    assert.plan(1)
    const Notification = app.container.use('Verful/Notification')
    const Notifiable = app.container.use('Verful/Notification/Mixin')
    const Mail = app.container.use('Adonis/Addons/Mail')
    const { BaseModel } = app.container.use('Adonis/Lucid/Orm')
    const UserModel = getUserModel(BaseModel, Notifiable, Notification)
    const user = await UserModel.create({})
    Mail.trap((message) => {
      assert.exists(message)
    })
    await user.notify(TestNotification('mail', TestMailer(Mail['BaseMailer'], user, 'notify')))
  })

  test('can create a mail notification using the NotifiableModel.notifyLater method', async (assert) => {
    assert.plan(1)
    const Notification = app.container.use('Verful/Notification')
    const Notifiable = app.container.use('Verful/Notification/Mixin')
    const { BaseModel } = app.container.use('Adonis/Lucid/Orm')
    const Mail = app.container.use('Adonis/Addons/Mail')
    const UserModel = getUserModel(BaseModel, Notifiable, Notification)
    const user = await UserModel.create({})
    Mail.trap((message) => {
      assert.exists(message)
    })
    await user.notifyLater(
      TestNotification('mail', TestMailer(Mail['BaseMailer'], user, 'notifyLater'))
    )
  })
})
