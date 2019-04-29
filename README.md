# Dicker

Trivial docker build tool

Version: `2.9.3`

[![CircleCI](https://circleci.com/gh/mrjj/dicker/tree/master.svg?style=svg)](https://circleci.com/gh/mrjj/dicker/tree/master)

_TODO: verify documentation!_ 

## Installation

is trivial:

```bash
$ npm install dicker -g
```

## Build configuration

Example build configuration file is quite trivial too:

```json
[
  {
    "tagAndDigest": "basic-hello-world:0.0.1"
  },
  {
    "tagAndDigest": "more-basic-hello-world:latest"
  },
  {
    "task": "vanilla-hello-world",
    "tags": ["hello-world", "hello-world:latest"]
  },
  {
    "task": "advanced-hello-world",
    "skip": true
  },
  {
    "task": "advanced-node-test",
    "dependsOn": ["basic-hello-world:0.0.1", "more-basic-hello-world", "vanilla-hello-world"],
    "dockerfile": "node-test/Dockerfile",
    "tagAndDigest": "advanced-node-test:latest",
    "context": "./myartifacts/",
    "description": "This message shows that your installation appears to be working correctly.",
    "license": "MIT",
    "args": {
      "BUILD_FROM": "scratch"
    }
  }
]
```

Define as many containers as you want placing config objects to root array.

Having config like this (or in `.yaml`/`.yml` format) somewhere you are free to run following command to start building process:

```
$ dicker /var/manifestfolder/mybuild.json
```

`Dicker` will go to the folder our example `mybuild.json` file (build manifest) is located and then will apply simple paths resolution principles:

- Any absolute path will be left as is and for `hello-world` in example it will be just

  - `/home/dcheney/dockerfiles/Dockerfile` -> `/home/dcheney/dockerfiles/Dockerfile`

- All relative paths will be resolved starting from folder `mybuild.json` is located, for current example it will be: `/var/manifestfolder/` and it does not matter from where you have started process so all relative paths that are defined in `mybuild.json` will be start from its folder.
  
  - `./node-test/Dockerfile` -> `/var/manifestfolder/node-test/Dockerfile`
  - `./myartifacts/` -> `/var/manifestfolder/node-test/`

- Pats syntax may be adjusted automatically (if its possible) to your current OS format whenever which is used in config till you will define something really OS specific like drive letter.

- If no `"dockerfile"` is defined manifest file folder will be used to lookup it so for `basic-hello-world` it will be inferred as `/var/manifestfolder/Dockerfile`.

The resulting container image will be marked as `dicker/node-test:0.1.5`.

Build order will be preserved as you have defined it in build manifest but could be changed automatically according to `"dependsOn": [ "other-task-name-1", "other-task-name-2" ]` or `"dependsOn": "other-task-name"` build task directive, that will be resolved with minimal build order impact automatically.

`"args": { "KEY": "value" }` directive will be used as Docker [`--build-arg KEY=value`](https://docs.docker.com/engine/reference/commandline/build/#set-build-time-variables---build-arg) parameters that should have respecting `ARG KEY=` part in your `Dockerfile` (pay attention to doc section describing their scope and default params, sometimes its not trivial)

If you have a lot of containers in single manifest you could use `"skip": false` flag to exclude some of them from the run, otherwise all non-skipped will be rebuilt (using Docker cache by default) whenever do you have them already or not.

Build report output is supposed to be produced in touch with build process, to be easy human- and machine- readable and include some small solutions related to problems of parallel runs output multiplexing in single channel as well as mitigation of everyday log-watching boredom.

Task name "task" parameter is considered as an alias of "tagAndDigest".

### Portable Dicker

You are free to build redistributable Dicker binaries for Linux, MacOS and (maybe) Windows by running:

```
$ npm run build
```

and then check `./build/` folder: there will be 3 files having 20+ - 30+ megabytes size and targeted different OS. For *NIX systems they should be already marked as executables. Any of them supposed to be portable without any dependencies.

Also you could use dicker programmatically doing like: `import runDicker from 'dicker'; run('./build.json')`, importable object start parameters are planned to be extended in future.


### Naming

Initially i would like idea to use `Docker` as the tool name.

But it happened to be impossible due to:

* `Docker` name is already taken

* I found meaning of `Docker` too much disturbing for software utility [according to Encyclopedia][20]. So i'm not quite sure about correctness of quoting this meaning on technical site with no content rating restriction disclaimer so i decided to choose some more neutral name like __`Dicker`__ what [according to Encyclopedia][30] means:
   
  > One who dicks around. A person who is procrastinating or otherwise doing something other than what they are supposed to be doing.

what is complete and quite precise description of what i'm usually doing including (but not limited by) right now. 

According to perfectly dumb luck `Dicker` name happened to be free even on [`npmjs.org`][40] 


### Bullshit section about triviality and other open-source container tools worth mention

If you find this tool quite naive and limited then check out yet another [deployment / provisioning / orchestrating / virtualisation-managing / coffee-making / bullshit-bingoing][10] tool that i worked on some time ago (with extremely talented tech guys who definitely knows what this thing do much better than me). 

Anyway [Fuel][10] still performing quite fine for even [100 x DC][60] scale and as i checked it up managing up to 1000 hardware units OpenStack (and any other possible way orchestrated) clusters (don't forget to preserve 1TB volume for logs). 

On practice whenever i'm talking about it delivering you really seamless experience like `Windows ME Edition` setup you just making some clicks seeng progress-bar and its done, but vendor RAID/Network drivers sometimes might go crazy but if you just will press `next` on network setup (DC/cross-DC/rack-wise L4-L7 SDN) it should be fine in most cases. 

In all other cases of misfortune its highly recommended to call Batman and then deal with problem yourself.

I think this indirect way I've explained why dumb and naive tools that just building containers are fine :)

But it worth to mention that in case you're just starting your way in wonderful world of clouds, infrastructure management and virtualisation (and dumb tools with silly names could be source of unmeasurable risk of professional disrespect) you may want to start with deploying some stuff that Google use to manage its public cloud for your homepage site or pile of hardware in your cellar (or another 100 of DCs you had to deploy yesterday) you may want to use [KubeSpray][50]. And KubeSpray doing all this so well that its kinda looks like thing easy to do and manage. 

Also i want to share  [|| Virtualisation core + Docker/Vagrant][100] integration tooling i use myself for everyday work. I really like full-power || Hypervisor in most cases its much more powerful and stable then its reduced form that running Docker on Mac out-of-the box. Its super-solid about how mounts are working, and will not distract you from making your own network over/underlay :)     


### Owl

```
   ◯  .       .        .           .     *     .
 .  .     .      ___---===(OvO)===---___  .      °     *
                  .              
,~^~,   .      .     ◯         .            .      ,~^~^^                
    ~^\$~^~~^#*~-^\_  __ _ _ _ _ ____/*-~^~~^^~^##~^~^
                  = * - _-  =_- . - 
```

[10]: https://wiki.openstack.org/wiki/Fuel
[20]: https://www.urbandictionary.com/define.php?term=docker 
[30]: https://www.urbandictionary.com/define.php?term=dicker 
[40]: https://www.npmjs.com/package/dicker
[50]: https://github.com/kubernetes-sigs/kubespray
[60]: https://www.att.com/
[100]: https://github.com/Parallels/docker-machine-parallels
