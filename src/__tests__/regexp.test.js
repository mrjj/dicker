const {
  anchoredDomainRegexp,
  anchoredNameRegexp,
  ReferenceRegexp,
  anchoredIdentifierRegexp,
  anchoredShortIdentifierRegexp,
} = require('../utils/regexp');

const checkRegexp = (regExp, { input, match }) => {
  expect(input.match(regExp) !== null).toEqual(match);
};

const A127 = new Array(127).map(() => 'a').join('');
describe('regexp module', () => {
  describe('anchoredDomainRegexp', () => {
    const check = input => checkRegexp(anchoredDomainRegexp, input);

    it('"test.com" - true', () => check({
      input: 'test.com',
      match: true,
    }));
    it('"test.com:10304" - true', () => check({
      input: 'test.com:10304',
      match: true,
    }));
    it('"test.com:http" - false', () => check({
      input: 'test.com:http',
      match: false,
    }));
    it('"localhost" - true', () => check({
      input: 'localhost',
      match: true,
    }));
    it('"localhost:8080" - true', () => check({
      input: 'localhost:8080',
      match: true,
    }));
    it('"a" - true', () => check({
      input: 'a',
      match: true,
    }));
    it('"a.b" - true', () => check({
      input: 'a.b',
      match: true,
    }));
    it('"ab.cd.com" - true', () => check({
      input: 'ab.cd.com',
      match: true,
    }));
    it('"a-b.com" - true', () => check({
      input: 'a-b.com',
      match: true,
    }));
    it('"-ab.com" - false', () => check({
      input: '-ab.com',
      match: false,
    }));
    it('"ab-.com" - false', () => check({
      input: 'ab-.com',
      match: false,
    }));
    it('"ab.c-om" - true', () => check({
      input: 'ab.c-om',
      match: true,
    }));
    it('"ab.-com" - false', () => check({
      input: 'ab.-com',
      match: false,
    }));
    it('"ab.com-" - false', () => check({
      input: 'ab.com-',
      match: false,
    }));
    it('"0101.com" - true', () => check({
      input: '0101.com',
      match: true, // TODO(dmcgowan): valid if this should be allowed
    }));
    it('"001a.com" - true', () => check({
      input: '001a.com',
      match: true,
    }));
    it('"b.gbc.io:443" - true', () => check({
      input: 'b.gbc.io:443',
      match: true,
    }));
    it('"b.gbc.io" - true', () => check({
      input: 'b.gbc.io',
      match: true,
    }));
    it('"xn--n3h.com" - true', () => check({
      input: 'xn--n3h.com', // ☃.com in punycode
      match: true,
    }));
    it('"Asdf.com" - true', () => check({
      input: 'Asdf.com', // uppercase character
      match: true,
    }));
  });

  describe('anchoredNameRegexp', () => {
    const check = input => checkRegexp(anchoredNameRegexp, input);

    it('"" - false', () => check({
      input: '',
      match: false,
    }));
    it('"short" - true', () => check({
      input: 'short',
      match: true,
      subs: ['', 'short'],
    }));
    it('"simple/name" - true', () => check({
      input: 'simple/name',
      match: true,
      subs: ['simple', 'name'],
    }));
    it('"library/ubuntu" - true', () => check({
      input: 'library/ubuntu',
      match: true,
      subs: ['library', 'ubuntu'],
    }));
    it('"docker/stevvooe/app" - true', () => check({
      input: 'docker/stevvooe/app',
      match: true,
      subs: ['docker', 'stevvooe/app'],
    }));
    it('"aa/aa/aa/aa/aa/aa/aa/aa/aa/bb/bb/bb/bb/bb/bb" - true', () => check({
      input: 'aa/aa/aa/aa/aa/aa/aa/aa/aa/bb/bb/bb/bb/bb/bb',
      match: true,
      subs: ['aa', 'aa/aa/aa/aa/aa/aa/aa/aa/bb/bb/bb/bb/bb/bb'],
    }));
    it('"aa/aa/bb/bb/bb" - true', () => check({
      input: 'aa/aa/bb/bb/bb',
      match: true,
      subs: ['aa', 'aa/bb/bb/bb'],
    }));
    it('"a/a/a/a" - true', () => check({
      input: 'a/a/a/a',
      match: true,
      subs: ['a', 'a/a/a'],
    }));
    it('"a/a/a/a/" - false', () => check({
      input: 'a/a/a/a/',
      match: false,
    }));
    it('"a//a/a" - false', () => check({
      input: 'a//a/a',
      match: false,
    }));
    it('"a" - true', () => check({
      input: 'a',
      match: true,
      subs: ['', 'a'],
    }));
    it('"a/aa" - true', () => check({
      input: 'a/aa',
      match: true,
      subs: ['a', 'aa'],
    }));
    it('"a/aa/a" - true', () => check({
      input: 'a/aa/a',
      match: true,
      subs: ['a', 'aa/a'],
    }));
    it('"foo.com" - true', () => check({
      input: 'foo.com',
      match: true,
      subs: ['', 'foo.com'],
    }));
    it('"foo.com/" - false', () => check({
      input: 'foo.com/',
      match: false,
    }));
    it('"foo.com:8080/bar" - true', () => check({
      input: 'foo.com:8080/bar',
      match: true,
      subs: ['foo.com:8080', 'bar'],
    }));
    it('"foo.com:http/bar" - false', () => check({
      input: 'foo.com:http/bar',
      match: false,
    }));
    it('"foo.com/bar" - true', () => check({
      input: 'foo.com/bar',
      match: true,
      subs: ['foo.com', 'bar'],
    }));
    it('"foo.com/bar/baz" - true', () => check({
      input: 'foo.com/bar/baz',
      match: true,
      subs: ['foo.com', 'bar/baz'],
    }));
    it('"localhost:8080/bar" - true', () => check({
      input: 'localhost:8080/bar',
      match: true,
      subs: ['localhost:8080', 'bar'],
    }));
    it('"sub-dom1.foo.com/bar/baz/quux" - true', () => check({
      input: 'sub-dom1.foo.com/bar/baz/quux',
      match: true,
      subs: ['sub-dom1.foo.com', 'bar/baz/quux'],
    }));
    it('"blog.foo.com/bar/baz" - true', () => check({
      input: 'blog.foo.com/bar/baz',
      match: true,
      subs: ['blog.foo.com', 'bar/baz'],
    }));
    it('"a^a" - false', () => check({
      input: 'a^a',
      match: false,
    }));
    it('"aa/asdf$$^/aa" - false', () => check({
      input: 'aa/asdf$$^/aa',
      match: false,
    }));
    it('"asdf$$^/aa" - false', () => check({
      input: 'asdf$$^/aa',
      match: false,
    }));
    it('"aa-a/a" - true', () => check({
      input: 'aa-a/a',
      match: true,
      subs: ['aa-a', 'a'],
    }));
    it(`"${`${A127}aa`}" - true`, () => check({
      input: `${A127}aa`,
      match: true,
      subs: ['a', A127],
    }));
    it('"a-/a/a/a" - false', () => check({
      input: 'a-/a/a/a',
      match: false,
    }));
    it('"foo.com/a-/a/a" - false', () => check({
      input: 'foo.com/a-/a/a',
      match: false,
    }));
    it('"-foo/bar" - false', () => check({
      input: '-foo/bar',
      match: false,
    }));
    it('"foo/bar-" - false', () => check({
      input: 'foo/bar-',
      match: false,
    }));
    it('"foo-/bar" - false', () => check({
      input: 'foo-/bar',
      match: false,
    }));
    it('"foo/-bar" - false', () => check({
      input: 'foo/-bar',
      match: false,
    }));
    it('"_foo/bar" - false', () => check({
      input: '_foo/bar',
      match: false,
    }));
    it('"foo_bar" - true', () => check({
      input: 'foo_bar',
      match: true,
      subs: ['', 'foo_bar'],
    }));
    it('"foo_bar.com" - true', () => check({
      input: 'foo_bar.com',
      match: true,
      subs: ['', 'foo_bar.com'],
    }));
    it('"foo_bar.com:8080" - false', () => check({
      input: 'foo_bar.com:8080',
      match: false,
    }));
    it('"foo_bar.com:8080/app" - false', () => check({
      input: 'foo_bar.com:8080/app',
      match: false,
    }));
    it('"foo.com/foo_bar" - true', () => check({
      input: 'foo.com/foo_bar',
      match: true,
      subs: ['foo.com', 'foo_bar'],
    }));
    it('"____/____" - false', () => check({
      input: '____/____',
      match: false,
    }));
    it('"_docker/_docker" - false', () => check({
      input: '_docker/_docker',
      match: false,
    }));
    it('"docker_/docker_" - false', () => check({
      input: 'docker_/docker_',
      match: false,
    }));
    it('"b.gcr.io/test.example.com/my-app" - true', () => check({
      input: 'b.gcr.io/test.example.com/my-app',
      match: true,
      subs: ['b.gcr.io', 'test.example.com/my-app'],
    }));
    it('"xn--n3h.com/myimage" - true', () => check({
      input: 'xn--n3h.com/myimage', // ☃.com in punycode
      match: true,
      subs: ['xn--n3h.com', 'myimage'],
    }));
    it('"xn--7o8h.com/myimage" - true', () => check({
      input: 'xn--7o8h.com/myimage', // 🐳.com in punycode
      match: true,
      subs: ['xn--7o8h.com', 'myimage'],
    }));
    it('"example.com/xn--7o8h.com/myimage" - true', () => check({
      input: 'example.com/xn--7o8h.com/myimage', // 🐳.com in punycode
      match: true,
      subs: ['example.com', 'xn--7o8h.com/myimage'],
    }));
    it('"example.com/some_separator__underscore/myimage" - true', () => check({
      input: 'example.com/some_separator__underscore/myimage',
      match: true,
      subs: ['example.com', 'some_separator__underscore/myimage'],
    }));
    it('"example.com/__underscore/myimage" - false', () => check({
      input: 'example.com/__underscore/myimage',
      match: false,
    }));
    it('"example.com/..dots/myimage" - false', () => check({
      input: 'example.com/..dots/myimage',
      match: false,
    }));
    it('"example.com/.dots/myimage" - false', () => check({
      input: 'example.com/.dots/myimage',
      match: false,
    }));
    it('"example.com/nodouble..dots/myimage" - false', () => check({
      input: 'example.com/nodouble..dots/myimage',
      match: false,
    }));
    it('"docker./docker" - false', () => check({
      input: 'docker./docker',
      match: false,
    }));
    it('".docker/docker" - false', () => check({
      input: '.docker/docker',
      match: false,
    }));
    it('"docker-/docker" - false', () => check({
      input: 'docker-/docker',
      match: false,
    }));
    it('"-docker/docker" - false', () => check({
      input: '-docker/docker',
      match: false,
    }));
    it('"do..cker/docker" - false', () => check({
      input: 'do..cker/docker',
      match: false,
    }));
    it('"do__cker:8080/docker" - false', () => check({
      input: 'do__cker:8080/docker',
      match: false,
    }));
    it('"do__cker/docker" - true', () => check({
      input: 'do__cker/docker',
      match: true,
      subs: ['', 'do__cker/docker'],
    }));
    it('"registry.io/foo/project--id.module--name.ver---sion--name" - true', () => check({
      input: 'registry.io/foo/project--id.module--name.ver---sion--name',
      match: true,
      subs: ['registry.io', 'foo/project--id.module--name.ver---sion--name'],
    }));
    it('"Asdf.com/foo/bar" - true', () => check({
      input: 'Asdf.com/foo/bar', // uppercase character in hostname
      match: true,
    }));
    it('"Foo/FarB" - false', () => check({
      input: 'Foo/FarB', // uppercase characters in remote name
      match: false,
    }));
  });

  describe('ReferenceRegexp', () => {
    const check = input => checkRegexp(ReferenceRegexp, input);

    it('"registry.com:8080/myapp:tag" - true', () => check({
      input: 'registry.com:8080/myapp:tag',
      match: true,
      subs: ['registry.com:8080/myapp', 'tag', ''],
    }));
    // it('"https://github.com/docker/docker" - true', () => check({
    //   input: 'https://github.com/docker/docker',
    //   match: true,
    //   subs: ['https://github.com/docker/docker', '', ''],
    // }));
    it('"registry.com:8080/myapp@sha256:be178c0543eb17f5f3043021c9e5fcf30285e557a4fc309cce97ff9ca6182912" - true', () => check({
      input: 'registry.com:8080/myapp@sha256:be178c0543eb17f5f3043021c9e5fcf30285e557a4fc309cce97ff9ca6182912',
      match: true,
      subs: [
        'registry.com:8080/myapp', '',
        'sha256:be178c0543eb17f5f3043021c9e5fcf30285e557a4fc309cce97ff9ca6182912',
      ],
    }));
    it('"registry.com:8080/myapp:tag2@sha256:be178c0543eb17f5f3043021c9e5fcf30285e557a4fc309cce97ff9ca6182912" - true', () => check({
      input: 'registry.com:8080/myapp:tag2@sha256:be178c0543eb17f5f3043021c9e5fcf30285e557a4fc309cce97ff9ca6182912',
      match: true,
      subs: [
        'registry.com:8080/myapp', 'tag2',
        'sha256:be178c0543eb17f5f3043021c9e5fcf30285e557a4fc309cce97ff9ca6182912',
      ],
    }));
    it('"registry.com:8080/myapp@sha256:badbadbadbad" - false', () => check({
      input: 'registry.com:8080/myapp@sha256:badbadbadbad',
      match: false,
    }));
    it('"registry.com:8080/myapp:invalid~tag" - false', () => check({
      input: 'registry.com:8080/myapp:invalid~tag',
      match: false,
    }));
    it('"bad_hostname.com:8080/myapp:tag" - false', () => check({
      input: 'bad_hostname.com:8080/myapp:tag',
      match: false,
    }));
    // localhost treated as name, missing tag with 8080 as tag
    it('"localhost:8080@sha256:be178c0543eb17f5f3043021c9e5fcf30285e557a4fc309cce97ff9ca6182912" - true', () => check({
      input: 'localhost:8080@sha256:be178c0543eb17f5f3043021c9e5fcf30285e557a4fc309cce97ff9ca6182912',
      match: true,
      subs: [
        'localhost',
        '8080',
        'sha256:be178c0543eb17f5f3043021c9e5fcf30285e557a4fc309cce97ff9ca6182912',
      ],
    }));
    it('"localhost:8080/name@sha256:be178c0543eb17f5f3043021c9e5fcf30285e557a4fc309cce97ff9ca6182912" - true', () => check({
      input: 'localhost:8080/name@sha256:be178c0543eb17f5f3043021c9e5fcf30285e557a4fc309cce97ff9ca6182912',
      match: true,
      subs: [
        'localhost:8080/name',
        '',
        'sha256:be178c0543eb17f5f3043021c9e5fcf30285e557a4fc309cce97ff9ca6182912',
      ],
    }));
    it('"localhost:http/name@sha256:be178c0543eb17f5f3043021c9e5fcf30285e557a4fc309cce97ff9ca6182912" - false', () => check({
      input: 'localhost:http/name@sha256:be178c0543eb17f5f3043021c9e5fcf30285e557a4fc309cce97ff9ca6182912',
      match: false,
    }));
    // localhost will be treated as an image name without a host
    it('"localhost@sha256:be178c0543eb17f5f3043021c9e5fcf30285e557a4fc309cce97ff9ca6182912" - true', () => check({
      input: 'localhost@sha256:be178c0543eb17f5f3043021c9e5fcf30285e557a4fc309cce97ff9ca6182912',
      match: true,
      subs: [
        'localhost',
        '',
        'sha256:be178c0543eb17f5f3043021c9e5fcf30285e557a4fc309cce97ff9ca6182912',
      ],
    }));
    it('"registry.com:8080/myapp@bad" - false', () => check({
      input: 'registry.com:8080/myapp@bad',
      match: false,
    }));
    it('"registry.com:8080/myapp@2bad" - false', () => check({
      input: 'registry.com:8080/myapp@2bad',
      match: false, // TODO(dmcgowan): Support this as valid
    }));
  });

  describe('anchoredIdentifierRegexp', () => {
    const check = input => checkRegexp(anchoredIdentifierRegexp, input);
    it('"da304e823d8ca2b9d863a3c897baeb852ba21ea9a9f1414736394ae7fcaf9821" - true', () => check({
      input: 'da304e823d8ca2b9d863a3c897baeb852ba21ea9a9f1414736394ae7fcaf9821',
      match: true,
    }));

    it('"7EC43B381E5AEFE6E04EFB0B3F0693FF2A4A50652D64AEC573905F2DB5889A1C" - false', () => check({
      input: '7EC43B381E5AEFE6E04EFB0B3F0693FF2A4A50652D64AEC573905F2DB5889A1C',
      match: false,
    }));

    it('"da304e823d8ca2b9d863a3c897baeb852ba21ea9a9f1414736394ae7fcaf" - false', () => check({
      input: 'da304e823d8ca2b9d863a3c897baeb852ba21ea9a9f1414736394ae7fcaf',
      match: false,
    }));

    it('"sha256:da304e823d8ca2b9d863a3c897baeb852ba21ea9a9f1414736394ae7fcaf9821" - false', () => check({
      input: 'sha256:da304e823d8ca2b9d863a3c897baeb852ba21ea9a9f1414736394ae7fcaf9821',
      match: false,
    }));

    it('"da304e823d8ca2b9d863a3c897baeb852ba21ea9a9f1414736394ae7fcaf98218482" - false', () => check({
      input: 'da304e823d8ca2b9d863a3c897baeb852ba21ea9a9f1414736394ae7fcaf98218482',
      match: false,
    }));
  });

  describe('anchoredShortIdentifierRegexp', () => {
    const check = input => checkRegexp(anchoredShortIdentifierRegexp, input);
    it('"da304e823d8ca2b9d863a3c897baeb852ba21ea9a9f1414736394ae7fcaf9821" - true', () => check({
      input: 'da304e823d8ca2b9d863a3c897baeb852ba21ea9a9f1414736394ae7fcaf9821',
      match: true,
    }));

    it('"7EC43B381E5AEFE6E04EFB0B3F0693FF2A4A50652D64AEC573905F2DB5889A1C" - false', () => check({
      input: '7EC43B381E5AEFE6E04EFB0B3F0693FF2A4A50652D64AEC573905F2DB5889A1C',
      match: false,
    }));

    it('"da304e823d8ca2b9d863a3c897baeb852ba21ea9a9f1414736394ae7fcaf" - true', () => check({
      input: 'da304e823d8ca2b9d863a3c897baeb852ba21ea9a9f1414736394ae7fcaf',
      match: true,
    }));

    it('"sha256:da304e823d8ca2b9d863a3c897baeb852ba21ea9a9f1414736394ae7fcaf9821" - false', () => check({
      input: 'sha256:da304e823d8ca2b9d863a3c897baeb852ba21ea9a9f1414736394ae7fcaf9821',
      match: false,
    }));

    it('"da304e823d8ca2b9d863a3c897baeb852ba21ea9a9f1414736394ae7fcaf98218482" - false', () => check({
      input: 'da304e823d8ca2b9d863a3c897baeb852ba21ea9a9f1414736394ae7fcaf98218482',
      match: false,
    }));

    it('"da304" - false', () => check({
      input: 'da304',
      match: false,
    }));

    it('"da304e" - true', () => check({
      input: 'da304e',
      match: true,
    }));
  });
});
