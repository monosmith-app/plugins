# plugins

The MonoSmith plugin marketplace: the list of plugins that `smith` can find and install by name.

The marketplace holds an index, not code. Each entry points to a plugin archive (made by
`smith plugin pack`) and gives its SHA-256. smith downloads the archive, checks the digest,
installs it without running it, and never trusts it for you.

## Use it

```sh
smith plugin search            # list every plugin
smith plugin search deploy     # search names, descriptions, roles, kinds and languages
smith plugin install widget            # the newest version
smith plugin install widget@1.2.0      # one version
```

After the install, `smith plugin trust widget` is still your decision. A plugin runs with your
privileges. Read it before you trust it.

smith reads `https://raw.githubusercontent.com/monosmith-app/plugins/main/index.json`. To use
another index (a fork, a mirror, a private list), set it in `smith.toml`:

```toml
[plugins]
marketplace = "https://example.com/plugins/index.json"
```

or in the environment: `SMITH_MARKETPLACE=https://example.com/plugins/index.json`. The variable wins.
A local file path also works.

While this repository is private, smith sends a token to GitHub only: `GITHUB_TOKEN` or
`GH_TOKEN`, else the token of `gh auth token` when the GitHub CLI is installed. With none, smith
says what to set.

## The index

`index.json` follows [`index.schema.json`](index.schema.json):

```json
{
  "schema": 1,
  "plugins": {
    "widget": {
      "description": "Scaffolds widget projects",
      "roles": ["scaffold"],
      "kinds": ["widget"],
      "languages": ["go"],
      "homepage": "https://github.com/acme/smith-plugin-widget",
      "license": "MIT",
      "versions": {
        "1.2.0": {
          "url": "https://github.com/acme/smith-plugin-widget/releases/download/v1.2.0/widget-1.2.0.smith-plugin.zip",
          "sha256": "<64 lowercase hex characters>"
        }
      }
    }
  }
}
```

This is a format example, not an entry. The index lists plugins sorted by name. The archive file
name is `<name>-<version>.smith-plugin.zip`. `roles`, `kinds`, `languages` and `homepage` are optional.

## Check the index

```sh
npm install
npm run validate          # schema, order, file names
npm run validate:online   # also downloads each archive and compares its sha256
```

The same checks run in GitHub Actions on every pull request and each week.

To publish a plugin, read [CONTRIBUTING.md](CONTRIBUTING.md).
