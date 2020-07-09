[![Build Status](https://api.travis-ci.org/dscheerens/ngx-transloco-markup.svg?branch=master)](https://travis-ci.org/dscheerens/ngx-transloco-markup) [![NPM Version](https://img.shields.io/npm/v/ngx-transloco-markup.svg)](https://www.npmjs.com/package/ngx-transloco-markup)

# ngx-transloco-markup: Markup support for Transloco

This library is an extension for [Transloco](https://github.com/ngneat/transloco) that provides support for displaying translations with markup.
**ngx-transloco-markup** offers an alternative to the Transloco [directive](https://ngneat.github.io/transloco/docs/translation-in-the-template#structural-directive) and [pipe](https://ngneat.github.io/transloco/docs/translation-in-the-template#pipe): the `<transloco>` component, that takes care of rendering your translations with markup.
By using this component, you no longer need to split your translations or use a `[innerHtml]`-binding.
This allows for a much simpler syntax in your translation files and you no longer need to worry about potential markup-injection issues that could cause the layout of your application to break.

While this library ships with support for the most common markup use cases, you might wish to create your own customized markup rendering.
Fortunately, thanks to the extensible architecture, you can do this quite easily.

## Table of contents

- [Installation](#installation)
- [Getting started](#getting-started)
- [`<transloco>` component API](#transloco-component-api)
- [Defining markup transpiler availability](#defining-markup-transpiler-availability)
- [Contextual links](#contextual-links)
- [Creating your own markup transpilers](#creating-your-own-markup-transpilers)
  - [Tokenization](#tokenization)
  - [Transpilation](#transpilation)
  - [Custom transpiler example: colored text](#custom-transpiler-example-colored-text)
- [Further customization](#further-customization)
  - [Custom string interpolation expressions](#custom-string-interpolation-expressions)
  - [Supporting additional link model types](#supporting-additional-link-model-types)

## Installation

Since this library is an extension for Transloco, first make sure your application has been configured to use transloco.
If this is not the case follow the easy [installation instructions](https://ngneat.github.io/transloco/docs/installation) from Transloco.

Next you'll need to install the `ngx-transloco-markup` package from NPM:

```shell
npm install --save ngx-transloco-markup
```

If you are using the Angular CLI to build and test your application, then this all you need to do for the installation.
For custom build setups: the library is published in the [Angular Package Format](https://docs.google.com/document/d/1CZC2rcpxffTDfRDs6p1cfbmKNLA6x5O-NtkJglDaBVs/preview), so it provides several distribution bundles that are compatible with most build tools.

## Getting started

After having installed the `ngx-transloco-markup` package you can now add support for translation markup rendering to your application.

A quick word about the architecture needed here.
This library depends on so called _translation markup transpilers_.
These small units are responsible for parsing the translation values and converting them into rendering functions.
For the `<transloco>` component (provided by this library) you need to specify which transpilers will be used and at what level.
In this section we're just going to cover a simple setup that works for most applications.
Keep in mind, however, that you can completely customize the transpiler configuration.
That will be covered in later sections.

First let's add the default transpilers to the root module of your application (usually called `AppModule`):

```typescript
import { defaultTranslocoMarkupTranspilers } from 'ngx-transloco-markup';

@NgModule({
  providers: [
    defaultTranslocoMarkupTranspilers() // <-- Add this line to the providers array
  ]
})
export class AppModule { }
```

This registers the default transpilers and makes them globally available wherever you use the `<transloco>` component.
When including the default transpilers, the following markup is supported:

* Bold text: `[b]...[/b]`
* Italic text: `[i]...[/i]`
* Links: `[link:parameterKey]...[/link]`, where `parameterKey` should be replaced with a key of the translation parameter that contains the URL or link object.
  Note that there is a better alternative to defining links in your translation values, by making use of [contextual link tokens](#contextual-links).

Next, you will need to add the `TranslocoMarkupModule` to the module(s) in which you want to use the `<transloco>` component:

```typescript
import { TranslocoMarkupModule } from 'ngx-transloco-markup';

@NgModule({
  imports: [
    TranslocoMarkupModule // <-- Add this line to the imports array
  ]
})
export class ExampleModule { }
```

Once the `TranslocoMarkupModule` has been imported, you will be able to use the `<transloco>` component in your templates.
As an example, suppose your (English) translation file contains the following entry:

```json
{
  "GREETING": "Hello [b]{{ name }}[/b], please visit my [link:website]website[/link]"
}
```

When the `GREETING` entry is rendered by the `<transloco>` component, it will display the text and renders the value of the `name` parameter in a bold font.
Also, the _website_ text will be rendered as a link that points to the value of the `website` translation parameter.
The code snippet below shows an example of how this would be used in a component.

```typescript
@Component({
  selector: 'app-example',
  template: `
    <transloco
      [key]="'GREETING'"
      [params]="{ name: firstName + ' ' + lastName, website: 'https://www.example.com/' }"
    ></transloco>
  `
})
export class ExampleComponent {
  public firstName = 'John';
  public lastName = 'Doe';
}
```

## `<transloco>` component API

The `<transloco>` component has the following input properties:

* **`key`** (_string_)

  Key that defines which translation value should be displayed.
  If no key is specified or the key is `undefined`, nothing will be displayed by the `<transloco>` component.

* **`params`** ([_HashMap_](https://github.com/ngneat/transloco/blob/v2.17.2/projects/ngneat/transloco/src/lib/types.ts#L1))

  An object containing the translation parameters, which will be used to expand interpolation expressions (`{{ paramKey }}`).

* **`lang`** (string)

  Language in which the text should be displayed.
  Usually you do not need to specify this, unless you want to override the default language.
  The default language is either the current language of the [`TranslocoService`](https://github.com/ngneat/transloco/blob/v2.17.2/projects/ngneat/transloco/src/lib/transloco.service.ts), or the language that was specified using the [`TRANSLOCO_LANG`](https://github.com/ngneat/transloco/blob/v2.17.2/projects/ngneat/transloco/src/lib/transloco-lang.ts) injection token.

* **`scope`** (string)

  Scope which is to be used.
  If this property is specified it will override the scope provide via the [`TRANSLOCO_SCOPE`](https://github.com/ngneat/transloco/blob/v2.17.2/projects/ngneat/transloco/src/lib/transloco-scope.ts) injection token.

* **`transpilers`** (_TranslationMarkupTranspiler | TranslationMarkupTranspiler[]_)

  Transpilers that will be available for rendering the translation value.
  These are merged with transpilers provided via dependency injection, unless the `mergeTranspilers` option is set to `false` (see below).
  When the transpilers are merged, inline providers will take precedence over the provided transpilers.

* **`mergeTranspilers`** (_boolean_)

  Specifies whether the inline transpilers are merged with the provided transpilers.
  When set to `false`, only the inline transpilers will be used, unless no inline transpilers have been specified.
  Defaults to `true`.

## Defining markup transpiler availability

As mentioned before, one of the features of `ngx-transloco-markup` is that you have full control over which transpilers will be available and at what level.
This allows you to limit the markup options to just what is necessary within a particular context.

The [getting started](#getting-started) section demonstrated how to make the default transpilers available everywhere in the application by providing them in the application root module.
If you do not wish for a transpiler to be available everywhere, but only for a part of the application you can specify it at a different level:

* **inline** - the narrowest scope at which a transpiler can be made available.
  Pass the transpiler instance to the `transpilers` input property of the `<transloco>` component.
  This will make the transpiler available just for that particular use of the `<transloco>` component.

* **component** - defined as part of the providers array of a component, e.g.:
  ```typescript
  @Component({
    selector: 'app-fancy-something'
    template: 'A very [rainbow]colorful[/rainbow] text!',
    providers: [
      { provide: TRANSLATION_MARKUP_TRANSPILER, useClass: RainbowTextTranspiler, multi: true }
    ]
  })
  export class FancyComponent { }
  ```
  When a transpiler is defined in this way, all usages of the `<transloco>` component will support the
  transpiler within the context of the `FancyComponent` context.
  This includes both the template of the component itself, but also for all child components that might be using the `<transloco>` component.

* **lazy-loaded module** - defined in the providers array of a lazy loaded module.
  This will make the transpiler available within all components that are part of the lazy
  loaded module.
  Note that the transpiler does not necessarily need to be defined in the root of the lazy loaded module.
  If one if the transitively imported modules specifies a provider for the transpiler, then it will be
  available for the whole lazy loaded module.

* **root module** - defined in the providers array of the root (application) module, or in one of the transitively imported modules.
  A markup transpiler provider that is defined in this way will be available everywhere in the application, meaning this is the widest scope at which a transpiler can be defined.

The **component**, **lazy-loaded module** and **root module** transpiler levels all make use of Angular's dependency injection system.
A tranpsiler defined at one of those levels needs to be specified using the `TRANSLATION_MARKUP_TRANSPILER` injection token and it also needs to be a multi provider (`multi: true`).

Note that the provided transpilers can be discarded for a particular usage of the `<transloco>` component, by setting the `mergeTranspilers` input property to `false`.

## Contextual links

The default providers you get out-of-the-box with `defaultTranslocoMarkupTranspilers()`, includes a link transpiler that supports the following syntax: `[link:parameterKey]...[/link]`.
This is a generic syntax that can be used free of any context.
While that makes for an easy setup, it does add a bit of clutter to your translations.

That clutter can be reduced by introducing contextual markup tokens: customized syntax that can be used for within a specific context.
It is not uncommon, for example, to refer to some entity by its name or (some other descriptive property) and be able to link to a detail view of that entity.
Consider the scenario of a web shop, where adding an item to the basket would display the following message:

```json
{
  "PRODUCT_ADDED": "Added [link:productUrl]{{ productName }}[/link] to the basket."
}
```

In this case the entity is a product, for which both a name and URL are referenced in the translation.
If instead a context specific transpiler was created for the product entity, the translation could be simplified to:

```json
{
  "PRODUCT_ADDED": "Added [product] to the basket."
}
```

Obviously `ngx-transloco-markup` will not recognize the `[product]` token by default, so you will need to create your own transpiler and make it [available](#defining-markup-transpiler-availability) to the `<transloco>` component.
You can find out how that do that in the _[creating your own markup transpilers](#creating-your-own-markup-transpilers)_ section.

Since the need for contextual link transpilers is quite common, `ngx-transloco-markup` provides a `ContextualLinkTranspilerFactory` to simplify their creation.
This factory can be injected in your components and provider factory functions, allowing you to create two types of contextual link transpilers.

The first type that can be created is a `ContextualLinkSubstitutionTranspiler`.
This type of transpiler simply substitutes a specific token (substring) in a translation value with a link.
Such a transpiler would be needed to support the `[product]` token of the example translation shown above.
An instance of this type of transpiler can be created using the `ContextualLinkTranspilerFactory.createSubstitutionTranspiler` function, which supports two call signatures:

* `createSubstitutionTranspiler(parameterKey: string)`

  This is the simplest form, which creates a transpiler that substitutes a token `[parameterKey]` with a link.
  The label that is displayed the link is determined by the value of `parameterKey.label` property within the translation parameters.
  Similarly, the link target is resolved via the `parameterKey.link` property.

* `createSubstitutionTranspiler(token: string, options: ContextualLinkSubstitutionTranspilerOptions)`

  With this call signature you are given more control.
  First, you need to specify what token will be converted to a link by the transpiler.
  That can be anything, e.g. `'<banana>'`, `'$website'` or just `'???'` (although I would not recommend the latter).
  Just be aware that the chosen token can collide with another transpiler that supports a similar grammar.

  In addition to the token you will need to specify how the label and link target are resolved, via the `options` object.
  This object has two properties, `label` and `link`.
  Both allow you to define a resolving method, which can be one of the following:

  * `{ static: ... }` - A static value for the label or link.
  * `{ parameterKey: ... }` - A value that is obtained from the property with the specified key in the translation parameters.
  * `{ resolve: (translationParams) => ... }` - A resolver function where can dynamically construct the label or link (using the translation parameters if necessary).

Another type of transpiler that can be created by the `ContextualLinkTranspilerFactory` is the `ContextualLinkBlockTranspiler`, which supports the following syntax: `[linkToken]...[/linkToken]`.
In contrast to the substitution transpiler, the block transpiler will render the contents of the block as a link.
This is useful in case you need additional markup within the link or if the link text itself does not depend on an entity but is something that needs to be translated.

The factory also provides two signatures of the `ContextualLinkTranspilerFactory.createBlockTranspiler` function for creating `ContextualLinkBlockTranspiler` instances:

* `createBlockTranspiler(parameterKey: string)`

  Creates a link block transpiler that resolves the link target based on the specified key in the translation parameters object.
  The start and end token are equivalent to `[parameterKey]` and `[/parameterKey]`.

* `createBlockTranspiler(startToken: string, endToken: string, resolveLinkSpecification: ResolveLinkSpecification)`

  This alternative form gives you the freedom to choose the start and end token for the link block transpiler.
  Also, the method for resolving the link target can be specified in one of the following ways:

  * `{ static: ... }` - A static value for the link.
  * `{ parameterKey: ... }` - A value that is obtained from the property with the specified key in the translation parameters.
  * `{ resolve: (translationParams) => ... }` - A resolver function where can dynamically construct the link (using the translation parameters if necessary).


## Creating your own markup transpilers

The whole architecture of `ngx-transloco-markup` is based on the concept of transpilers: small units that are responsible for converting (part) of translation values into rendering functions.
For example the `BoldTextTranspiler` is capable of recognizing blocks that start with `[b]` and end with `[/b]`.
Once it has recognized such a block, it transforms it to a rendering function that creates `<b>` HTML element and appends the content between the start and end tags to that element.

While the `ngx-transloco-markup` library ships with a set of standard transpilers for the most common use cases, there are surely a lot of other different markup requirements which are not supported out-of-the-box.
Instead of trying to cover all these different requirements into a single library, you are offered the option to expand the set of transpilers if necessary.

Creating your own transpiler is as simple as instantiating an object that conforms to the `TranslationMarkupTranspiler` interface (shown below) and make it [available](#defining-markup-transpiler-availability) at the right place in the application for the `<transloco>` component.

```typescript
export interface TranslationMarkupTranspiler {
  tokenize(
    translation: string,
    offset: number
  ): TokenizeResult | undefined;

  transpile(
    tokens: unknown[],
    offset: number,
    context: TranslationMarkupTranspilerContext
  ): (TranspileResult | undefined);
}
```

As can be seen in the interface definition of the `TranslationMarkupTranspiler` above, a transpiler needs to implement two functions: `tokenize` and `transpile`.
This is because the process is performed in two phases:

* A _tokenization_ phase, where the translation value (a string) is converted into a sequence of tokens.
* The second phase is where the actual _transpilation_ happens: the sequence of tokens is converted into one (or more) rendering functions.

Each of these two functions can either return a result model or `undefined`, where the
latter is used to indicate that the transpiler is unable to parse the input at the specified position.
The `<transloco>` component uses a sequence of transpilers to parse translation values.
If a transpiler cannot parse the input at specific position, then the next transpiler in the sequence will be asked to so, and so forth, until there is one that is able to parse the input.

Note that there will always be an implicit fallback transpiler present to capture literal text.
You don't need to specify this transpiler, as the `<transloco>` component always appends this transpiler to end of the transpiler sequence.

### Tokenization

Although the tokenization phase theoretically could be omitted, it simplifies the transpilation phase.
Mostly on conceptual level, but also performance wise.
This is why `ngx-transloco-markup` converts translation values first into a sequence of tokens, before transpiling it into rendering functions.

The result model for the `tokenize` function is as follows:

```typescript
export interface TokenizeResult {
  nextOffset: number;
  token: unknown;
}
```

Apart from the token, the model also specifies the next offset where the tokenization process should continue.
Using the `BoldTextTranspiler` as example, tokenizing the string `'trans[b]loco[/b]'`, will a token at offsets 5 and 12 and where the `nextOffset` value is equal to 8 and 16 respectively.
For all other offsets, the `tokenize` function will return undefined.

One thing to note here is that tokens are typed as `unkown`.
This is because the set of transpilers is not closed, meaning we cannot know upfront what type of tokens will be generated.

### Transpilation

Once the translation value (a string) has been converted to a sequence of tokens, the transpilation phase is executed.
It is during this phase that the `tranpile` function of the transpilers is called.
As input it receives the sequence of tokens, the parse offset (within the token sequence)
and a `TranslationMarkupTranspilerContext` object.
This object has two properties:

* `transpile` - a function that can be used to recursively transpile the token sequence for transpilers that support nested content.
* `translation` - a dictionary object containing the translation values for the active language.

As mentioned before, tokens are represented with the `unknown` type.
A transpiler therefore should recognize supported tokens using strict equality comparison (`===`), `typeof`-checks, `instanceof`-checks or _[type guard](https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards)_ functions.
Once a supported (sub)sequence of tokens is parsed at the specified offset a `TranspileResult` object (interface is shown below) should be returned.
This object contains the offset of the next token where the transpilation process should continue.

```typescript
export interface TranspileResult {
  nextOffset: number;
  renderer: TranslationMarkupRenderer;
}

export type TranslationMarkupRenderer<T extends Node = Node> = (translationParameters: HashMap) => T;
```

More importantly, a `TranspileResult` object also includes a rendering function.
This function ultimately encodes the rendering logic that displays translations with markup.
Given a translation parameters object, the rendering function should be able to produce a [DOM Node](https://developer.mozilla.org/en-US/docs/Web/API/Node).

A completely transpiled translation value will result in one or more rendering functions.
Once the translation actually should be rendered, all of these functions are invoked with the translation parameters, resulting in one or more DOM Nodes.
These nodes are then added as children to the `<transloco>` component, thereby making the rendered translation visible in the application.

### Custom transpiler example: colored text

To illustrate how to create your own custom transpiler, let's craft a transpiler to add some color to your translations.
It supports the following syntax `[c:cssColorValue]...[/c]`, where `cssColorValue` should be replaced by a valid CSS color, e.g. `#123abc`, `rgba(123, 45, 67, 0.5)`, `orange`, etc.

First thing we need is a way to represent the tokens.
For that we will be using the following:

```typescript
class ColorStart {
  constructor(
    public readonly cssColorValue: string
  ) { }
}

const COLOR_END = new (class ColorEnd {})();
```

The start token of a color block will be an instance of the `ColorStart` tag.
This token also stores the CSS color value that will be applied to its content.

Since the end token of a color block doesn't need to store any information, this can just be a constant value.
Here we chose create a singleton instance of the `ColorEnd` class.
Although simple unique value, such as a string or [`Symbol`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol), would also be sufficient, the `ColorEnd` class makes for a nice symmetry with the `ColorStart` class.

With the token representations set up, we can now implement the `tokenize` function:

```typescript
@Injectable()
export class ColorTranspiler implements TranslationMarkupTranspiler {
  public tokenize(translation: string, offset: number): TokenizeResult | undefined {
    return (
      recognizeColorStartToken(translation, offset) ||
      recognizeColorEndToken(translation, offset)
    );
  }

  // TODO: transpile function
}

function recognizeColorStartToken(translation: string, offset: number): TokenizeResult | undefined {
  const COLOR_START_TOKEN = '[c:'

  if (!translation.startsWith(COLOR_START_TOKEN, offset)) {
    return undefined;
  }

  const end = translation.indexOf(']', offset + COLOR_START_TOKEN.length);

  if (end < 0) {
    return undefined;
  }

  const cssColorValue = translation.substring(offset + COLOR_START_TOKEN.length, end);

  return {
    nextOffset: end + 1,
    token: new ColorStart(cssColorValue)
  };
}

function recognizeColorEndToken(translation: string, offset: number): TokenizeResult | undefined {
  const COLOR_END_TOKEN = '[/c]';

  if (!translation.startsWith(COLOR_END_TOKEN, offset)) {
    return undefined;
  }

  return {
    nextOffset: offset + COLOR_END_TOKEN.length,
    token: COLOR_END
  };
}
```

The `tokenize` function makes use of two utility functions: `recognizeColorStartToken` and `recognizeColorEndToken`.
Since there is nothing special to mention about their implementation (they should be self-explanatory), let's proceed with the implementation of the `transpile` function.

First, we need to decide how the parse the token sequence.
Given a sequence of tokens and a specific position within that sequence, the token at that position must be an instance of `ColorStart`, so that will be our first check.
This token will also give us the CSS color value needed later to construct rendering function.

Once verified that the (sub)sequence starts with a `ColorStart` token, next we need to (recursively)
transpile the contents up until the `COLOR_END` token.
The transpile function receives a context object as third argument, which contains a `transpile` function that can be used to transpile the contents.
This will yield an array of `TranslationMarkupTranspiler` functions.
A possible implementation for the `transpile` function is shown below.

```typescript
@Injectable()
export class ColorTranspiler implements TranslationMarkupTranspiler {
  public tokenize(translation: string, offset: number): TokenizeResult | undefined {
    // ...
  }

  public transpile(
    tokens: unknown[],
    start: number,
    context: TranslationMarkupTranspilerContext
  ): TranspileResult | undefined {
    const nextToken = tokens[start];

    if (!(nextToken instanceof ColorStart)) {
      return undefined;
    }

    const childRenderers: TranslationMarkupRenderer[] = [];
    let offset = start + 1;
    while (offset < tokens.length && tokens[offset] !== COLOR_END) {
      const transpileResult = context.transpile(tokens, offset, context);

      if (transpileResult) {
        childRenderers.push(transpileResult.renderer);
        offset = transpileResult.nextOffset;
      } else {
        offset++;
      }

    }

    return {
      nextOffset: offset + 1,
      renderer: this.createRenderer(nextToken.cssColorValue, childRenderers)
    };
  }
}
```

Next, there is only one thing left to do: we need to implement the `createRenderer` utility function.
It is the responsibility of this function to create the renderer that combines all child renderers to render the contents with the desired color.
Our desired rendering function should create some element (in this case a `<span>` element), set an inline color style and attach the rendered child nodes to the element.
To simplify the implementation, we can make use of the `TranslationMarkupRendererFactory`, which can be obtained via dependency injection.
The implementation therefore would look something like the following:

```typescript
@Injectable()
export class ColorTranspiler implements TranslationMarkupTranspiler {

  constructor(
    private readonly rendererFactory: TranslationMarkupRendererFactory
  ) { }

  public tokenize(translation: string, offset: number): TokenizeResult | undefined {
    // ...
  }

  public transpile(
    tokens: unknown[],
    start: number,
    context: TranslationMarkupTranspilerContext
  ): TranspileResult | undefined {
    // ...
  }

  private createRenderer(
    cssColorValue: string,
    childRenderers: TranslationMarkupRenderer[]
  ): TranslationMarkupRenderer {
    const spanRenderer = this.rendererFactory.createElementRenderer('span', childRenderers);

    function renderColorMarkup(translationParameters: HashMap): HTMLAnchorElement {
      const spanElement = spanRenderer(translationParameters);

      spanElement.style.color = cssColorValue;

      return spanElement;
    }

    return renderColorMarkup;
  }

}
```

## Further customization

### Custom string interpolation expressions

_(todo)_

### Supporting additional link model types

_(todo)_
