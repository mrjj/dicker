const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
const toposort = require('toposort');
const { isEmpty } = require('./utils/types');
const { promiseMap, forceArray } = require('./utils/lists');
const { formatArgs, formatBuildArgs } = require('./utils/cli');
const { error } = require('./utils/logger');
const normalizeDockerRef = require('./normalize_docker_ref');
const C = require('./constants');

const uniq = (arr) => {
  const seen = {};
  const result = [];
  arr.forEach((el) => {
    if (!seen[el]) {
      seen[el] = true;
      result.push(el);
    }
  });
  return result;
};

/**
 *
 * @param taskObj
 * @param params
 * @returns {Object}
 */
const normalizeTask = async (taskObj, params) => {
  let { task, tags, skip, type, dependsOn, status, context, dockerfile } = taskObj;
  const { command, validate, tag } = taskObj;
  const { manifestPath } = params;

  // Defaults
  tags = uniq([
    ...(Array.isArray(tag) ? tags : [tag]),
    ...(Array.isArray(tags) ? tags : [tags]),
  ].filter(t => !!t).sort());
  status = status || C.DEFAULT_TASK_STATUS;
  type = type || (
    (command && ((!dockerfile) && (tags.length === 0))) ? C.TASK_TYPES.COMMAND : C.DEFAULT_TASK_TYPE
  );
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
    if (type === C.TASK_TYPES.DOCKER_BUILD) {
      task = task || (tags[0] || null);
      tags = ((tags.length === 0) && task) ? [task] : tags;
      if (tags.length > 0) {
        try {
          tags = await promiseMap(
            tags,
            async t => (await normalizeDockerRef(t)).replace(C.DEFAULT_DOCKER_PUBLIC_REGISTRY, ''),
          );
        } catch (e) {
          error(e.message);
          tags = [];
          status = C.TASK_STATUS.FAILED;
        }
      }

      if (dockerfile) {
        if (!path.isAbsolute(dockerfile)) {
          dockerfile = path.join(path.dirname(manifestPath), dockerfile);
          if (fs.existsSync(dockerfile)) {
            if (fs.statSync(dockerfile).isDirectory()) {
              dockerfile = path.join(dockerfile, C.DEFAULT_DOCKERFILE_NAME);
            }
            context = context || path.dirname(dockerfile);
            if (context && (!path.isAbsolute(context)) && manifestPath) {
              context = `${path.join(path.dirname(manifestPath), context)}`;
            }
          }
        }
      }
    }
  }
  // Common post-checks
  if (!task) {
    error(`No "task" or "tag"/"tags" params defined for ${JSON.stringify(taskObj)} so can't define task name`);
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
    tags,
    task,
    type,
    command,
    validate,
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
        let t = taskObj;
        if (taskObj.task !== dt) {
          t = {
            task: dt,
            type: C.TASK_TYPES.CONTROL,
            skip: false,
            dependsOn: [taskObj.task],
          };
        }
        // Insert generated technical tasks
        if ((t.type === C.TASK_TYPES.DOCKER_BUILD) && (t.push === true)) {
          const pushTaskName = t.task;
          // Push is keeps name of original task and dependency of predceeding being inserted to
          // keep downstream to this task integrity
          const buildTaskName = `${t.task}:$_build_$`;
          const buildTask = {
            ...t,
            type: C.TASK_TYPES.DOCKER_BUILD,
            task: buildTaskName,
          };
          const pushTask = {
            ...t,
            type: C.TASK_TYPES.DOCKER_PUSH,
            dependsOn: [buildTaskName],
          };
          extrapolatedTasks.push(buildTask);
          existingTasksDict[buildTaskName] = buildTask;
          extrapolatedTasks.push(pushTask);
          existingTasksDict[pushTaskName] = pushTask;
        } else {
          extrapolatedTasks.push(t);
        }
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
const makeTaskCommand = (taskObj, { runArgs }) => {
  const { type, args, tags, dockerfile, context, skip, task } = taskObj;
  if (type === C.TASK_TYPES.CONTROL) {
    return null;
  }
  const dockerfileCmd = `-f ${dockerfile} `;
  const buildArgs = formatBuildArgs(args);

  const imageNamesWithTag = tags.length > 0 ? tags : [C.DEFAULT_IMAGE_NAME];
  if (skip) {
    return ['echo', `'Task "${task}" is skipped'`].filter(x => !!x).join(' ');
  }
  if (taskObj.type === C.TASK_TYPES.DOCKER_BUILD) {
    const tag = imageNamesWithTag[0];
    const buildCommand = [
      'docker',
      'build',
      ...buildArgs,
      dockerfileCmd,
      `-t ${tag}`,
      (runArgs || []).join(' '),
      context,
    ].filter(x => !!x).join(' ');
    const tagCommands = (imageNamesWithTag.length > 1)
      ? imageNamesWithTag.slice(1).map(t => `docker tag ${tag} ${t}`)
      : [];
    return [buildCommand, ...tagCommands].join(' && ');
  }
  if (taskObj.type === C.TASK_TYPES.DOCKER_PUSH) {
    return imageNamesWithTag.map(t => `docker push ${t}`).join(' && ');
  }
  if (taskObj.type === C.TASK_TYPES.COMMAND) {
    return [
      taskObj.command,
      formatArgs(args),
      (runArgs || []).join(' '),
    ].filter(x => !!x).join(' ');
  }
  return null;
};


module.exports = {
  normalizeTask,
  sortTasks,
  makeTaskCommand,
};
