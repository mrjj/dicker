const shell = require('shelljs');
const { defaults } = require('./utils/objects');
const { getDataLines } = require('./utils/text');
const { promiseMap, forceArray } = require('./utils/lists');
const { now } = require('./utils/time');
const { face } = require('./utils/faces');
const { sortTasks, normalizeTask, makeTaskCommand } = require('./tasks');
const { loadManifest, locateManifest } = require('./manifest');
const { info, error, format, faceLogTask } = require('./utils/logger');
const { formatArgs } = require('./utils/cli');
const C = require('./constants');

/**
 *
 * @param e
 */
const onError = (e) => {
  error(e);
  shell.exit(1);
};

process.on('uncaughtException', onError);
process.on('unhandledRejection', onError);

const shellCommandExecutor = async (taskObj, cmd, faceLog) => {
  const run = shell.exec(cmd, { async: true, silent: true });
  run.stdout.on('data', buff => info(getDataLines(buff)
    .map(l => faceLog(C.FACES.INSPECTOR, `STDOUT: ${l}`))
    .join('\n')));
  run.stderr.on('data', buff => info(getDataLines(buff)
    .map(l => faceLog(C.FACES.INSPECTOR, `STDERR: ${l}`))
    .join('\n')));

  run.on('error', e => error(faceLog(C.FACES.INSPECTOR, format('STDERR:', e))));

  return new Promise((cloRes) => {
    run.on(
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

/**
 * Main logic
 */
const startTasks = async (normalizedTasks, params) => {
  const { manifestPath, dryRun, runArgs } = params;
  if (dryRun) {
    info('Using DRY RUN mode, no commands will be actually executes');
  }
  const sortedTasks = sortTasks(normalizedTasks).map((taskObj, idx) => {
    let { command, status, validate } = taskObj;
    const { type, skip, task, args } = taskObj;
    if ((type === C.TASK_TYPES.DOCKER_BUILD) || (type === C.TASK_TYPES.DOCKER_PUSH)) {
      command = makeTaskCommand(taskObj, params);
      if (!command) {
        error(`Can't make command for task: "${task}"`);
        status = C.TASK_STATUS.FAILED;
      }
    } else if (type === C.TASK_TYPES.COMMAND) {
      command = [command, formatArgs(args), runArgs.join(' ')].filter(x => !!x).join(' ');
    }
    status = (skip && (status !== C.TASK_STATUS.FAILED))
      ? C.TASK_STATUS.SKIPPED
      : (status || C.TASK_STATUS.PENDING);
    if (dryRun) {
      command = command ? `echo "Dry run of command: '${command.replace(/([^\\])"/ig, '$1\\"')}'"` : 'echo "Dry run with no command"';
      validate = validate ? `echo "Dry run of validation: '${validate.replace(/([^\\])"/ig, '$1\\"')}'"` : 'echo "Dry run with no validation"';
    }
    return defaults(
      { ...taskObj, command, validate },
      {
        order: idx + 1,
        task,
        skip,
        validate,
        type,
        status,
      },
    );
  });

  const tasksDict = {};
  sortedTasks.forEach((taskObj) => {
    const { command, validate, status, description, task } = taskObj;
    tasksDict[task] = taskObj;
    let publicResolve;
    let publicReject;

    const promise = new Promise((res, rej) => {
      publicResolve = res;
      publicReject = rej;
    });

    // Wrap logger for current task
    const faceLog = (faceCode, message) => faceLogTask(
      taskObj,
      sortedTasks.length,
      faceCode,
      message,
    );

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
          },
        );
        return taskObj;
      };
    } else {
      innerFunction = async () => {
        if (taskObj.status === C.TASK_STATUS.FAILED) {
          info(faceLog(C.FACES.DIZZY, 'Task have been failed before start.'));
          Object.assign(
            taskObj,
            {
              code: 1,
            },
          );
          return taskObj;
        }
        const failedDeps = taskObj.dependsOn.filter(
          dt => (tasksDict[dt].status !== C.TASK_STATUS.DONE),
        );
        if (failedDeps.length > 0) {
          const fdStr = failedDeps.map(d => `"${d}"`).join(', ');
          const message = `Task have been failed before start due following upstream dependencies not being resolved: ${fdStr}.`;
          info(faceLog(C.FACES.DIZZY, message));
          Object.assign(
            taskObj,
            {
              message,
              status: C.TASK_STATUS.FAILED,
              code: 1,
            },
          );
          return taskObj;
        }


        info(faceLog(C.FACES.CALMED_DOWN, command ? `$ ${command}` : 'No command'));

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

        const dockerExecutor = async () => shellCommandExecutor(taskObj, command, faceLog);

        const commandExecutor = async () => {
          if (!validate) {
            return shellCommandExecutor(taskObj, command, faceLog);
          }
          const preValidationResult = await shellCommandExecutor(taskObj, validate, faceLog);
          if (preValidationResult.status === C.TASK_STATUS.DONE) {
            return preValidationResult;
          }
          const result = await shellCommandExecutor(taskObj, command, faceLog);
          const validationResult = await shellCommandExecutor(taskObj, validate, faceLog);
          return { ...result, ...validationResult };
        };
        const TYPE_EXECUTORS = {
          [C.TASK_TYPES.CONTROL]: async () => Object.assign(taskObj, {
            code: 0,
            status: C.TASK_STATUS.DONE,
            message: 'Completed successful!',
          }),
          [C.TASK_TYPES.DOCKER_BUILD]: dockerExecutor,
          [C.TASK_TYPES.DOCKER_PUSH]: dockerExecutor,
          [C.TASK_TYPES.COMMAND]: commandExecutor,
        };
        return TYPE_EXECUTORS[taskObj.type]();
      };
    }

    const fn = async () => innerFunction().then(
      (v) => {
        info(C.SEP);
        publicResolve(v);
        return v;
      },
    ).catch(
      (e) => {
        info(C.SEP);
        publicReject(e);
        return e;
      },
    );

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

  info('Following tasks execution order will be used:');
  info(sortedTasks.map(t => `  ${faceLogTask(t, sortedTasks.length)}`).join('\n'));
  info('');
  info(`Docker containers build started at: ${now()}`);
  return promiseMap(sortedTasks, t => t.fn());
};

/**
 * Main execution point
 * @param params {{
 *   manifestPath: string,
 *   dryRun: boolean,
 * }}
 * @returns {Promise<Array<{
 *  status: string,
 *  message: string,
 *  type: string,
 * }>>}
 */
const run = async (params = {}) => {
  const manifestPath = locateManifest(params.manifestPath);
  const tasks = await loadManifest(manifestPath);
  const p = {
    ...params,
    manifestPath,
  };
  const normalizedTasks = await promiseMap(tasks, async t => normalizeTask(t, p));
  const res = await startTasks(normalizedTasks, p);
  const tasksResults = forceArray(res);
  info([
    '',
    `Build ended at: ${now()}`,
    '',
    `From ${tasksResults.length} processed task${tasksResults.length === 1 ? '' : 's'}:`,
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
          const padSize = Math.log10(tasksResults.length) + 1;
          const count = tasksResults.filter(({ status }) => (status === ts)).length;
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
    tasksResults.map(t => `  ${faceLogTask(t, tasksResults.length)}`).join('\n'),
    '',
    'Have a nice day!',
  ].join('\n'));
  const failedCount = tasksResults.filter(
    ({ status }) => (status === C.TASK_STATUS.FAILED),
  ).length;
  shell.exit((failedCount === 0) ? 0 : 1);
};

module.exports = run;
