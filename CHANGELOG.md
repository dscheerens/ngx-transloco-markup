# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [6.0.2](https://github.com/dscheerens/ngx-transloco-markup/compare/v6.0.1...v6.0.2) (2024-04-10)


### Bug Fixes

* incorrect peer dependency for transloco ([e6dd604](https://github.com/dscheerens/ngx-transloco-markup/commit/e6dd60416810f5dba60548bd8ed0c71ff1ca9782))

### [6.0.1](https://github.com/dscheerens/ngx-transloco-markup/compare/v6.0.0...v6.0.1) (2024-04-10)


### Bug Fixes

* incorrect peer dependency for transloco ([ffd55fd](https://github.com/dscheerens/ngx-transloco-markup/commit/ffd55fd9eb1d4d0f92a68b357e9897850cb704e9))

## [6.0.0](https://github.com/dscheerens/ngx-transloco-markup/compare/v5.2.0...v6.0.0) (2024-04-09)


### ⚠ BREAKING CHANGES

* peer dependencies have been updated to require at least Angular 17.0.0 and Transloco 7.0.0

### Features

* support Transloco version 7 ([3c30294](https://github.com/dscheerens/ngx-transloco-markup/commit/3c30294d561d5e93790c133df5ff0040a90e3b11))

## [5.2.0](https://github.com/dscheerens/ngx-transloco-markup/compare/v5.1.0...v5.2.0) (2024-03-12)


### Features

* support Transloco version 6 ([1272cd9](https://github.com/dscheerens/ngx-transloco-markup/commit/1272cd9392f1d7f2ce08ff68c45731ec69a4c8bd))

## [5.1.0](https://github.com/dscheerens/ngx-transloco-markup/compare/v5.0.1...v5.1.0) (2023-08-31)


### Features

* support rendering of pre-translated content ([df047b6](https://github.com/dscheerens/ngx-transloco-markup/commit/df047b6293087728995f0d58f5bafe6a7b7d6bc3))

## [5.0.0](https://github.com/dscheerens/ngx-transloco-markup/compare/v4.0.0...v5.0.0) (2023-08-09)


### ⚠ BREAKING CHANGES

* peer dependencies have been updated to require at least Angular 16.0.0 and Transloco 5.0.0

### Features

* support Transloco v5 ([f5679ea](https://github.com/dscheerens/ngx-transloco-markup/commit/f5679eaa5669033c347dc59a6e66bfacffdfb283))

## [4.0.0](https://github.com/dscheerens/ngx-transloco-markup/compare/v3.1.0...v4.0.0) (2022-07-27)


### ⚠ BREAKING CHANGES

* this library now requires Angular 14 (or higher), older versions are no longer supported

### Features

* support direct imports of the `TranslocoMarkupComponent` in standalone components ([9348144](https://github.com/dscheerens/ngx-transloco-markup/commit/93481443822cf48bd93784d15e00ad0fc076d2fd))

## [3.1.0](https://github.com/dscheerens/ngx-transloco-markup/compare/v3.0.0...v3.1.0) (2022-05-17)


### Features

* support Transloco v4 ([487f152](https://github.com/dscheerens/ngx-transloco-markup/commit/487f1526c6c631209796098bdcc1fa461da533ec))

## [3.0.0](https://github.com/dscheerens/ngx-transloco-markup/compare/v2.0.0...v3.0.0) (2021-12-24)


### ⚠ BREAKING CHANGES

* **deps:** peer dependencies have been updated to require at least Angular 13.0.0 and Transloco 3.0.0

* **deps:** upgrade to Angular 13 ([8958ccb](https://github.com/dscheerens/ngx-transloco-markup/commit/8958ccb60d25701a71fda8ec17179ba7ac0da8f2))

## [2.0.0](https://github.com/dscheerens/ngx-transloco-markup/compare/v1.0.0...v2.0.0) (2020-09-07)


### ⚠ BREAKING CHANGES

* to support the `transpileUntil` several API changes needed to be made

The token sequence has been removed as parameter from the `TranslationMarkupTranspiler.transpile` function and is now exposed via the `TranslationMarkupTranspilerContext.tokens` property instead.
Those changes also made the `TranslationMarkupTranspilerFunction` obsolete, which has therefore been removed.
* the type of the `TRANSLATION_MARKUP_TRANSPILER` injection token is changed from `TranslationMarkupTranspiler` to `RecursiveArray<TranslationMarkupTranspiler>`

If you are using the `TRANSLATION_MARKUP_TRANSPILER` injection token to inject the set of transpilers, then you might receive a multidimensional array of transpilers instead of a flat array or a scalar value. You can flatten this using the following expression: `Array.isArray(transpilers) ? transpilers.flat(Infinity) : [transpilers]`.
* due to the updated dependencies this package now requires at least Angular 10

### Features

* add `transpileUntil` function to `TranslationMarkupTranspilerContext` ([6060f32](https://github.com/dscheerens/ngx-transloco-markup/commit/6060f32b8971b19ed2251e00d74b36a234c3b135))
* add provider factory functions for translation markup transpilers and link renderers ([2825884](https://github.com/dscheerens/ngx-transloco-markup/commit/2825884f1873c3fe2a1d7e0af946499d6e3317d0))
* support transpiler inheritance from parent injectors ([9f8df90](https://github.com/dscheerens/ngx-transloco-markup/commit/9f8df90ea126081b2c625c27c878fb64c10ee87c))
* upgrade to Angular 10 ([314737b](https://github.com/dscheerens/ngx-transloco-markup/commit/314737b4994dab32bec8ce4eaece1cab4b65501d))
