declare module '@ioc:Verful/Notification' {
  import type { ManagerContract } from '@poppinss/manager'
  import { DateTime } from 'luxon'
  import { HasMany, LucidModel, LucidRow } from '@ioc:Adonis/Lucid/Orm'
  import { NormalizeConstructor } from '@ioc:Adonis/Core/Helpers'

  import { BaseMailer, MailersList } from '@ioc:Adonis/Addons/Mail'
  import { ApplicationContract } from '@ioc:Adonis/Core/Application'

  export interface NotificationChannelContract {
    send(notification: any, notifiable: NotifiableType, ...extras: any[]): Promise<any>
  }

  type ChannelParams = Parameters<
    NotificationChannelsList[keyof NotificationChannelsList]['implementation']['send']
  >

  export type MessageType = ChannelParams[0]

  export type NotifiableType = ChannelParams[1]

  export type ResponseType = Awaited<
    ReturnType<NotificationChannelsList[keyof NotificationChannelsList]['implementation']['send']>
  >

  type NotificationContractChannels = {
    [Key in keyof NotificationChannelsList as `to${Capitalize<Key>}`]?: (
      notifiable: NotifiableModel
    ) => Parameters<NotificationChannelsList[Key]['implementation']['send']>[0]
  }

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

  export interface RoutesNotificationsModel extends LucidRow {
    notify(this: this, notification: NotificationContract): Promise<void>
    notifyLater(this: this, notification: NotificationContract): Promise<void>
  }

  export interface RoutesNotificationsMixin {
    <T extends NormalizeConstructor<LucidModel>>(superclass: T): T & {
      new (...args: any[]): LucidRow & RoutesNotificationsModel
    }
  }

  export interface HasDatabaseNotificationsModel extends LucidRow {
    notifications: HasMany<DatabaseNotificationModel>
    readNotifications(): Promise<DatabaseNotificationRow[]>
    unreadNotifications(): Promise<DatabaseNotificationRow[]>
    markNotificationsAsRead(this: this): Promise<void>
    markNotificationsAsUnread(this: this): Promise<void>
  }

  export interface HasDatabaseNotificationsMixin {
    <T extends NormalizeConstructor<LucidModel>>(superclass: T): T & {
      new (...args: any[]): LucidRow & HasDatabaseNotificationsModel
    }
  }

  export interface NotifiableModel
    extends RoutesNotificationsModel,
      HasDatabaseNotificationsModel {}

  export interface NotifiableMixin {
    <T extends NormalizeConstructor<LucidModel>>(superclass: T): T & {
      new (...args: any[]): LucidRow & NotifiableModel
    }
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

  export interface DatabaseChannelContract {
    send(
      notification: Record<string, any>,
      notifiable: HasDatabaseNotificationsModel
    ): Promise<void>
  }

  export interface MailChannelContract {
    send(
      notification: InstanceType<typeof BaseMailer>,
      notifiable: RoutesNotificationsModel,
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
  }

  export type NotificationEventData = {
    notification: MessageType
    notifiable: NotifiableType
    channel: keyof NotificationChannelsList
  }

  export type TrapCallback = (notification: MessageType, notifiable: NotifiableType) => any

  export type QueueMonitorCallback = (
    error?: Error & { notification: MessageType },
    response?: {
      message: MessageType
      response: ResponseType
    }
  ) => void

  export interface NotificationManager
    extends ManagerContract<
      ApplicationContract,
      NotificationChannelContract,
      NotificationChannelContract,
      { [P in keyof NotificationChannelsList]: NotificationChannelsList[P]['implementation'] }
    > {
    send(
      notifiables: NotifiableType | NotifiableType[],
      notification: NotificationContract,
      deferred?: boolean
    ): Promise<void | ResponseType[]>
    sendLater(
      notifiables: NotifiableType | NotifiableType[],
      notification: NotificationContract
    ): Promise<void>
    trap(callback: TrapCallback): void
    restore(): void
    monitorQueue(callback: QueueMonitorCallback): void
  }

  const Notification: NotificationManager

  export default Notification
}
