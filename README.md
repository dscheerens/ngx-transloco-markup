[![Build Status](https://api.travis-ci.org/dscheerens/ngx-transloco-markup.svg?branch=master)](https://travis-ci.org/dscheerens/ngx-transloco-markup) [![NPM Version](https://img.shields.io/npm/v/ngx-transloco-markup.svg)](https://www.npmjs.com/package/ngx-transloco-markup)

# ngx-transloco-markup: Markup support for Transloco

This library is an extension for [Transloco](https://github.com/ngneat/transloco) that provides support for displaying translations with markup.
**ngx-transloco-markup** offers an alternative to the Transloco [directive](https://ngneat.github.io/transloco/docs/translation-in-the-template#structural-directive) and [pipe](https://ngneat.github.io/transloco/docs/translation-in-the-template#pipe): the `<transloco>` component, that takes care of rendering your translations with markup.
By using this component, you no longer need to split your translations or use a `[innerHtml]`-binding.
This allows for a much simpler syntax in your translation files and you no longer need to worry about potential markup-injection issues that could cause the layout of your application to break.

While this library ships with support for the most common markup use cases, you might wish to create your own customized markup rendering.
Fortunately, thanks to the extensible architecture, you can do this quite easily.

## Installation

Since this library is an extension for Transloco, first make sure your application has been configured to use transloco.
If this is not the case follow the easy [installation instructions](https://ngneat.github.io/transloco/docs/installation) from Transloco.

Next you'll need to install the `ngx-transloco-markup` package from NPM:

```shell
npm install --save ngx-transloco-markup
```

If you are using the Angular CLI to build and test your application this all you need to do for the installation.
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

```Typescript
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

Next, you will need to add the `TranslocoMarkupModule` to the module(s) in which you want to use the `<transloco>` component:

```Typescript
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

```Typescript
@Component({
  selector: 'app-example',
  template: `
    <transloco
      [key]="'GREETING'"
      [params]="{
        name: firstName + ' ' + lastName
        website: 'https://www.example.com/'
      }"
    ></transloco>
  `
})
export class ExampleComponent {
  public firstName = 'John';
  public lastName = 'Doe';
}
```

## `<transloco>` component API

_(todo)_

## Defining markup transpiler availability

_(todo)_

## Contextual links

_(todo)_

## Creating your own markup transpilers

_(todo)_
