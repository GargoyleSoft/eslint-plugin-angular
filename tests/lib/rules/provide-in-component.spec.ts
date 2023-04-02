import {ESLintUtils} from '@typescript-eslint/utils'
import rule, {ProviderConfiguration} from '../../../lib/rules/provide-in-component'

const ruleTester = new ESLintUtils.RuleTester({
    parser: '@typescript-eslint/parser'
})

const optionsWithHelper: Record<string, ProviderConfiguration>[] = [
    {
        'AbstractControlValueAccessor': {
            provide: 'NG_VALUE_ACCESSOR',
            multi: true,
            helper: 'ProvideValueAccessor',
            type: 'providers',
            useExisting: true
        },
        'Validators': {provide: 'NG_VALIDATORS', multi: true, helper: 'ProvideValidator', type: 'providers', useExisting: true}
    }
]

const optionsWithoutHelper: Record<string, ProviderConfiguration>[] = [
    {
        'AbstractControlValueAccessor': {
            provide: 'NG_VALUE_ACCESSOR',
            multi: true,
            type: 'providers',
            useExisting: true
        },
        'Validators': {provide: 'NG_VALIDATORS', multi: true, type: 'providers', useExisting: true}
    }
]

ruleTester.run('should-include-component-provider', rule, {
    valid: [
        {
            name: 'Uses provider helper',
            code: `@Component({selector: '', providers: [ProvideValueAccessor(() => Foo)]}) class Foo extends AbstractControlValueAccessor {}`,
            options: optionsWithHelper
        },
        {
            name: 'Does not use helper',
            code: `@Component({selector: '', providers: [{provide:NG_VALUE_ACCESSOR,useExisting:Foo,multi:true}]}) class Foo extends AbstractControlValueAccessor {}`,
            options: optionsWithoutHelper
        },
        {
            name: 'Does not need Validators helper',
            code: `@Component({selector:'', providers: [{provide:NG_VALIDATORS,useExisting:Foo,multi:true}]}) class Foo implements Validators {}`,
            options: optionsWithoutHelper
        }
    ],
    invalid: [
        {
            name: 'No provider key',
            code: `@Component({selector:''}) class Foo extends AbstractControlValueAccessor {}`,
            errors: [{messageId: 'provideInComponent'}],
            output: `@Component({selector:'', providers: [ProvideValueAccessor(() => Foo)]}) class Foo extends AbstractControlValueAccessor {}`,
            options: optionsWithHelper
        },
        {
            name: 'Empty',
            code: `@Component({selector:'', providers: []}) class Foo extends AbstractControlValueAccessor {}`,
            errors: [{messageId: 'provideInComponent'}],
            output: `@Component({selector:'', providers: [ProvideValueAccessor(() => Foo)]}) class Foo extends AbstractControlValueAccessor {}`,
            options: optionsWithHelper
        },
        {
            name: 'Prefer helper for NG_VALUE_ACCESSOR with no forwardRef',
            code: `@Component({selector:'', providers: [{provide:NG_VALUE_ACCESSOR,useExisting:Foo,multi:true}]}) class Foo extends AbstractControlValueAccessor {}`,
            errors: [{messageId: 'shouldUseHelper'}],
            options: optionsWithHelper
        },
        {
            name: 'Prefer helper for NG_VALUE_ACCESSOR with forwardRef',
            code: `@Component({selector:'', providers: [{provide:NG_VALUE_ACCESSOR,useExisting:forwardRef(() => Foo),multi:true}]}) class Foo extends AbstractControlValueAccessor {}`,
            errors: [{messageId: 'shouldUseHelper'}],
            options: optionsWithHelper
        },
        {
            name: 'Provider key with something else',
            code: `@Component({selector:'', providers: [{}]}) class Foo extends AbstractControlValueAccessor {}`,
            output: `@Component({selector:'', providers: [ProvideValueAccessor(() => Foo), {}]}) class Foo extends AbstractControlValueAccessor {}`,
            errors: [{messageId: 'provideInComponent'}],
            options: optionsWithHelper
        },

        {
            name: 'Extends and implements',
            code: `@Component({selector:'', providers: [{}]}) class Foo extends AbstractControlValueAccessor implements Validators {}`,
            output: `@Component({selector:'', providers: [ProvideValidator(() => Foo), ProvideValueAccessor(() => Foo), {}]}) class Foo extends AbstractControlValueAccessor implements Validators {}`,
            errors: [{messageId: 'provideInComponent'}, {messageId: 'provideInComponent'}],
            options: optionsWithHelper
        },

        {
            name: 'No provider key',
            code: `@Component({selector:''}) class Foo implements Validators {}`,
            errors: [{messageId: 'provideInComponent'}],
            output: `@Component({selector:'', providers: [ProvideValidator(() => Foo)]}) class Foo implements Validators {}`,
            options: optionsWithHelper
        },
        {
            name: 'Empty',
            code: `@Component({selector:''}) class Foo implements Validators {}`,
            errors: [{messageId: 'provideInComponent'}],
            output: `@Component({selector:'', providers: [ProvideValidator(() => Foo)]}) class Foo implements Validators {}`,
            options: optionsWithHelper
        },
        {
            name: 'Prefer helper for NG_VALIDATORS with no forwardRef',
            code: `@Component({selector:'', providers: [{provide:NG_VALIDATORS,useExisting:Foo,multi:true}]}) class Foo implements Validators {}`,
            errors: [{messageId: 'shouldUseHelper'}],
            options: optionsWithHelper
        },
        {
            name: 'Prefer helper for NG_VALIDATORS with forwardRef',
            code: `@Component({selector:'', providers: [{provide:NG_VALIDATORS,useExisting:forwardRef(() => Foo),multi:true}]}) class Foo implements Validators {}`,
            errors: [{messageId: 'shouldUseHelper'}],
            options: optionsWithHelper
        },
        {
            name: 'Provider key with something else',
            code: `@Component({selector:'', providers: [{}]}) class Foo implements Validators {}`,
            output: `@Component({selector:'', providers: [ProvideValidator(() => Foo), {}]}) class Foo implements Validators {}`,
            errors: [{messageId: 'provideInComponent'}],
            options: optionsWithHelper
        }
    ]
})
