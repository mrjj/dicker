const path = require('path');
const shell = require('shelljs');
const toposort = require('toposort');
const { defaults } = require('./utils/objects');
const { isEmpty } = require('./utils/types');
const { promiseMap, forceArray } = require('./utils/lists');
const { face } = require('./utils/faces');
const { info, error, format } = require('./utils/logger');
const C = require('./constants');

const onError = (e) => {
  error(e);
  shell.exit(1);
};

process.on('uncaughtException', onError);
process.on('unhandledRejection', onError);

const now = () => (new Date()).toISOString().replace('T', ' ').split('.')[0];

const getDataLines = s => s.toString()
  .split('\n')
  .map(x => x.trim())
  .filter(x => !!(x.trim()));

const loadManifest = (manifestPath) => {
  const mp = path.resolve(manifestPath);
  info(`Loading manifest file: "${mp}"`);
  if (!shell.test('-f', mp)) {
    error(`Manifest path do not exists: "${mp}", exiting with code 1`);
    shell.exit(1);
  } else {
    const tasks = forceArray(JSON.parse(shell.cat(mp)));
    if (tasks.length === 0) {
      error(`No tasks defined in manifest: "${mp}", exiting with code 0`);
      shell.exit(0);
      return 0;
    }

    info(`Tasks loaded:        ${tasks.length} (also one service task: "${C.ROOT_TASK.task}" will be used)`);
    return tasks;
  }
  return null;
};

const sortTasks = (tasks) => {
  const tasksDict = {
    [C.ROOT_TASK.task]: C.ROOT_TASK,
  };
  const tasksEdges = [];

  tasks.forEach((taskObj) => {
    const { task, dependsOn } = taskObj;
    if (task === C.ROOT_TASK.task) {
      const errMsg = `Don't use reserved root task name in manifests: "${C.ROOT_TASK.task}"`;
      onError(new Error(errMsg));
      return;
    }
    if (!tasksDict[task]) {
      tasksDict[task] = taskObj;
      const deps = forceArray(
        (!dependsOn) || isEmpty(forceArray(dependsOn)) ? C.ROOT_TASK.task : dependsOn,
      );
      deps.forEach((dependsOnTaskName) => {
        tasksEdges.push([dependsOnTaskName, task]);
      });
    }
  });
  return toposort(tasksEdges).map(image => tasksDict[image]);
};

const makeTaskCommand = (
  { image, tag, args, dockerfile, context, skip },
  manifest,
  extraArgsStr,
) => {
  const manifestPath = path.resolve(manifest);
  const dockerfilePath = path.join(path.dirname(manifestPath), dockerfile || 'Dockerfile');

  const dockerfileCmd = `-f ${dockerfilePath} `;

  const contextPath = context ? `${path.resolve(context)}${path.sep}` : dockerfilePath.split(path.sep)
    .slice(0, -1)
    .join(path.sep);

  const buildArgs = args
    ? Object.keys(args).sort().map(k => `--build-arg "${k}=${args[k].replace('"', '\\\\"')}"`)
    : '';

  const imageNameWithTag = `-t ${image || C.DEFAULT_IMAGE_NAME}${tag ? `:${tag}` : ''} `;
  return skip ? 'echo "Skipped"' : [
    'docker build',
    ...buildArgs,
    dockerfileCmd,
    imageNameWithTag,
    extraArgsStr,
    contextPath,
  ].filter(x => !!x).join(' ');
};

const faceLogTask = (t, tasksTotal, customFace, customMessage) => {
  const padSize = Math.log10(tasksTotal) + 1;
  return [
    face(customFace || C.TASK_STATUS_TO_FACE[t.status]),
    [
      (t.order || 0).toString().padStart(padSize),
      '/',
      (tasksTotal || 0).toString().padEnd(padSize),
    ].join(''),
    t.status.padStart(C.TASK_STATUS_MAX_LEN),
    `"${t.task} "`.padEnd(20),
    customMessage || t.message || '',
  ].join(' ');
};

/**
 * Main logic
 */
