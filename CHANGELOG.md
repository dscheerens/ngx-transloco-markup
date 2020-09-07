# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
