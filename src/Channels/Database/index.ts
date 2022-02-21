import type {
  DatabaseChannelConfig,
  DatabaseChannelContract,
  NotifiableModel,
} from '@ioc:Verful/Notification'

class DatabaseChannel implements DatabaseChannelContract {
  constructor(_config: DatabaseChannelConfig) {}

  public async send(data: Record<string, any>, to: NotifiableModel) {
    await to.related('notifications').create({
      data,
    })
  }
}

export default DatabaseChannel
