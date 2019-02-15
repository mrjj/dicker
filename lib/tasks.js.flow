const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
const toposort = require('toposort');
const { isEmpty } = require('./utils/types');
const { forceArray } = require('./utils/lists');
const { formatBuildArgs } = require('./utils/cli');
const { error } = require('./utils/logger');
const normalizeDockerRef = require('./normalize_docker_ref');
const C = require('./constants');

/**
 *
 * @param taskObj
 * @param manifest
 * @returns {Object}
 */
const normalizeTask = async (taskObj, manifest) => {
  let { task, tag, skip, type, dependsOn, status, context, dockerfile } = taskObj;

  // Defaults
  status = status || C.DEFAULT_TASK_STATUS;
  type = type || C.DEFAULT_TASK_TYPE;
  skip = !!skip;
  dockerfile = dockerfile || null;
  context = context || null;

  status = (skip && (status === C.TASK_STATUS.PENDING)) ? C.TASK_STATUS.SKIPPED : status;
  dependsOn = forceArray(isEmpty(forceArray(dependsOn)) ? C.ROOT_TASK.task : dependsOn);

  // Common checks
  if (!C.TASK_TYPES[type]) {
    error(`Unknown task type: "${type}", exiting with code 1`);
    status = C.TASK_STATUS.FAILED;
  }

  if (!skip) {
    if (type === C.TASK_TYPES.DOCKER) {
      task = task || tag;
      tag = tag || task;
      if (tag) {
        try {
          tag = await normalizeDockerRef(tag);
          tag = tag.replace(C.DEFAULT_DOCKER_PUBLIC_REGISTRY, '');
        } catch (e) {
          error(e.message);
          tag = null;
          status = C.TASK_STATUS.FAILED;
        }
      }

      if (dockerfile) {
        if (!path.isAbsolute(dockerfile)) {
          dockerfile = path.join(path.dirname(manifest), dockerfile);
          if (fs.existsSync(dockerfile)) {
            if (fs.statSync(dockerfile).isDirectory()) {
              dockerfile = path.join(dockerfile, C.DEFAULT_DOCKERFILE_NAME);
            }
            context = context || path.dirname(dockerfile);
            if (context && (!path.isAbsolute(context)) && manifest) {
              context = `${path.join(path.dirname(manifest), context)}`;
            }
          }
        }
      }
    }
  }
  // Common post-checks
  if (!task) {
    error(`No "task" or "tag" params defined for ${JSON.stringify(taskObj)} so can't define task name`);
    task = C.DEAD_TASK_NAME;
    status = C.TASK_STATUS.FAILED;
  }
  return {
    ...taskObj,
    dependsOn,
    dockerfile,
    context,
    skip,
    status,
    tag,
    task,
    type,
  };
};


const sortTasks = (tasks) => {
  const tasksDict = { [C.ROOT_TASK.task]: C.ROOT_TASK };
  const existingTasksDict = {};
  const extrapolatedTasks = [];
  tasks.forEach((taskObj) => {
    if (existingTasksDict[taskObj.task]) {
      return;
    }
    taskObj.task.split(':').reduce(
      (a, o) => ([
        ...a,
        a.length === 0 ? o.toLowerCase() : [(a.slice(-1)[0] || ''), o.toLowerCase()].join(':'),
      ]),
      [],
    ).forEach((dt) => {
      if (!existingTasksDict[dt]) {
        const t = (taskObj.task === dt) ? taskObj : {
          task: dt,
          type: C.TASK_TYPES.CONTROL,
          skip: false,
          dependsOn: [taskObj.task],
        };
        extrapolatedTasks.push(t);
      }
    });
  });
  const tasksEdges = [];
  extrapolatedTasks.forEach((taskObj) => {
    const { task, dependsOn } = taskObj;
    if (task === C.ROOT_TASK.task) {
      error(`Don't use reserved root task name in manifests: "${C.ROOT_TASK.task}"`);
      shell.exit(1);
    }
    if (!tasksDict[task]) {
      tasksDict[task] = taskObj;
      dependsOn.forEach((dependsOnTaskName) => {
        tasksEdges.push([dependsOnTaskName, task]);
      });
    }
  });
  return toposort(tasksEdges).map((image) => {
    if (!tasksDict[image]) {
      error(`Can't find dependency: "${image}"`);
    }
    return tasksDict[image];
  }).filter(x => x);
};


/**
 *
 * @param taskObj
 * @param manifest
 * @param extraArgsStr
 * @returns {string}
 */
const makeTaskCommand = (taskObj, manifest, extraArgsStr) => {
  const { type, tag, args, dockerfile, context, skip, task } = taskObj;
  if (type === C.TASK_TYPES.CONTROL) {
    return null;
  }
  const dockerfileCmd = `-f ${dockerfile} `;
  const buildArgs = formatBuildArgs(args);

  const imageNameWithTag = `-t ${tag || C.DEFAULT_IMAGE_NAME}`;
  let commandParts;


  if (skip) {
    commandParts = ['echo', `'Task "${task}" is skipped'`];
  } else {
    commandParts = [
      'docker',
      'build',
      ...buildArgs,
      dockerfileCmd,
      imageNameWithTag,
      extraArgsStr,
      context,
    ];
  }

  return commandParts.filter(x => !!x).join(' ');
};


module.exports = {
  normalizeTask,
  sortTasks,
  makeTaskCommand,
};
