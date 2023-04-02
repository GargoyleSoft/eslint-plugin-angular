import {ESLintUtils} from '@typescript-eslint/utils'
import rule from '../../../lib/rules/no-component-constructor'

const ruleTester = new ESLintUtils.RuleTester({
    parser: '@typescript-eslint/parser'
})

ruleTester.run('no-component-constructor', rule, {
    valid: [
    ],
    invalid: [
        {
            code: `
                @Component({}) 
                export class Foo { 
                    constructor(private readonly foo: SomeService,
                    bar: SomeBar
                    ) {
                    } 
                }
            `,
            errors: [{messageId: 'injectItem'}, {messageId: 'injectItem'}],
            output: `
                @Component({}) 
                export class Foo {
                    readonly foo = inject(SomeService) 
constructor() {
                    } 
                }
            `
        }
    ]
})
