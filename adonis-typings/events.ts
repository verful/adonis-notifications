import { NotificationEventData } from '@ioc:Verful/Notification'

declare module '@ioc:Adonis/Core/Event' {
  export interface EventsList {
    'notification:sent': NotificationEventData
  }
}