const startTasks = async (manifestPath, extraArgsStr) => {
  const tasks = loadManifest(manifestPath);
  const sortedTasks = sortTasks(tasks).map((taskObj, order) => defaults(
    taskObj,
    {
      order,
      command: makeTaskCommand(taskObj, manifestPath, extraArgsStr),
      status: (taskObj.skip || taskObj.task === C.ROOT_TASK.task)
        ? C.TASK_STATUS.SKIPPED
        : C.TASK_STATUS.PENDING,
    },
  ));

  sortedTasks.forEach((taskObj) => {
    const { command, status, description } = taskObj;
    let publicResolve;
    let publicReject;

    const promise = new Promise((res, rej) => {
      publicResolve = res;
      publicReject = rej;
    });

    const faceLog = (faceCode, message) => faceLogTask(taskObj, tasks.length, faceCode, message);

    let innerFunction = async () => {
      Object.assign(
        taskObj,
        {
          message: faceLog(C.FACES.NDE, 'Something wrong and task initialisation have failed'),
          code: -1,
          status: C.TASK_STATUS.FAILED,
        },
      );
      return taskObj;
    };

    if (status === C.TASK_STATUS.SKIPPED) {
      innerFunction = async () => {
        const message = 'Build skipped due to "skip": true flag.';
        const help = `To run this task remove "skip" flag or set "skip": true set in manifest file: "${manifestPath}".`;
        [message, help].forEach(m => info(faceLog(C.FACES.DIZZY, m)));
        Object.assign(
          taskObj,
          {
            message,
            code: 0,
            status: C.TASK_STATUS.SKIPPED,
          },
        );
        return taskObj;
      };
    } else {
      innerFunction = () => {
        info(faceLog(C.FACES.CALMED_DOWN, `$ ${command}`));

        Object.assign(
          taskObj,
          { message: `$ ${command}` },
        );

        Object.assign(
          taskObj,
          {
            status: C.TASK_STATUS.RUNNING,
            message: `Started at: ${now()}`,
          },
        );
        info(faceLog(C.FACES.SURPRISED, taskObj.message));

        const dockerRun = shell.exec(command, { async: true, silent: true });
        dockerRun.stdout.on('data', buff => info(getDataLines(buff)
          .map(l => faceLog(C.FACES.INSPECTOR, `STDOUT: ${l}`))
          .join('\n')));
        dockerRun.stderr.on('data', buff => info(getDataLines(buff)
          .map(l => faceLog(C.FACES.INSPECTOR, `STDERR: ${l}`))
          .join('\n')));

        dockerRun.on('error', e => error(faceLog(C.FACES.INSPECTOR, format('STDERR:', e))));


        return new Promise((cloRes) => {
          dockerRun.on(
            'close',
            (code) => {
              Object.assign(taskObj, {
                code,
                status: (code === 0) ? C.TASK_STATUS.DONE : C.TASK_STATUS.FAILED,
                message: (code === 0) ? 'Completed successful!' : `Failed with code: ${code}!`,
              });

              // Don't fail
              info(faceLog(code === 0 ? C.FACES.HAPPY : C.FACES.DEAD));
              cloRes(taskObj);
            },
          );
        });
      };
    }
    const fn = async () => innerFunction().then((v) => {
      info(C.SEP);
      publicResolve(v);
      return v;
    }).catch((e) => {
      info(C.SEP);
      publicReject(e);
      return e;
    });
    Object.assign(
      taskObj,
      {
        fn,
        promise,
        message: description,
        code: null,
        resolve: () => Promise.resolve(taskObj),
        command,
      },
    );
  });

  info('Following containers build order will be used:');
  info(sortedTasks.map(t => `  ${faceLogTask(t, tasks.length)}`).join('\n'));
  info('');
  info(`Docker containers build started at: ${now()}`);
  return promiseMap(sortedTasks, t => t.fn());
};


const run = async (manifestPath, extraArgs) => {
  const res = await startTasks(
    manifestPath || ((process.argv.length > 2) ? process.argv[2] : C.DEFAULT_MANIFEST_PATH),
    extraArgs || ((process.argv.length > 3) ? Array.from(process.argv).slice(3).join(' ') : ''),
  );
  const resultingTasks = forceArray(res);
  info([
    '',
    `Build ended at: ${now()}`,
    '',
    `From ${resultingTasks.length} processed task${resultingTasks.length === 1 ? '' : 's'}:`,
    ...(
      [
        C.TASK_STATUS.DONE,
        C.TASK_STATUS.FAILED,
        C.TASK_STATUS.SKIPPED,
        C.TASK_STATUS.PENDING,
        C.TASK_STATUS.UNKNOWN,
      ].map(
        (ts) => {
          const fc = C.TASK_STATUS_TO_FACE[ts];
          const padSize = Math.log10(resultingTasks.length) + 1;
          const count = resultingTasks.filter(({ status }) => (status === ts)).length;
          if (!count) {
            return null;
          }
          return `  ${ts.padStart(C.TASK_STATUS_MAX_LEN)}: ${count.toString()
            .padStart(padSize)} ${face(fc, { count })}`;
        },
      ).filter(x => !!x)
    ),

    '',
    'Tasks completion details:',
    resultingTasks.map(t => `  ${faceLogTask(t, resultingTasks.length)}`).join('\n'),
    '',
    'Have a nice day!',
  ].join('\n'));
  const failedCount = resultingTasks.filter(
    ({ status }) => (status === C.TASK_STATUS.FAILED),
  ).length;
  shell.exit((failedCount === 0) ? 0 : 1);
};


if (require.main === module) {
  run(...(process.argv.slice(2)));
}

module.exports = run;