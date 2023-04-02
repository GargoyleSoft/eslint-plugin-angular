import {ESLintUtils} from '@typescript-eslint/utils'
import rule from '../../../lib/rules/no-common-module'

const ruleTester = new ESLintUtils.RuleTester({
    parser: '@typescript-eslint/parser'
})

ruleTester.run('no-common-module', rule, {
    valid: [
        {
            name: 'No imports',
            code: '@Component({}) export class Foo {}'
        },
        {
            name: 'Other import',
            code: '@Component({imports: [SomethingElse]}) export class Foo {}'
        }
    ],
    invalid: [
        {
            name: 'Do not import CommonModule',
            code: '@Component({imports: [CommonModule]}) export class Foo {}',
            errors: [{messageId: 'noCommonModule'}]
        }
    ]
})
