<div align="center">
  <img src="https://github.com/verful/notifications/raw/master/.github/banner.png" width="1200px">
</div>


<div align="center">
  <h2><b>Adonis Notifications</b></h2>
  <p>Send notifications with ease</p>
</div>

<div align="center">

[![npm-image]][npm-url] [![license-image]][license-url] [![typescript-image]][typescript-url]

</div>


## **Pre-requisites**
The `@verful/notifications` package requires `@adonisjs/core >= 5.4.2`

Also, it relies on `@adonisjs/lucid >= 16.3.2` for database notifications and on `@adonisjs/mail >= 7.2.4` for mail notifications.

## **Setup**

Install the package from the npm registry as follows.

```
npm i @verful/notifications
# or
yarn add @verful/notifications
```

Next, configure the package by running the following ace command.

```
node ace configure @verful/notifications
```

## **Generating Notifications**
Notifications are represented by a simple class, generally stored in the `app/Notifications` directory. If you dont see the directory, dont worry, it will be created when you run the `make:notification` ace command.

> `node ace make:notification TestNotification`

The command will create a notification class in the `app/Notifications` directory. Each notification class contains a `via` method and any number of message builder methods, like `toMail` or `toDatabase`, that convert the notification to a message made for that channel.

## **Sending Notifications**

Notifications may be sent using the `notify` or the `notifyLater` methods of the `Notifiable` mixin, or using the `Notification` module.
 
### **Using the Notifiable Mixin**

First, apply the mixin on the model you are wanting to notify.

```typescript
import { BaseModel } from '@ioc:Adonis/Lucid/Orm'
import { compose } from '@ioc:Adonis/Core/Helpers'
import Notifiable from '@ioc:Verful/Notification/Mixin'

export default class User extends compose(BaseModel, Notifiable){
}
```

Then use the `notify` or the `notifyLater` methods to notify the model.

```typescript
import TestNotification from 'App/Notifications/TestNotification'

user.notify(new TestNotification())
// Uses a in-memory queue to send the notification
user.notifyLater(new TestNotification())
```

> Be aware that you should only have one notifiable model on your app, because adonis doesn't support polymorphic relations.


### **Using the Notification module**

You can also use the `Notification` module to send notifications. Sending notifications this way is useful when you need to send a notification to multiple notifiables, like a array of users.

```typescript
import Notification from '@ioc:Verful/Notification'

Notification.send(users, new TestNotification())
```

You can also delay notifications using the `sendLater` method. This method uses a in-memory queue to send the notifications.

```typescript
import Notification from '@ioc:Verful/Notification'

Notification.sendLater(users, new TestNotification())
```

## **Specifying Delivery Channels**

Every notification class has a `via` method that determines which channels will be used to deliver the notification.

> If you want to use other delivery channels, you can build your own.

The `via` method receives a `notifiable` instance, that is a instance of the class which the notification is being sent. You may use the `notifiable` to determine which channels to sent the notification to.

```typescript
class TestNotification implements NotificationContract {
  public via(notifiable: User){
    return notifiable.prefersEmail ? 'mail' : 'database'
  }
}
```

## **Delaying notifications**

Sending notifications can take some time, to ensure the notification doesn't block HTTP requests, you can use the `notifyLater` method of the `Notifiable` Mixin and the `sendLater` method of the `Notification` module to push notifications to a in-memory queue, ensuring that notifications will be sent after the http request ends.

## **Mail Notifications**

