import type {
  NotifiableModel,
  NotificationChannelContract,
  TrapCallback,
} from '@ioc:Verful/Notification'

class FakeChannel implements NotificationChannelContract {
  constructor(private listener: TrapCallback) {}

  public async send(data: Record<string, any>, to: NotifiableModel) {
    await this.listener(data, to)
  }
}

export default FakeChannel
