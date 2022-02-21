import Mail, { BaseMailer } from '@ioc:Adonis/Addons/Mail'
import { MailChannelConfig, MailChannelContract, NotifiableModel } from '@ioc:Verful/Notification'

class MailChannel implements MailChannelContract {
  constructor(private config: MailChannelConfig) {}

  public async send(
    message: InstanceType<typeof BaseMailer>,
    _notifiable: NotifiableModel,
    deferred: boolean = false
  ) {
    message.mailer = Mail.use(this.config.mailer)
    console.log(deferred)
    if (deferred) {
      await message.sendLater()
    } else {
      await message.send()
    }
  }
}

export default MailChannel
