declare module '@ioc:Verful/Notification/Mixins' {
  import {
    HasDatabaseNotificationsMixin,
    NotifiableMixin,
    RoutesNotificationsMixin,
  } from '@ioc:Verful/Notification'

  const Notifiable: (tableName: string) => NotifiableMixin
  const HasDatabaseNotifications: (tableName: string) => HasDatabaseNotificationsMixin
  const RoutesNotifications: RoutesNotificationsMixin

  export { Notifiable, HasDatabaseNotifications, RoutesNotifications }
}
