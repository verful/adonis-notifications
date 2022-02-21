declare module '@ioc:Adonis/Core/Application' {
  import { Notifiable, Notification } from '@ioc:Verful/Notification'

  export interface ContainerBindings {
    'Verful/Notification': typeof Notification
    'Verful/Notification/Mixin': typeof Notifiable
  }
}
