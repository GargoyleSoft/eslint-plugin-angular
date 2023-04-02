export default {
    parser: '@typescript-eslint/parser',
    parserOptions: {sourceType: 'module'},
    rules: {
        "@gargoylesoft/no-common-module": "error",
        "@gargoylesoft/angular/no-component-constructor": "error",
        "@gargoylesoft/angular/provide-in-component": [
            "error",
            {
                "ControlValueAccessor": {
                    "provide": "NG_VALUE_ACCESSOR",
                    "multi": true,
                    "type": "providers",
                    "useExisting": true
                },
                "Validators": {
                    "provide": "NG_VALIDATORS",
                    "multi": true,
                    "type": "providers",
                    "useExisting": true
                }
            }
        ]
    }
}
