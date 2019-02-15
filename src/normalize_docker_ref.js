const path = require('path');
const GoNode = require('gonode');

const NormalizeDockerRef = ref => new Promise((resolve, reject) => {
  const go = new GoNode.Go({ path: `${path.dirname(__filename)}/normalize_docker_ref.gonode.go` });
  go.init((err) => {
    if (err) {
      return reject(new Error(`Initialization failed ${err}`));
    }
    // gonode emits error events upon external (Go) or internal parser (JSON) errors
    go.on('error', goErr => reject(new Error(`${'Error from gonode!\n'
    + 'Is it from the internal parser? '}${
      goErr.parser ? 'yes' : 'no'}\nActual error: \n${
      goErr.data.toString()}`)));

    // Execute command #1 which we have constructed to timeout
    return go.execute(
      { ref },
      (result, response) => {
        if (result.timeout) {
          // Execution time may exceed the user set or default time limit for commands
          reject(new Error('The \'delay me\' command timed out!'));
        } else if (!result.ok) {
          reject(new Error(`Can't normalize Docker reference: "${ref}"`));
        } else {
          resolve(response.ref);
        }
        go.close();
      },
      { commandTimeoutSec: 10 },
    ); // We specifically set this command to timeout after 1 seconds
  });
});

module.exports = NormalizeDockerRef;
