import { test } from '@japa/runner'
import NotificationsManager from '../src/Notification'
import HasDatabaseNotifications from '../src/Mixins/HasDatabaseNotifications'
import Notifiable from '../src/Mixins/Notifiable'
import RoutesNotifications from '../src/Mixins/RoutesNotifications'

test.group('NotificationsProvider', () => {
  test('Bindings registered correctly', ({ expect, app }) => {
    expect(app.container.resolveBinding('Verful/Notification')).toBeInstanceOf(NotificationsManager)
    expect(app.container.resolveBinding('Verful/Notification/Mixins')).toStrictEqual({
      Notifiable: Notifiable,
      HasDatabaseNotifications: HasDatabaseNotifications,
      RoutesNotifications: RoutesNotifications,
    })
  })
})
