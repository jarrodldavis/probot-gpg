const getCommits = require('./get-commits')
const validateCommit = require('./validate-commit')
const reduceStatuses = require('./reduce-statuses')
const createStatus = require('./create-status')

module.exports = async context => {
  context.log.debug('Handling event')

  let status
  try {
    const commits = await getCommits(context)
    const statusChain = commits.map(commit => validateCommit(context, commit))
    status = reduceStatuses(context, statusChain)
  } catch (err) {
    context.log.error({ err }, 'An error occurred during validation')
    status = 'error'
  }

  try {
    await createStatus(context, status)
  } catch (err) {
    context.log.error({ err }, 'An error occurred during status creation')
  }

  context.log.debug('Event handled')
}
