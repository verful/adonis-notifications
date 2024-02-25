import { test } from '@japa/runner'
import { BaseModel } from '@ioc:Adonis/Lucid/Orm'
import RoutesNotifications from '../../src/Mixins/RoutesNotifications'
import Notification from '@ioc:Verful/Notification'

test.group('RoutesNotificationsMixin', (group) => {
  group.each.teardown(() => {
    Notification.restore()
  })

  test('Mixin gets applied succesfuly', ({ expect }) => {
    class Model extends RoutesNotifications(BaseModel) {}

    expect(Model.prototype.notify).toEqual(expect.any(Function))
    expect(Model.prototype.notifyLater).toEqual(expect.any(Function))
  })

  test('Notifiable.notify', async ({ expect, getNotification }, done) => {
    expect.assertions(1)
    class User extends RoutesNotifications(BaseModel) {}
    // Boot is needed because the model doesn't have columns
    await User.boot()

    const model = new User()

    Notification.trap((notification) => {
      expect(notification).toEqual({ title: 'Notifiable.notify' })
      done()
    })

    await model.notify(getNotification(['database'], { title: 'Notifiable.notify' }))
  }).waitForDone()

  test('Notifiable.notifyLater', async ({ expect, getNotification }, done) => {
    expect.assertions(1)
    class User extends RoutesNotifications(BaseModel) {}
    // Boot is needed because the model doesn't have columns
    await User.boot()

    const model = new User()

    Notification.trap((notification) => {
      expect(notification).toEqual({ title: 'Notifiable.notifyLater' })
      done()
    })

    await model.notifyLater(getNotification(['database'], { title: 'Notifiable.notifyLater' }))
  }).waitForDone()
})
