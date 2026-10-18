# prettier-plugin-angular-comment

Format Angular template literals in JavaScript and TypeScript with an explicit `/* Angular */` marker.

Community plugin implementing the behavior proposed in [prettier/prettier#20317](https://github.com/prettier/prettier/pull/20317) for [#17615](https://github.com/prettier/prettier/issues/17615), without changing Prettier core.

## Install

```sh
npm install -D prettier prettier-plugin-angular-comment
```

Configure Prettier:

```json
{ "plugins": ["prettier-plugin-angular-comment"] }
```

## Usage

```ts
const template = /* Angular */ `
  @if (visible) {
    <span>{{ name }}</span>
  } @else {
    <span>Hidden</span>
  }
`;
```

The marker is case sensitive and applies only to the following template literal. Existing HTML comments, normal templates, and Angular component templates continue to use Prettier's built-in formatting. JS template expressions (`${value}`) are supported. Changing whitespace inside a template can change its runtime string value; opt in only where appropriate.

## API

```js
import * as prettier from "prettier";
import * as plugin from "prettier-plugin-angular-comment";
const result = await prettier.format(source, { parser: "typescript", plugins: [plugin] });
```

Set `embeddedLanguageFormatting: "off"` to disable the plugin's embedding, along with other embedded formatting.

## Requirements and limitations

- Prettier 3.x / Node 18+.
- Supports JS/TS parsers backed by the built-in `estree` printer.
- May conflict with another plugin that also overrides `estree.embed`. Check plugin order.
- Invalid Angular embedded syntax falls back to normal formatting, consistent with Prettier's embed error handling.

## Development

```sh
npm install
npm test
npm pack --dry-run
```

## npm releases

Create the npm package first if it does not yet exist. Configure [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/) for `Angular-RU/prettier-plugin-angular-comment` and the workflow `publish.yml`; trusted publishing requires an existing npm package and matching owner access. After merging a version bump, push its matching `vX.Y.Z` Git tag. The GitHub Actions workflow tests and publishes via OIDC. Never put a long-lived npm token in the repository.

## License

MIT
