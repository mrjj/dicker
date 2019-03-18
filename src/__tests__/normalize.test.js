/* @flow */
import { normalizedNameToString, ParseNormalizedNamed } from '../utils/normalize';

describe.skip('normalize', () => {
  test('Parsing valid name', () => {
    const validResponses = [
      'docker/docker',
      'library/debian',
      'debian',
      'docker.io/docker/docker',
      'docker.io/library/debian',
      'docker.io/debian',
      'index.docker.io/docker/docker',
      'index.docker.io/library/debian',
      'index.docker.io/debian',
      '127.0.0.1:5000/docker/docker',
      '127.0.0.1:5000/library/debian',
      '127.0.0.1:5000/debian',
      'thisisthesongthatneverendsitgoesonandonandonthisisthesongthatnev',

      // This test case was moved from invalid to valid since it is valid input
      // when specified with a hostname, it removes the ambiguity from about
      // whether the value is an identifier or repository name
      'docker.io/1a3f5e7d9c1b3a5f7e9d1c3b5a7f9e1d3c5b7a9f1e3d5d7c9b1a3f5e7d9c1b3a',
    ];
    validResponses.forEach((name) => {
      expect(() => ParseNormalizedNamed(name)).not.toThrow();
    });
  });
  test('Fails on invalid names', () => {
    const INVALID_NAMES = [
      'https://github.com/docker/docker',
      'docker/Docker',
      '-docker',
      '-docker/docker',
      '-docker.io/docker/docker',
      'docker///docker',
      'docker.io/docker/Docker',
      'docker.io/docker///docker',
      '1a3f5e7d9c1b3a5f7e9d1c3b5a7f9e1d3c5b7a9f1e3d5d7c9b1a3f5e7d9c1b3a',
    ];
    INVALID_NAMES.forEach((name) => {
      expect(() => ParseNormalizedNamed(name)).toThrow();
    });
  });


  test('Parsing valid remote name', () => {
    const validResponses = [
      // Sanity check.
      'docker/docker',

      // Allow 64-character non-hexadecimal names (hexadecimal names are forbidden).
      'thisisthesongthatneverendsitgoesonandonandonthisisthesongthatnev',

      // Allow embedded hyphens.
      'docker-rules/docker',

      // Allow multiple hyphens as well.
      'docker---rules/docker',

      // Username doc and image name docker being tested.
      'doc/docker',

      // single character names are now allowed.
      'd/docker',
      'jess/t',

      // Consecutive underscores.
      'dock__er/docker',
    ];
    validResponses.forEach((name) => {
      expect(() => ParseNormalizedNamed(name)).not.toThrow();
    });
  });


  test('Fails on invalid remote names', () => {
    const INVALID_NAMES = [
      'docker/Docker',

      // Only allow one slash.
      'docker///docker',

      // Disallow 64-character hexadecimal.
      '1a3f5e7d9c1b3a5f7e9d1c3b5a7f9e1d3c5b7a9f1e3d5d7c9b1a3f5e7d9c1b3a',

      // Disallow leading and trailing hyphens in namespace.
      '-docker/docker',
      'docker-/docker',
      '-docker-/docker',

      // Don't allow underscores everywhere (as opposed to hyphens).
      '____/____',

      '_docker/_docker',

      // Disallow consecutive periods.
      'dock..er/docker',
      'dock_.er/docker',
      'dock-.er/docker',

      // No repository.
      'docker/',

      // namespace too long
      'this_is_not_a_valid_namespace_because_its_lenth_is_greater_than_255_this_is_not_a_valid_namespace_because_its_lenth_is_greater_than_255_this_is_not_a_valid_namespace_because_its_lenth_is_greater_than_255_this_is_not_a_valid_namespace_because_its_lenth_is_greater_than_255/docker',
    ];
    INVALID_NAMES.forEach((name) => {
      expect(() => ParseNormalizedNamed(name)).toThrow();
    });
  });
  test('Parsing results right', () => {
    const CASES = [
      {
        RemoteName: 'fooo/bar',
        FamiliarName: 'fooo/bar',
        FullName: 'docker.io/fooo/bar',
        AmbiguousName: 'index.docker.io/fooo/bar',
        Domain: 'docker.io',
      },
      {
        RemoteName: 'library/ubuntu',
        FamiliarName: 'ubuntu',
        FullName: 'docker.io/library/ubuntu',
        AmbiguousName: 'library/ubuntu',
        Domain: 'docker.io',
      },
      {
        RemoteName: 'nonlibrary/ubuntu',
        FamiliarName: 'nonlibrary/ubuntu',
        FullName: 'docker.io/nonlibrary/ubuntu',
        AmbiguousName: '',
        Domain: 'docker.io',
      },
      {
        RemoteName: 'other/library',
        FamiliarName: 'other/library',
        FullName: 'docker.io/other/library',
        AmbiguousName: '',
        Domain: 'docker.io',
      },
      {
        RemoteName: 'private/moonbase',
        FamiliarName: '127.0.0.1:8000/private/moonbase',
        FullName: '127.0.0.1:8000/private/moonbase',
        AmbiguousName: '',
        Domain: '127.0.0.1:8000',
      },
      {
        RemoteName: 'privatebase',
        FamiliarName: '127.0.0.1:8000/privatebase',
        FullName: '127.0.0.1:8000/privatebase',
        AmbiguousName: '',
        Domain: '127.0.0.1:8000',
      },
      {
        RemoteName: 'private/moonbase',
        FamiliarName: 'example.com/private/moonbase',
        FullName: 'example.com/private/moonbase',
        AmbiguousName: '',
        Domain: 'example.com',
      },
      {
        RemoteName: 'privatebase',
        FamiliarName: 'example.com/privatebase',
        FullName: 'example.com/privatebase',
        AmbiguousName: '',
        Domain: 'example.com',
      },
      {
        RemoteName: 'private/moonbase',
        FamiliarName: 'example.com:8000/private/moonbase',
        FullName: 'example.com:8000/private/moonbase',
        AmbiguousName: '',
        Domain: 'example.com:8000',
      },
      {
        RemoteName: 'privatebasee',
        FamiliarName: 'example.com:8000/privatebasee',
        FullName: 'example.com:8000/privatebasee',
        AmbiguousName: '',
        Domain: 'example.com:8000',
      },
      {
        RemoteName: 'library/ubuntu-12.04-base',
        FamiliarName: 'ubuntu-12.04-base',
        FullName: 'docker.io/library/ubuntu-12.04-base',
        AmbiguousName: 'index.docker.io/library/ubuntu-12.04-base',
        Domain: 'docker.io',
      },
      {
        RemoteName: 'library/foo',
        FamiliarName: 'foo',
        FullName: 'docker.io/library/foo',
        AmbiguousName: 'docker.io/foo',
        Domain: 'docker.io',
      },
      {
        RemoteName: 'library/foo/bar',
        FamiliarName: 'library/foo/bar',
        FullName: 'docker.io/library/foo/bar',
        AmbiguousName: '',
        Domain: 'docker.io',
      },
      {
        RemoteName: 'store/foo/bar',
        FamiliarName: 'store/foo/bar',
        FullName: 'docker.io/store/foo/bar',
        AmbiguousName: '',
        Domain: 'docker.io',
      },
    ];
    CASES.forEach(
      ({
        FamiliarName,
        FullName,
        RemoteName: remoteName,
        Domain: domain,
        AmbiguousName,
      }) => {
        expect(ParseNormalizedNamed(FamiliarName)).toMatchObject({ domain, remoteName });
        expect(ParseNormalizedNamed(FullName)).toMatchObject({ domain, remoteName });
        if (AmbiguousName) {
          expect(ParseNormalizedNamed(AmbiguousName)).toMatchObject({ domain, remoteName });
        }
      }
    );
  });
  test('Tag and digest', () => {
    expect(
      normalizedNameToString(ParseNormalizedNamed(
        'busybox:latest@sha256:86e0e091d0da6bde2456dbb48306f3956bbeb2eae1b5b9a43045843f69fe4aaa',
      ))
    )
      .toEqual(
        'docker.io/library/busybox:latest@sha256:86e0e091d0da6bde2456dbb48306f3956bbeb2eae1b5b9a43045843f69fe4aaa',
      );
    expect(() => ParseNormalizedNamed('-foo')).toThrow();
  });
  test('TestParseAnyReference', () => {
    const CASES = [
      {
        Reference: 'redis',
        Equivalent: 'docker.io/library/redis',
      },
      {
        Reference: 'redis:latest',
        Equivalent: 'docker.io/library/redis:latest',
      },
      {
        Reference: 'docker.io/library/redis:latest',
        Equivalent: 'docker.io/library/redis:latest',
      },
      {
        Reference: 'redis@sha256:dbcc1c35ac38df41fd2f5e4130b32ffdb93ebae8b3dbe638c23575912276fc9c',
        Equivalent: 'docker.io/library/redis@sha256:dbcc1c35ac38df41fd2f5e4130b32ffdb93ebae8b3dbe638c23575912276fc9c',
      },
      {
        Reference: 'docker.io/library/redis@sha256:dbcc1c35ac38df41fd2f5e4130b32ffdb93ebae8b3dbe638c23575912276fc9c',
        Equivalent: 'docker.io/library/redis@sha256:dbcc1c35ac38df41fd2f5e4130b32ffdb93ebae8b3dbe638c23575912276fc9c',
      },
      {
        Reference: 'dmcgowan/myapp',
        Equivalent: 'docker.io/dmcgowan/myapp',
      },
      {
        Reference: 'dmcgowan/myapp:latest',
        Equivalent: 'docker.io/dmcgowan/myapp:latest',
      },
      {
        Reference: 'docker.io/mcgowan/myapp:latest',
        Equivalent: 'docker.io/mcgowan/myapp:latest',
      },
      {
        Reference: 'dmcgowan/myapp@sha256:dbcc1c35ac38df41fd2f5e4130b32ffdb93ebae8b3dbe638c23575912276fc9c',
        Equivalent: 'docker.io/dmcgowan/myapp@sha256:dbcc1c35ac38df41fd2f5e4130b32ffdb93ebae8b3dbe638c23575912276fc9c',
      },
      {
        Reference: 'docker.io/dmcgowan/myapp@sha256:dbcc1c35ac38df41fd2f5e4130b32ffdb93ebae8b3dbe638c23575912276fc9c',
        Equivalent: 'docker.io/dmcgowan/myapp@sha256:dbcc1c35ac38df41fd2f5e4130b32ffdb93ebae8b3dbe638c23575912276fc9c',
      },
      {
        Reference: 'dbcc1c35ac38df41fd2f5e4130b32ffdb93ebae8b3dbe638c23575912276fc9c',
        Expected: 'sha256:dbcc1c35ac38df41fd2f5e4130b32ffdb93ebae8b3dbe638c23575912276fc9c',
        Equivalent: 'sha256:dbcc1c35ac38df41fd2f5e4130b32ffdb93ebae8b3dbe638c23575912276fc9c',
      },
      {
        Reference: 'sha256:dbcc1c35ac38df41fd2f5e4130b32ffdb93ebae8b3dbe638c23575912276fc9c',
        Expected: 'sha256:dbcc1c35ac38df41fd2f5e4130b32ffdb93ebae8b3dbe638c23575912276fc9c',
        Equivalent: 'sha256:dbcc1c35ac38df41fd2f5e4130b32ffdb93ebae8b3dbe638c23575912276fc9c',
      },
      {
        Reference: 'dbcc1c35ac38df41fd2f5e4130b32ffdb93ebae8b3dbe638c23575912276fc9c',
        Equivalent: 'docker.io/library/dbcc1c35ac38df41fd2f5e4130b32ffdb93ebae8b3dbe638c23575912276fc9c',
      },
      {
        Reference: 'dbcc1c35ac38df41fd2f5e4130b32ffdb93ebae8b3dbe638c23575912276fc9c',
        Expected: 'sha256:dbcc1c35ac38df41fd2f5e4130b32ffdb93ebae8b3dbe638c23575912276fc9c',
        Equivalent: 'sha256:dbcc1c35ac38df41fd2f5e4130b32ffdb93ebae8b3dbe638c23575912276fc9c',
        Digests: [
          'sha256:dbcc1c35ac38df41fd2f5e4130b32ffdb93ebae8b3dbe638c23575912276fc9c',
          'sha256:abcc1c35ac38df41fd2f5e4130b32ffdb93ebae8b3dbe638c23575912276fc9c',
        ],

      },
      {
        Reference: 'dbcc1c35ac38df41fd2f5e4130b32ffdb93ebae8b3dbe638c23575912276fc9',
        Equivalent: 'docker.io/library/dbcc1c35ac38df41fd2f5e4130b32ffdb93ebae8b3dbe638c23575912276fc9',
        Digests: ['sha256:abcc1c35ac38df41fd2f5e4130b32ffdb93ebae8b3dbe638c23575912276fc9c'],
      },

      {
        Reference: 'dbcc1c',
        Expected: 'sha256:dbcc1c35ac38df41fd2f5e4130b32ffdb93ebae8b3dbe638c23575912276fc9c',
        Equivalent: 'sha256:dbcc1c35ac38df41fd2f5e4130b32ffdb93ebae8b3dbe638c23575912276fc9c',
        Digests: [
          'sha256:dbcc1c35ac38df41fd2f5e4130b32ffdb93ebae8b3dbe638c23575912276fc9c',
          'sha256:abcc1c35ac38df41fd2f5e4130b32ffdb93ebae8b3dbe638c23575912276fc9c',
        ],
      },

      {
        Reference: 'dbcc1',
        Equivalent: 'docker.io/library/dbcc1',
        Digests: [
          'sha256:dbcc1c35ac38df41fd2f5e4130b32ffdb93ebae8b3dbe638c23575912276fc9c',
          'sha256:abcc1c35ac38df41fd2f5e4130b32ffdb93ebae8b3dbe638c23575912276fc9c',
        ],
      },
      {
        Reference: 'dbcc1c',
        Equivalent: 'docker.io/library/dbcc1c',
        Digests: ['sha256:abcc1c35ac38df41fd2f5e4130b32ffdb93ebae8b3dbe638c23575912276fc9c'],
      },
    ];
    CASES.forEach(({ Digests, Reference, Equivalent, Expected }: Object) => {
      if (Digests) {
        expect(
          normalizedNameToString(ParseNormalizedNamed(Reference, Digests)),
        ).toEqual(Equivalent);
      }
      if (Expected) {
        expect(
          normalizedNameToString(ParseNormalizedNamed(Reference)),
        ).toEqual(Expected);
      }
    });
  });
});


