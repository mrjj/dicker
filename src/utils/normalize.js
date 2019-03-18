/* @flow */
import { DEFAULT_DOMAIN, DEFAULT_REFERENCE, LEGACY_DEFAULT_DOMAIN, LOCALHOST } from '../constants';
import { anchoredDigestRegexp, anchoredIdentifierRegexp } from './regexp';

export type ReferenceType = {
  // Repo
  domain?: string,
  repository?: string,
  path?: string,
  tag?: string,
  digest?: string,
  digestAlgorithm?: string,
}

export type DigestType = { digest: ?string, digestAlgorithm: ?string };

// NameTotalLengthMax is the maximum total number of characters in a repository name.
const NameTotalLengthMax = 255;

// ErrReferenceInvalidFormat represents an error while trying to parse a string as a reference.
// eslint-disable-next-line
const ErrReferenceInvalidFormat = 'invalid reference format';

// ErrTagInvalidFormat represents an error while trying to parse a string as a tag.
// const ErrTagInvalidFormat = new Error('invalid tag format');

// ErrDigestInvalidFormat represents an error while trying to parse a string as a tag.
// const ErrDigestInvalidFormat = new Error('invalid digest format');

// ErrNameContainsUppercase is returned for invalid repository names
// that contain uppercase characters.
// eslint-disable-next-line
const ErrNameContainsUppercase = 'repository name must be lowercase';

// ErrNameEmpty is returned for empty, invalid repository names.
// eslint-disable-next-line
const ErrNameEmpty = 'repository name must have at least one component';

// ErrNameTooLong is returned when a repository name is longer than NameTotalLengthMax.
// eslint-disable-next-line
const ErrNameTooLong = `repository name must not be more than ${NameTotalLengthMax} characters`;

// ErrNameNotCanonical is returned when a name is not canonical.
// const ErrNameNotCanonical = 'repository name must be canonical';


// splitDockerDomain splits a repository name to domain and remotename string.
// If no valid domain is found, the default domain is used. Repository name
// needs to be already validated before.
const splitDockerDomain = (str: string): [string, string, string] => {
  if (
    str.match(new RegExp(anchoredDigestRegexp)) || str.match(new RegExp(anchoredIdentifierRegexp))
  ) {
    return ['', '', str];
  }
  const repoAndPathSep = str.indexOf('/');
  let domain = (repoAndPathSep === -1) ? '' : str.substring(0, repoAndPathSep);
  const domainOK = (domain && (domain.match(/[.:]/) || (domain === LOCALHOST)));
  const domainIsDefault = (domain === LEGACY_DEFAULT_DOMAIN) || (domain === DEFAULT_DOMAIN);
  domain = ((!domainOK) || domainIsDefault) ? '' : domain;
  const repoAndPath = domainOK ? str.substr(repoAndPathSep + 1) : str;
  const pathSep = repoAndPath.indexOf('/');
  let repo = '';
  let remainder = '';
  if (pathSep !== -1) {
    repo = repoAndPath.substring(0, pathSep);
    remainder = repoAndPath.substring(pathSep + 1);
  } else {
    repo = '';
    remainder = repoAndPath;
  }
  return [domain, repo === DEFAULT_REFERENCE.repository ? '' : repo, remainder];
};

// const getBestReferenceType = (ref: ReferenceType): ReferenceType => {
//   if (!ref.name) {
//     // Allow digest only references
//     if (ref.digest !== '') {
//       return {
//         ...ref,
//         ...(ref.namedRepository),
//         digest: ref.digest,
//         name: ref.name,
//         tag: ref.tag,
//         namedRepository: ref.namedRepository,
//       };
//     }
//     throw new Error('No matching reference type');
//   }
//   if (!ref.tag) {
//     if (ref.digest) {
//       return {
//         ...ref,
//         ...(ref.namedRepository),
//         namedRepository: ref.namedRepository,
//         digest: ref.digest,
//       };
//     }
//     return { namedRepository: ref.namedRepository };
//   }
//   if (ref.digest) {
//     return {
//       ...ref,
//       ...(ref.namedRepository),
//       namedRepository: ref.namedRepository,
//       tag: ref.tag,
//     };
//   }
//   return ref;
// };
//
// export const Parse = (s: string): ReferenceType => {
//   const matchReference = s.match(new RegExp(ReferenceRegexp));
//   if (matchReference === null) {
//     if (!s) {
//       throw new Error(ErrNameEmpty);
//     }
//     if (s.toLowerCase() !== s) {
//       throw new Error(ErrNameContainsUppercase);
//     }
//     throw new Error(ErrReferenceInvalidFormat);
//   }
//
//   const matches = new Array(matchReference || [])[0];
//   const head = matches[0] || '';
//   const middle = matches[1] || '';
//   const tail = matches[2] || '';
//   if (head.length > NameTotalLengthMax) {
//     throw new Error(ErrNameTooLong);
//   }
//
//   console.log('head, middle, tail', [head, middle, tail]);
//   const repo = {
//     path: null,
//     domain: null,
//     digest: null,
//     tag: null,
//   };
//   const headIsDigest = head.match(new RegExp(anchoredDigestRegexp));
//   const middleIsDigest = middle.match(new RegExp(anchoredDigestRegexp));
//   const middleIsName = new RegExp(anchoredNameRegexp).exec(middle);
//
//   if (headIsDigest) {
//     repo.digest = head;
//   } else {
//     if (middleIsDigest) {
//       repo.path = middleIsName ? head : null;
//       repo.tag = middleIsName ? null : head;
//       repo.digest = middle;
//     } else {
//       repo.path = head;
//       repo.tag = middle;
//       repo.digest = tail;
//     }
//   }
//   return repo;
// };

