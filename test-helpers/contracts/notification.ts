declare module '@ioc:Verful/Notification' {
  interface NotificationChannelsList {
    database: NotificationChannels['database']
    mail: NotificationChannels['mail']
  }
}
