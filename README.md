# NfuncM Package

Assists in packaging code to be ready to be consumed as an NfuncM Function.

## Usage

To use, just navigate to the directory where your function lives, and run:

```shell
nfuncm-pack
```

## What NfuncM Package Does

By default all NfuncM will do, is read your `package.json` for some data, such as the author of the application, the version, license, and some other details, and add those as a comment at the top of your output file.

Optionally, you can enable minification of your file, to ensure users get the smallest file possible.

If no minification is enabled, the source code file is modified in place, adding the top level comment.

A quick note about how the license is handled:
If no `license` key is found, but a license file is, that whole file will be added as a top level comment instead.
But if a `license` key exists, that will be used instead.

Example:

The data present in the `package.json`:

```json
{
  "name": "nfuncm-packager",
  "version": "1.0.0",
  "description": "Function packager for NfuncM",
  "main": "./src/index.js",
  "author": "confused-Techie",
  "license": "MIT"
}
```

The resulting comment:

```javascript
/**
  * nfuncm-packager
  * Version: 1.0.0
  *
  * Function packager for NfuncM
  *
  * Author: confused-Techie
  * License: MIT
  *
  */
```

## Configuration

If you'd like to enable minification there's a few ways this can be done:

First within the `nfm` object in your `package.json` add `minify`.

`minify` can be any of the following:

* Boolean: If a boolean `true` is used as the value of `nfm.minify` then minification is enabled with NfuncM's defaults as well as all [`terser`](https://github.com/terser/terser) defaults.
* String: If a `string` is specified then this path will be used instead of the default path when saving the new minified file.
* Object: If `minify` is an `object` this object will instead be used to control all options passed to [`terser`](https://github.com/terser/terser) allowing `terser`s default, and NfuncM's defaults to all be overridden.

### Defaults

Without modification from the above options these are the following defaults for minification behavior:

* Minify Options: All of `terser`s defaults, as well as the following options are changed:
    - `sourceMap`: `false`
    - `compress.drop_console`: `true`
    - `compress.drop_debugger`: `true`
* Minify File Path: By default the new file will be save to `./dist/Original File Name`
* Minification Enabled: By default minification is not enabled, unless the `nfm.minify` key is present, in any of the above forms.
