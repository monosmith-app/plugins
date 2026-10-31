# Contributing a plugin

You add a plugin to the marketplace with one pull request that edits `index.json`.

## Before you start

1. Write the plugin and test it (`smith plugin check <path>`).
2. Pack it: `smith plugin pack` makes `<name>-<version>.smith-plugin.zip` and a `.sha256` file.
3. Publish the archive at a stable https URL, for example a GitHub release asset. The file must never change
   after you list it. A new build is a new version.

## Add an entry

1. Fork this repository.
2. In `index.json`, add your plugin under `plugins`, in alphabetical order. Add a new object under
   `versions` for a new release of a plugin that is already listed. Never edit or remove a version
   that people may have installed.
3. Fill in:
   - `description`: one sentence, 200 characters at most.
   - `license`: an SPDX identifier.
   - `roles`, `kinds`, `languages`: what the plugin does, so `smith plugin search` finds it.
   - `homepage`: where users read about it and report problems.
   - `versions.<x.y.z>.url` and `.sha256`: the archive URL and the digest from the `.sha256` file.
4. Run `npm install` and `npm run validate:online`. Fix every error.
5. Open the pull request. The `validate` workflow runs the same checks.

The plugin `name` in your `plugin.json`, the key in `index.json` and the archive name must all be the
same name. Names are lowercase letters, digits and dashes.

## Rules

- The archive must be what `smith plugin pack` makes. smith refuses anything else.
- The plugin must not need to run anything at install time. smith never starts it before the user trusts it.
- No secret, token or personal data in the archive.
- A name belongs to the first author who lists it. Only that author changes it.
- The maintainers can remove an entry that is unsafe or abandoned.
- Listing a plugin is not a review of its code. The digest says the archive is the one you published.
  It does not say who you are or that the code is safe.
