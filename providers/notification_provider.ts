import type { ApplicationService } from '@adonisjs/core/types'

export default class NotificationProvider {
  constructor(protected app: ApplicationService) {}

  register() {}

  async boot() {}
}