If you want to send a notification via e-mail, you should define a `toMail` method on the notification class. This method receives the `notifiable` entity and should return a [`BaseMailer`](https://github.com/adonisjs/mail/blob/develop/src/BaseMailer/index.ts) instance

```typescript
class TestMailer extends BaseMailer {
  constructor(private user: User){
    super()
  }

  public prepare(message){
    message
      .subject('Test email')
      .from('test@example.com')
      .to(this.user.email)
  }
}

class TestNotification implements NotificationContract {
  public toMail(notifiable: User){
    return new TestMailer(notifiable)
  }
}
```

> Mail notifications requires [@adonisjs/mail](https://github.com/adonisjs/mail)  >= 7.2.4

## **Database Notifications**

The `database` channel stores the notification in a database table. This table contain the notification, and a JSON object that describes the notification

> Database notifications requires [@adonisjs/lucid]() >=

You can querythe table to display the notifications in your UI. But, before you can do that, you need to create a table to store the notifications. You may use the `notifications:table` ace command to generate a migration with the correct table schema. 

```
node ace notifications:table

node ace migration:run
```

### **Sending Database Notifications**
If you want to store a notification in a database, you should define a `toDatabase` method on the notification class. This method receives the `notifiable` entity and should return a javascript object that can be transformed in JSON

```typescript
class TestNotification implements NotificationContract {
  public toDatabase(notifiable: User){
    return {
      title: `Hello, ${notifiable.email}, this is a test notification`
    }
  }
}
```

### **Accessing the notifications**
After notifications are stored, you can acess them from your notifiable model entities. The `Notifiable` mixin includes a `notifications` Lucid relationship that returns the notifications for that entity. You can use the notifications like any other Lucid relationship. By default, the `readNotifications` and `unreadNotifications` methods will sort the notifications using the `created_at` timestamp, with the most recent at the beginning.



```typescript
const user = User.findOrFail(1)

for(const notification of await user.readNotifications()){
  console.log(notification.data)
}
```

If you want to retrieve only the unread notifications, you may use the `unreadNotifications` method.

```typescript
const user = User.findOrFail(1)

for(const notification of await user.unreadNotifications()){
  console.log(notification.data)
}
```

> The notifications are normal Lucid Models, you can use anything that applies to a Lucid Model on them 

### **Marking notifications as read**
Typically, you will want to mark a notification as read when a user views it. The notification model provides a markAsRead method, which updates the read_at column on the notification's database record:

```typescript
const user = User.findOrFail(1)

for(const notification of await user.unreadNotifications()){
  await notification.markAsRead();
}
```

If you want to mark all notifications of a user as read, you can use the `markNotificationsAsRead` method of the `Notifiable` mixin

```typescript
const user = User.findOrFail(1)

await user.markNotificationsAsRead()
```

> There is also `markAsRead` and `markNotificationsAsUnread` methods to mark notifications as unread.

## **Custom Channels**

You may want to deliver notifications using other channels, for that, you can use any class that implements the `NotificationChannelContract`

```typescript
import { NotificationChannelContract } from '@ioc:Verful/Notification'

interface VoiceMessageContract {
  text: string
}

export default class VoiceChannel implements NotificationChannelContract {
  /**
   * Typing the notification argument guarantees type safety in the toChannel
   * method of the notification, in this case toVoice
   */
  public send(notification: VoiceMessageContract, notifiable: NotifiableModel){}
}
```

After the channel is created, you must extend the `Notification` module, you can use a preload or a provider to do this

```typescript
// start/notification.ts
import Notification from '@ioc:Verful/Notification'
import VoiceChannel from 'App/Channels/VoiceChannel'

Notification.extend('voice', () => new VoiceChannel())
```

Then you must setup the config and contract for your channel

```typescript
// config/notification.ts
{
  channels: {
    voice: {
      driver: 'voice'
    }
  }
}

// contracts/notification.ts
interface NotificationChannelsList {
  voice: {
    implementation: VoiceChannel
    config: {
      driver: 'voice'
    }
  }
}
```


[npm-image]: https://img.shields.io/npm/v/@verful/notifications.svg?style=for-the-badge&logo=npm
[npm-url]: https://npmjs.org/package/@verful/notifications "npm"

[license-image]: https://img.shields.io/npm/l/@verful/notifications?color=blueviolet&style=for-the-badge
[license-url]: LICENSE.md "license"

[typescript-image]: https://img.shields.io/badge/Typescript-294E80.svg?style=for-the-badge&logo=typescript
[typescript-url]:  "typescript"