// familiarizeName returns a shortened version of the name familiar
// to to the Docker UI. Familiar names have the default domain
// "docker.io" and "library/" repository prefix removed.
// For example, "docker.io/library/redis" will have the familiar
// name "redis" and "docker.io/dmcgowan/myapp" will be "dmcgowan/myapp".
// Returns a familiarized named only reference.
// const familiarizeName = (repo: RepositoryType): RepositoryType => {
//   if (repo.domain === DEFAULT_DOMAIN) {
//     repo.domain = '';
//     // Handle official repositories which have the pattern "library/<official repo name>"
//     const split = repo.path.split(PATH_SEPARATOR);
//     if ((split.length === 2) && (split[0] === OFFICIAL_REPO_NAME)) {
//       repo.path = split[1];
//     }
//   }
//   return repo;
// };

/**
 * Remove object empty attributes or replace them with provided defaults
 * @param obj {Object} = initial object
 * @param defaults {Object} - defaults object
 */
const applyDefaults = (obj: Object, defaults: Object = {}): { [string]: string } => {
  const res = {};
  const keys = Object.keys({ ...obj, ...defaults }).sort();
  keys.forEach((field) => {
    const val = obj[field] || defaults[field];
    if (val) {
      res[field] = val;
    }
  });
  return res;
};

const parseDigest = (digestStr: ?string): DigestType => {
  let digest = null;
  let digestAlgorithm = null;
  if (digestStr) {
    if (digestStr.indexOf(':') === -1) {
      digestAlgorithm = '';
      digest = digestStr;
    } else {
      [digestAlgorithm, digest] = digestStr.split(':');
    }
  }

  return { digest, digestAlgorithm };
};

// ParseNormalizedNamed parses a string into a named reference
// transforming a familiar name from Docker UI to a fully
// qualified reference. If the value may be an identifier
// use ParseAnyReference.

export const ParseNormalizedNamed = (s: string, ds?: ?Array<string>): ReferenceType => {
  const [domain, repository, remainder] = splitDockerDomain(s);
  // console.log('[domain, remainder]', [domain, remainder]);
  let path: ?string;
  let tag: ?string;
  let digestStr: ?string;
  if (
    remainder.match(new RegExp(anchoredDigestRegexp))
    || remainder.match(new RegExp(anchoredIdentifierRegexp))
  ) {
    digestStr = remainder;
  } else {
    const tagSep = remainder.indexOf(':');
    if (tagSep !== -1) {
      path = remainder.substring(0, tagSep);
      const tagAndDigest = remainder.substring(tagSep + 1);
      const digestSep = tagAndDigest.indexOf('@');
      if (digestSep !== -1) {
        digestStr = tagAndDigest.substring(digestSep + 1);
        tag = tagAndDigest.substring(0, digestSep);
      } else {
        tag = tagAndDigest;
      }
    } else {
      path = remainder;
    }
  }

  let { digest, digestAlgorithm } = parseDigest(digestStr);

  if (ds) {
    let dsArr = [];
    if (typeof ds === 'string') {
      dsArr = [ds];
    } else if (Array.isArray(ds)) {
      dsArr = ds;
    }
    if (dsArr.length > 0) {
      const filteredDs: Array<?DigestType> = dsArr.map(
        (dsStr): ?DigestType => {
          const parsedDs: DigestType = parseDigest(dsStr);
          if ((digest === parsedDs.digest) && (
            (digestAlgorithm || DEFAULT_REFERENCE.digestAlgorithm)
            === (parsedDs.digestAlgorithm || DEFAULT_REFERENCE.digestAlgorithm)
          )) {
            return parsedDs;
          }
          return null;
        },
      ).filter(x => !!x);
      if ((filteredDs.length === 1) && (filteredDs[0])) {
        digest = filteredDs[0].digest;
        digestAlgorithm = filteredDs[0].digestAlgorithm;
      }
    }
  }

  if (path && (path.toLowerCase() !== path)) {
    throw new Error('invalid reference format: repository name must be lowercase');
  }
  const ref = { domain, tag, digest, digestAlgorithm, repository, path };
  if (Object.keys(ref) === 0) {
    throw new Error(`reference ${JSON.stringify(ref)} has no name`);
  }
  const defaulted = applyDefaults(ref, DEFAULT_REFERENCE);
  const remoteName = ([defaulted.repository, defaulted.path].filter(x => !!x).join('/'));
  if (remoteName.match(anchoredIdentifierRegexp)) {
    throw new Error(`invalid repository name ${s}, cannot specify 64-byte hexadecimal strings`);
  }
  return {
    remoteName,
    ...defaulted,
  };
};

export const normalizedNameToString = (nn: Object): string => {
  const {
    domain,
    repository,
    path,
    digest,
    digestAlgorithm,
    tag,
  } = applyDefaults(nn, DEFAULT_REFERENCE);
  const digestStr = digest ? [digestAlgorithm, digest].filter(x => !!x).join(':') : '';
  // console.log('cond', digest,
  //   tag,
  //   repository,
  //   domain,
  //   (tag === DEFAULT_REFERENCE.tag),
  //   (repository === DEFAULT_REFERENCE.repository),
  //   (domain === DEFAULT_REFERENCE.domain));
  if (digest
    && (tag === DEFAULT_REFERENCE.tag)
    && (repository === DEFAULT_REFERENCE.repository)
    && (!path)
    && (domain === DEFAULT_REFERENCE.domain)
  ) {
    return digestStr;
  }
  if (digest && (!path)) {
    return `${domain}/${repository}/${digest}`;
  }

  const suffixStr = `:${[tag, digestStr].filter(x => !!x).join('@')}`;

  return `${domain}/${repository}/${path}${suffixStr}`;
};
