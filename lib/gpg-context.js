const Context = require('probot/lib/context')

module.exports = class GpgEventContext extends Context {
  constructor (log, context) {
    super(context, context.github)

    this.log = log.child({
      event: this.event,
      action: this.payload.action,
      repo: this.payload.repository.full_name,
      number: this.payload.number,
      webhook: this.id
    })
  }
}
