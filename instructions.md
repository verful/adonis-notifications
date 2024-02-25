The package has been configured successfully.

To use it simply import the Notification provider from `@ioc:Verful/Notification`
and use the `Notification.send` or `Notification.sendLater` methods.

You can also use the `@ioc:Verful/Notification/Mixin` to add notification
capabilities to a model, be aware that because Adonis doesn't support polymorphic
relations you should only have one model using this mixin.

To create notifications you can use the `make:notification NotificationName`
command.
