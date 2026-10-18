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

## npm releases (Trusted Publishing / OIDC)

This repository uses [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/) with GitHub Actions. No persistent `NPM_TOKEN` or `NODE_AUTH_TOKEN` secret is required.

### First release (one-time setup)

npm requires the package to exist before a Trusted Publisher can be configured. If the package has not been published yet, its npm owner must bootstrap it locally:

```sh
npm login
npm install
npm test
npm publish --access public
```

Keep the version in `package.json` synchronized with the first published version. Do **not** push a matching tag for the manually published version.

### Enable Trusted Publishing

1. Open `https://www.npmjs.com/package/prettier-plugin-angular-comment/access` or the package's npm settings, then **Trusted publishing** → **Add trusted publisher** → **GitHub Actions**.
2. Enter **Organization/user**: `Angular-RU`, **Repository**: `prettier-plugin-angular-comment`, **Workflow filename**: `publish.yml` (not a path), **Environment**: `npm-publish`.
3. Enable **Allow npm publish** in the npm trusted publisher's allowed actions. Staging-only permission is insufficient for this workflow.
4. In GitHub **Settings → Environments**, create or configure `npm-publish`. Add **required reviewers** and deployment-tag restrictions if desired, so a release requires approval.
5. Complete the first successful OIDC publication within **2 days** of creating the trusted publisher, or recreate the expired configuration.

### Publish the next version

Update `package.json` to an unpublished version (for example, `0.1.1`), merge it to `main`, and confirm CI is green. Then push the corresponding tag **from a commit on main**:

```sh
git switch main
git pull --ff-only
git tag v0.1.1
git push origin v0.1.1
```

The [publish workflow](./.github/workflows/publish.yml) verifies the exact version and that the tag commit is on `main`, runs tests without OIDC permissions, and publishes in a separate approval-gated environment. The publisher job disables npm lifecycle scripts and uses npm's short-lived OIDC authentication and automatic provenance. Pinned GitHub Action commit SHAs and disabled release-job caching reduce supply-chain risk.

**After the first successful OIDC release**, consider selecting **Require two-factor authentication and disallow tokens** under npm **Settings → Publishing access**, and protect release tags with a GitHub ruleset. Traditional npm token publishing will then be blocked while OIDC continues working.

## License

MIT
