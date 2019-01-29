# dicker
Dicker - Trivial docker build tool

Installation is trivial:

```bash
$ npm install dicker -g
```
Example config is trivial too:

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

That will produce `dicker/node-test:latest` container.

### Naming

Initially i would like idea to use `Docker` as the tool name.

But it happened to be impossible due to:

* `Docker` name is already taken

* I found meaning of `Docker` too much disturbing for software utility [according to Encyclopedia][20]. So i'm not quite sure about correctness of quoting this meaning on technical site with no content rating restriction disclaimer so i decided to choose some more neutral name like __`Dicker`__ what [according to Encyclopedia][30] means:
   
  > One who dicks around. A person who is procrastinating or otherwise doing something other than what they are supposed to be doing.

what is complete and quite precise description of what i'm usually doing including (but not limited by) right now. 

According to perfectly dumb luck `Dicker` name happened to be free even on [`npmjs.org`][40] 

### Disclaimers and other good open-source projects

If you find this tool quite naive and limited then check out yet another [deployment / provisioning / orchestrating / virtualisation-managing / coffee-making / bullshit-bingoing][10] tool that i worked on some time ago (with extremely talented tech guys who definitely knows what this thing do much better than me). 

Anyway [Fuel][10] still performing quite fine for even [100 x DC][60] scale and as i checked it up managing up to 1000 hardware units OpenStack (and any other possible way orchestrated) clusters (don't forget to preserve 1TB volume for logs). 

On practice whenever i'm talking about it delivering you really seamless experience like `Windows ME Edition` setup you just making some clicks seeng progress-bar and its done, but vendor RAID/Network drivers sometimes might go crazy but if you just will press `next` on network setup (DC/cross-DC/rack-wise L4-L7 SDN) it should be fine in most cases. 

In all other cases of misfortune its highly recommended to call Batman and then deal with it yourself.

I think this indirect way I've explained why dumb and naive tools that just building containers are fine :)

But it worth to mention that in case you're just starting your way in wonderful world of clouds, infrastructure management and virtualisation (and dumb tools with silly names could be source of unmeasurable risk of professional disrespect) you may want to start with deploying some stuff that Google use to manage its public cloud for your homepage site or pile of hardware in your cellar (or another 100 of DCs you had to deploy yesterday) you may want to use [KubeSpray][50]. And KubeSpray doing all this so well that its kinda looks like thing easy to do and manage. 

Also i want to share  [|| Virtualisation core + Docker/Vagrant][100] integration tooling i use myself for everyday work. I really like full-power || Hypervisor in most cases its much more powerful and stable then its reduced form that running Docker on Mac out-of-the box. Its super-solid about how mounts are working, and will not distract you from making your own network over/underlay :)     

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
