import { NotifiableMixin } from '@ioc:Verful/Notification'
import { compose } from '@poppinss/utils/build/helpers'

import HasDatabaseNotifications from './HasDatabaseNotifications'
import RoutesNotifications from './RoutesNotifications'

/**
 * This trait is used to add the hability to notify a model using any channel
 */
function Notifiable(tableName = 'notifications'): NotifiableMixin {
  return (superclass) => {
    return class extends compose(
      superclass,
      RoutesNotifications,
      HasDatabaseNotifications(tableName)
    ) {}
  }
}

export default Notifiable
