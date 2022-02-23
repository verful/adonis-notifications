import { Manager } from '@poppinss/manager'
import { string } from '@poppinss/utils/build/helpers'
import fastq from 'fastq'

import type { ApplicationContract } from '@ioc:Adonis/Core/Application'
import {
  NotificationContract,
  NotifiableModel,
  NotificationChannelContract,
  NotificationChannelsList,
  NotificationConfig,
  NotificationManager,
  QueueMonitorCallback,
  TrapCallback,
  ResponseType,
} from '@ioc:Verful/Notification'
import { ManagerConfigValidator } from '@poppinss/utils'

interface SendMessagePayload {
  channel: keyof NotificationChannelsList
  message: any
  notifiable: NotifiableModel
}

export default class Notification
  extends Manager<
    ApplicationContract,
    NotificationChannelContract,
    NotificationChannelContract,
    { [P in keyof NotificationChannelsList]: NotificationChannelsList[P]['implementation'] }
  >
  implements NotificationManager
{
  private queue = fastq(this, this.sendQueued, 10)

  public singleton = true

  private fakeChannel?: NotificationChannelContract

  private queueMonitor: QueueMonitorCallback = (error) => {
    if (error) {
      this.logger.error(
        {
          notification: error.notification,
          message: error.message,
        },
        'Unable to deliver email'
      )
    }
  }

  public emitter = this.app.container.use('Adonis/Core/Event')
  public logger = this.app.container.use('Adonis/Core/Logger')

  constructor(private app: ApplicationContract, private config: NotificationConfig) {
    super(app)
    this.validateConfig()
  }

  private validateConfig() {
    const validator = new ManagerConfigValidator(this.config, 'notification', 'config/notification')
    validator.validateDefault('channel')
    validator.validateList('channels', 'channel')
  }

  private async sendQueued(
    { channel, message, notifiable }: SendMessagePayload,
    cb: (error: null | any, response?: any) => void
  ) {
    try {
      const response = await this.use(channel).send(message, notifiable, true)
      this.emitter.emit('notification:sent', { notification: message, notifiable, channel })
      cb(null, { message, response })
    } catch (error) {
      error.notification = message
      cb(error)
    }
  }

  public async send(
    notifiables: NotifiableModel | NotifiableModel[],
    notification: NotificationContract,
    deferred: boolean = false
  ): Promise<ResponseType[] | void> {
    notifiables = Array.isArray(notifiables) ? notifiables : [notifiables]

    const notifications = notifiables
      .map((notifiable) => {
        const channels = [notification.via(notifiable)].flat()
        return channels.map((channel) => {
          const message = notification[`to${string.capitalCase(channel)}`](notifiable)
          return { channel, message, notifiable }
        })
      })
      .flat()

    const responses: ResponseType[] = []

    for (const { channel, message, notifiable } of notifications) {
      if (this.fakeChannel) {
        this.fakeChannel.send(message, notifiable)
        continue
      }

      if (deferred) {
        this.queue.push({ channel, message, notifiable }, this.queueMonitor as any)
        continue
      }

      const response = await this.use(channel).send(message, notifiable)
      responses.push(response)
      this.emitter.emit('notification:sent', { notification: message, notifiable, channel })
    }

    return responses
  }

  public trap(callback: TrapCallback) {
    const FakeChannel = require('./Channels/Fake').default
    this.fakeChannel = new FakeChannel(callback)
  }

  public restore() {
    this.fakeChannel = undefined
  }

  public monitorQueue(callback: QueueMonitorCallback): void {
    this.queueMonitor = callback
  }

  public async sendLater(
    notifiables: NotifiableModel | NotifiableModel[],
    notification: NotificationContract
  ) {
    this.send(notifiables, notification, true)
  }

  protected createDatabase(_, config) {
    const DatabaseChannel = require('./Channels/Database').default
    return new DatabaseChannel(config)
  }

  protected createMail(_, config) {
    const MailChannel = require('./Channels/Mail').default
    return new MailChannel(config)
  }

  protected getDefaultMappingName() {
    return this.config.channel
  }

  protected getMappingConfig(name: string) {
    return this.config.channels[name]
  }

  protected getMappingDriver(name: string) {
    const config = this.getMappingConfig(name)
    return config && config.driver
  }
}
