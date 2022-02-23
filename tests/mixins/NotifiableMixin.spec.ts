import { test } from '@japa/runner'
import { BaseModel } from '@ioc:Adonis/Lucid/Orm'
import Notifiable from '../../src/Mixins/Notifiable'

const Mixin = Notifiable('notifications')

test.group('NotifiableMixin', () => {
  test('Mixin gets applied succesfuly', ({ expect }) => {
    class Model extends Mixin(BaseModel) {}

    expect(Model.$relationsDefinitions.get('notifications')!.relationName).toBe('notifications')
    expect(Model.prototype.markNotificationsAsRead).toEqual(expect.any(Function))
    expect(Model.prototype.markNotificationsAsUnread).toEqual(expect.any(Function))
    expect(Model.prototype.unreadNotifications).toEqual(expect.any(Function))
    expect(Model.prototype.readNotifications).toEqual(expect.any(Function))
    expect(Model.prototype.notify).toEqual(expect.any(Function))
    expect(Model.prototype.notifyLater).toEqual(expect.any(Function))
  })
})
