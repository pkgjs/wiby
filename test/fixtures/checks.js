module.exports = [
  {
    status: 'queued',
    conclusion: null,
    name: 'build (1.x)'
  }, {
    status: 'completed',
    conclusion: 'success',
    name: 'build (2.x)'
  }, {
    status: 'completed',
    conclusion: 'failure',
    name: 'build (3.x)'
  }
]

module.exports.expected = [['build (1.x)', 'queued'], ['build (2.x)', 'success'], ['build (3.x)', 'failure']]
