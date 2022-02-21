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
} from '@ioc:Verful/Notification'

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

  constructor(app: ApplicationContract, private config: NotificationConfig) {
    super(app)
  }

  private async sendQueued(
    { channel, message, notifiable }: SendMessagePayload,
    cb: (error: null | any, response?: any) => void
  ) {
    try {
      await this.use(channel).send(message, notifiable, true)
      cb(null)
    } catch (error) {
      cb(error)
    }
  }

  public async send(
    notifiables: NotifiableModel | NotifiableModel[],
    notification: NotificationContract,
    deferred: boolean = false
  ): Promise<void> {
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

    for (const { channel, message, notifiable } of notifications) {
      deferred
        ? this.queue.push({ channel, message, notifiable })
        : await this.use(channel).send(message, notifiable, false)
    }
  }

  public async sendLater(
    notifiables: NotifiableModel | NotifiableModel[],
    notification: NotificationContract
  ) {
    return this.send(notifiables, notification, true)
  }

  protected createDatabase(config) {
    const DatabaseChannel = require('./Channels/Database').default
    return new DatabaseChannel(config)
  }

  protected createMail(config) {
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
