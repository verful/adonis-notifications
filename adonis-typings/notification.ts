declare module '@ioc:Verful/Notification' {
  import type { ManagerContract } from '@poppinss/manager'
  import { DateTime } from 'luxon'
  import { HasMany, LucidModel, LucidRow } from '@ioc:Adonis/Lucid/Orm'
  import { NormalizeConstructor } from '@ioc:Adonis/Core/Helpers'

  import { BaseMailer, MailersList } from '@ioc:Adonis/Addons/Mail'
  import { ApplicationContract } from '@ioc:Adonis/Core/Application'

  export interface NotificationChannelContract {
    send(notification: any, notifiable: NotifiableModel, ...extras: any[]): Promise<any>
  }

  type NotificationContractChannels = {
    [Key in keyof NotificationChannelsList as `to${Capitalize<Key>}`]?: (
      notifiable: NotifiableModel
    ) => Parameters<NotificationChannelsList[Key]['implementation']['send']>[0]
  }

  export type MessageType = Parameters<
    NotificationChannelsList[keyof NotificationChannelsList]['implementation']['send']
  >[0]

  /**
   * New channels should use declaration merging to extend this interface with
   * a optional toChannel method that returns the needed payload to send a
   * message with the channel.
   */
  export interface NotificationContract extends NotificationContractChannels {
    via(
      notifiable: NotifiableModel
    ): keyof NotificationChannelsList | Array<keyof NotificationChannelsList>
  }

  export interface NotifiableModel extends LucidRow {
    id: number
    notifications: HasMany<DatabaseNotificationModel>
    readNotifications(): Promise<DatabaseNotificationRow[]>
    unreadNotifications(): Promise<DatabaseNotificationRow[]>
    markNotificationsAsRead(this: NotifiableModel): Promise<void>
    markNotificationsAsUnread(this: NotifiableModel): Promise<void>
    notify(this: NotifiableModel, notification: NotificationContract): Promise<void>
    notifyLater(this: NotifiableModel, notification: NotificationContract): Promise<void>
  }

  export interface NotifiableMixin {
    <T extends NormalizeConstructor<LucidModel>>(superclass: T): {
      new (...args: any[]): NotifiableModel & LucidRow
    }
  }

  export interface DatabaseNotificationModel extends Omit<LucidModel, 'new'> {
    new (): DatabaseNotificationRow
  }

  export interface DatabaseNotificationRow extends LucidRow {
    id: number
    data: Record<string, any>
    notifiableId: number
    markAsRead(): Promise<void>
    markAsUnread(): Promise<void>
    read: boolean
    unread: boolean
    readAt: DateTime | null
    createdAt: DateTime
    updatedAt: DateTime
  }

  export interface MailChannelConfig {
    driver: 'mail'
    mailer: keyof MailersList
  }

  export interface DatabaseChannelConfig {
    driver: 'database'
  }

  export interface NotificationChannels {
    database: {
      implementation: DatabaseChannelContract
      config: DatabaseChannelConfig
    }
    mail: {
      implementation: MailChannelContract
      config: MailChannelConfig
    }
  }

  export interface DatabaseChannelContract extends NotificationChannelContract {
    send(notification: Record<string, any>, notifiable: NotifiableModel): Promise<void>
  }

  export interface MailChannelContract {
    send(
      notification: InstanceType<typeof BaseMailer>,
      notifiable?: NotifiableModel,
      deferred?: boolean
    ): Promise<void>
  }

  /**
   * Using declaration merging, one must extend this interface.
   * --------------------------------------------------------
   * MUST BE SET IN THE USER LAND.
   * --------------------------------------------------------
   */
  export interface NotificationChannelsList {}

  export type NotificationConfig = {
    channel: keyof NotificationChannelsList
    channels: {
      [P in keyof NotificationChannelsList]: NotificationChannelsList[P]['config']
    }
    notificationsTable?: string
  }

  export interface NotificationManager
    extends ManagerContract<
      ApplicationContract,
      NotificationChannelContract,
      NotificationChannelContract,
      { [P in keyof NotificationChannelsList]: NotificationChannelsList[P]['implementation'] }
    > {
    send(
      notifiables: NotifiableModel | NotifiableModel[],
      notification: NotificationContract,
      deferred?: boolean
    ): Promise<void>
    sendLater(
      notifiables: NotifiableModel | NotifiableModel[],
      notification: NotificationContract
    ): Promise<void>
  }

  const Notification: NotificationManager
  const Notifiable: NotifiableMixin
  export { Notifiable, Notification }
}
