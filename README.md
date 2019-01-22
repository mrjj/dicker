# dicker
Dicker - Trivial docker build tool

Installation:

```bash
$ npm install dicker -g
```
Example config:

```json
[
  {
    "task": "node-test",
    "image": "dicker/node-test",
    "dockerfile": "node-test/Dockerfile",
    "tag": "latest",
    "skip": false,

    "description": "This message shows that your installation appears to be working correctly.",
    "license": "Unlicense",
    "args": {
      "BUILD_FROM": "scratch"
    }
  }
]

```

That will produce `dicker/node-test:latest` container
