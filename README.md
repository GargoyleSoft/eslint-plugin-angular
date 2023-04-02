# @gargoylesoft/eslint-plugin-angular

Rules for new angular versions.

## Installation

You'll first need to install [ESLint](https://eslint.org/):

```sh
yarn add -D eslint
```

Next, install `@gargoylesoft/eslint-plugin-angular`:

```sh
yarn add -D @gargoylesoft/eslint-plugin-angular
```

## Usage

Add `@gargoylesoft/angular` to the plugins section of your `.eslintrc` configuration file. You can omit the 
`eslint-plugin-` prefix:

```json
{
    "plugins": [
        "@gargoylesoft/angular"
    ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "@gargoylesoft/angular/rule-name": 2
    }
}
```

## Supported Rules

* [no-common-module](docs/rules/no-common-module.md) - Components should only include what they require.
* [no-component-constructor](docs/rules/no-component-constructor.md) - Components should use `inject` instead of a constructor.
* [provide-in-component](docs/rules/provide-in-component.md) - Ensure appropriate `providers` and `viewProviders` are specified.