// func TestParseAnyReference(t *testing.T) {
//   tcases := []struct {
//     Reference  string
//     Equivalent string
//     Expected   Reference
//     Digests    []digest.Digest
//   }{
//
//   }
//
//   for _, tcase := range tcases {
//     var ref Reference
//     var err error
//     if len(tcase.Digests) == 0 {
//       ref, err = ParseAnyReference(tcase.Reference)
//     } else {
//       ds := digestset.NewSet()
//       for _, dgst := range tcase.Digests {
//         if err := ds.Add(dgst); err != nil {
//           t.Fatalf("Error adding digest %s: %v", dgst.String(), err)
//         }
//       }
//       ref, err = ParseAnyReferenceWithSet(tcase.Reference, ds)
//     }
//     if err != nil {
//       t.Fatalf("Error parsing reference %s: %v", tcase.Reference, err)
//     }
//     if ref.String() != tcase.Equivalent {
//       t.Fatalf("Unexpected string: %s, expected %s", ref.String(), tcase.Equivalent)
//     }
//
//     expected := tcase.Expected
//     if expected == nil {
//       expected, err = Parse(tcase.Equivalent)
//       if err != nil {
//         t.Fatalf("Error parsing reference %s: %v", tcase.Equivalent, err)
//       }
//     }
//     if !equalReference(ref, expected) {
//       t.Errorf("Unexpected reference %#v, expected %#v", ref, expected)
//     }
//   }
// }
//
// func TestNormalizedSplitHostname(t *testing.T) {
//   testcases := []struct {
//     input  string
//     domain string
//     name   string
//   }{
//     {
//       input:  "test.com/foo",
//         domain: "test.com",
//       name:   "foo",
//     },
//     {
//       input:  "test_com/foo",
//         domain: "docker.io",
//       name:   "test_com/foo",
//     },
//     {
//       input:  "docker/migrator",
//         domain: "docker.io",
//       name:   "docker/migrator",
//     },
//     {
//       input:  "test.com:8080/foo",
//         domain: "test.com:8080",
//       name:   "foo",
//     },
//     {
//       input:  "test-com:8080/foo",
//         domain: "test-com:8080",
//       name:   "foo",
//     },
//     {
//       input:  "foo",
//         domain: "docker.io",
//       name:   "library/foo",
//     },
//     {
//       input:  "xn--n3h.com/foo",
//         domain: "xn--n3h.com",
//       name:   "foo",
//     },
//     {
//       input:  "xn--n3h.com:18080/foo",
//         domain: "xn--n3h.com:18080",
//       name:   "foo",
//     },
//     {
//       input:  "docker.io/foo",
//         domain: "docker.io",
//       name:   "library/foo",
//     },
//     {
//       input:  "docker.io/library/foo",
//         domain: "docker.io",
//       name:   "library/foo",
//     },
//     {
//       input:  "docker.io/library/foo/bar",
//         domain: "docker.io",
//       name:   "library/foo/bar",
//     },
//   }
//   for _, testcase := range testcases {
//     failf := func(format string, v ...interface{}) {
//       t.Logf(strconv.Quote(testcase.input)+": "+format, v...)
//       t.Fail()
//     }
//
//     named, err := ParseNormalizedNamed(testcase.input)
//     if err != nil {
//       failf("error parsing name: %s", err)
//     }
//     domain, name := SplitHostname(named)
//     if domain != testcase.domain {
//       failf("unexpected domain: got %q, expected %q", domain, testcase.domain)
//     }
//     if name != testcase.name {
//       failf("unexpected name: got %q, expected %q", name, testcase.name)
//     }
//   }
// }
//
// func TestMatchError(t *testing.T) {
//   named, err := ParseAnyReference("foo")
//   if err != nil {
//     t.Fatal(err)
//   }
//   _, err = FamiliarMatch("[-x]", named)
//   if err == nil {
//     t.Fatalf("expected an error, got nothing")
//   }
// }
//
// func TestMatch(t *testing.T) {
//   matchCases := []struct {
//     reference string
//     pattern   string
//     expected  bool
//   }{
//     {
//       reference: "foo",
//         pattern:   "foo/**/ba[rz]",
//       expected:  false,
//     },
//     {
//       reference: "foo/any/bat",
//         pattern:   "foo/**/ba[rz]",
//       expected:  false,
//     },
//     {
//       reference: "foo/a/bar",
//         pattern:   "foo/**/ba[rz]",
//       expected:  true,
//     },
//     {
//       reference: "foo/b/baz",
//         pattern:   "foo/**/ba[rz]",
//       expected:  true,
//     },
//     {
//       reference: "foo/c/baz:tag",
//         pattern:   "foo/**/ba[rz]",
//       expected:  true,
//     },
//     {
//       reference: "foo/c/baz:tag",
//         pattern:   "foo/*/baz:tag",
//       expected:  true,
//     },
//     {
//       reference: "foo/c/baz:tag",
//         pattern:   "foo/c/baz:tag",
//       expected:  true,
//     },
//     {
//       reference: "example.com/foo/c/baz:tag",
//         pattern:   "*/foo/c/baz",
//       expected:  true,
//     },
//     {
//       reference: "example.com/foo/c/baz:tag",
//         pattern:   "example.com/foo/c/baz",
//       expected:  true,
//     },
//   }
//   for _, c := range matchCases {
//     named, err := ParseAnyReference(c.reference)
//     if err != nil {
//       t.Fatal(err)
//     }
//     actual, err := FamiliarMatch(c.pattern, named)
//     if err != nil {
//       t.Fatal(err)
//     }
//     if actual != c.expected {
//       t.Fatalf(
//         "expected %s match %s to be %v, was %v", c.reference, c.pattern, c.expected, actual)
//     }
//   }
// }
