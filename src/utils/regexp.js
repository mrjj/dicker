/* @flow */

// https://github.com/docker/distribution/blob/749f6afb4572201e3c37325d0ffedb6f32be8950/reference/regexp.go

// match compiles the string to a regular expression.
type MatchType = (s: string) => string;
type ResMatchType = (...res: Array<string>)=>string;


export const match: MatchType = s => s;

// literal compiles s into a literal regular expression, escaping any regexp
// reserved characters.
export const literal: MatchType = s => match(`\\${s.toString()}`);

// expression defines a full expression, where each regular expression must
// follow the previous.
export const expression: ResMatchType = (...res) => match(res.map(r => r.toString()).join(''));

// group wraps the regexp in a non-capturing group.
export const group: ResMatchType = (...res) => match(`(?:${expression(...res).toString()})`);

// optional wraps the expression in a non-capturing group and makes the
// production optional.
export const optional: ResMatchType = (...res) => match(`${group(expression(...res)).toString()}?`);

// repeated wraps the regexp in a non-capturing group to get one or more
// matches.
export const repeated: ResMatchType = (...res) => match(`${group(expression(...res)).toString()}+`);

// capture wraps the expression in a capturing group.
export const capture: ResMatchType = (...res) => match(`(${expression(...res).toString()})`);

// anchored anchors the regular expression by adding start and end delimiters.
export const anchored: ResMatchType = (...res) => match(`^${expression(...res).toString()}$`);


// alphaNumericRegexp defines the alpha numeric atom, typically a
// component of names. This only allows lower case characters and digits.
export const alphaNumericRegexp: string = match('[a-z0-9]+');

// separatorRegexp defines the separators allowed to be embedded in name
// components. This allow one period, one or two underscore and multiple
// dashes.
export const separatorRegexp: string = match('(?:[._]|__|[-]*)');

// nameComponentRegexp restricts registry path component names to start
// with at least one letter or number, with following parts able to be
// separated by one period, one or two underscore and multiple dashes.
export const nameComponentRegexp: string = expression(
  alphaNumericRegexp,
  optional(repeated(separatorRegexp, alphaNumericRegexp)),
);

// domainComponentRegexp restricts the registry domain component of a
// repository name to start with a component as defined by DomainRegexp
// and followed by an optional port.
export const domainComponentRegexp: string = match('(?:[a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])');

// DomainRegexp defines the structure of potential domain components
// that may be part of image names. This is purposely a subset of what is
// allowed by DNS to ensure backwards compatibility with Docker image
// names.
export const DomainRegexp: string = expression(
  domainComponentRegexp,
  optional(repeated(literal('.'), domainComponentRegexp)),
  optional(literal(':'), match('[0-9]+')),
);

export const anchoredDomainRegexp: string = anchored(DomainRegexp);

// TagRegexp matches valid tag names. From docker/docker:graph/tags.go.
export const TagRegexp: string = match('[\\w][\\w.-]{0,127}');

// anchoredTagRegexp matches valid tag names, anchored at the start and
// end of the matched string.
export const anchoredTagRegexp: string = anchored(TagRegexp);

// DigestRegexp matches valid digests.
export const DigestRegexp: string = match('[A-Za-z][A-Za-z0-9]*(?:[-_+.][A-Za-z][A-Za-z0-9]*)*[:][A-Fa-f0-9]{32,}');

// anchoredDigestRegexp matches valid digests, anchored at the start and
// end of the matched string.
export const anchoredDigestRegexp: string = anchored(DigestRegexp);

// NameRegexp is the format for the name component of references. The
// regexp has capturing groups for the domain and name part omitting
// the separating forward slash from either.
export const NameRegexp: string = expression(
  optional(DomainRegexp, literal('/')),
  nameComponentRegexp,
  optional(repeated(literal('/'), nameComponentRegexp)),
);

// anchoredNameRegexp is used to parse a name value, capturing the
// domain and trailing components.
export const anchoredNameRegexp: string = anchored(
  optional(capture(DomainRegexp), literal('/')),
  capture(nameComponentRegexp,
    optional(repeated(literal('/'), nameComponentRegexp))),
);

// ReferenceRegexp is the full supported format of a reference. The regexp
// is anchored and has capturing groups for name, tag, and digest
// components.
export const ReferenceRegexp: string = anchored(capture(NameRegexp),
  optional(literal(':'), capture(TagRegexp)),
  optional(literal('@'), capture(DigestRegexp)));

// IdentifierRegexp is the format for string identifier used as a
// content addressable identifier using sha256. These identifiers
// are like digests without the algorithm, since sha256 is used.
export const IdentifierRegexp: string = match('([a-f0-9]{64})');

// ShortIdentifierRegexp is the format used to represent a prefix
// of an identifier. A prefix may be used to match a sha256 identifier
// within a list of trusted identifiers.
export const ShortIdentifierRegexp: string = match('([a-f0-9]{6,64})');

// anchoredIdentifierRegexp is used to check or match an
// identifier value, anchored at start and end of string.
export const anchoredIdentifierRegexp: string = anchored(IdentifierRegexp);

// anchoredShortIdentifierRegexp is used to check if a value
// is a possible identifier prefix, anchored at start and end
// of string.
export const anchoredShortIdentifierRegexp: string = anchored(ShortIdentifierRegexp);
