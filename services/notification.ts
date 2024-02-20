import app from '@adonisjs/core/services/app'

// By the time this file is imported, the app is already booted
// eslint-disable-next-line import/no-mutable-exports
let notification: any

await app.booted(async () => {
  notification = await app.container.make('notification')
})

export { notification as default }
