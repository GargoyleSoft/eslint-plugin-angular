import {TSESTree} from '@typescript-eslint/typescript-estree'
import {TSESLint} from '@typescript-eslint/utils'
import {COMPONENT_CLASS_DECORATOR} from '../selector'
import {createRule} from '../utils'

export default createRule({
    name: 'no-common-module',
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Do not import CommonModule',
            recommended: 'warn'
        },
        schema: [],
        messages: {
            noCommonModule: 'Do not import CommonModule directly.'
        },
        hasSuggestions: true
    },
    defaultOptions: [],
    create: (context: Readonly<TSESLint.RuleContext<'noCommonModule', []>>) => {
        return {
           [`${COMPONENT_CLASS_DECORATOR} Property[key.name="imports"] > ArrayExpression > Identifier[name="CommonModule"]`](node: TSESTree.Identifier) {
               context.report({
                   node,
                   messageId: 'noCommonModule'
               })
           }
        }
    }
})
