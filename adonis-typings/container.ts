declare module '@ioc:Adonis/Core/Application' {
  import Notification from '@ioc:Verful/Notification'
  import {
    Notifiable,
    RoutesNotifications,
    HasDatabaseNotifications,
  } from '@ioc:Verful/Notification/Mixins'
  export interface ContainerBindings {
    'Verful/Notification': typeof Notification
    'Verful/Notification/Mixins': {
      Notifiable: typeof Notifiable
      RoutesNotifications: typeof RoutesNotifications
      HasDatabaseNotifications: typeof HasDatabaseNotifications
    }
  }
}
