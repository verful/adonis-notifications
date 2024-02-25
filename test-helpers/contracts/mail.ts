declare module '@ioc:Adonis/Addons/Mail' {
  interface MailersList {
    smtp: MailDrivers['smtp']
  }
}
