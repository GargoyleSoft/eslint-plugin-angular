import {TSESTree} from '@typescript-eslint/typescript-estree'
import {TSESLint} from '@typescript-eslint/utils'
import {
    createRule,
    getComponentDecorator,
    isCallExpression,
    isIdentifier,
    isPunctuatorToken,
    isTSParameterProperty,
    isTSTypeReference
} from '../utils'

export default createRule({
    name: 'no-component-constructor',
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Angular components should use inject instead of defining a constructor.',
            recommended: 'error'
        },
        schema: [],
        messages: {
            injectItem: 'Inject {{item}} instead of providing via a constructor.'
        },
        fixable: 'code'
    },
    defaultOptions: [],
    create: (context: Readonly<TSESLint.RuleContext<'injectItem', never[]>>) => {
        const injectorOptions = (node: TSESTree.Identifier): [string | null, string] | null => {
            if (!node.decorators)
                return null

            let tokenName: string | null = null

            const options: Record<string, boolean> = {}

            for (const decorator of node.decorators) {
                const expression = decorator.expression

                if (!(isCallExpression(expression) && isIdentifier(expression.callee)))
                    return null

                switch (expression.callee.name) {
                    case 'Optional':
                        options.optional = true
                        break
                    case 'Self':
                        options.self = true
                        break
                    case 'SkipSelf':
                        options.skipSelf = true
                        break
                    case 'Host':
                        options.host = true
                        break
                    case 'Inject':
                        const args = expression.arguments

                        if (args.length === 1 && isIdentifier(args[0]))
                            tokenName = args[0].name

                        break
                    default:
                        return null
                }
            }

            // If the @Inject is the only option they provided, we don't need to add options.
            return [tokenName, Object.keys(options).length ? `, ${JSON.stringify(options)}` : '']
        }

        const getInjectorString = (node: TSESTree.Identifier | TSESTree.TSParameterProperty): string | null => {
            if (isTSParameterProperty(node)) {
                if (!isIdentifier(node.parameter))
                    return null

                node = node.parameter
            }

            if (!isIdentifier(node))
                return null

            const inner = node.typeAnnotation?.typeAnnotation
            if (!(inner && isTSTypeReference(inner) && isIdentifier(inner.typeName)))
                return null

            const options = injectorOptions(node)
            if (!options)
                return `readonly ${node.name} = inject(${inner.typeName.name})\n`

            const [token, optionsStr] = options

            return `readonly ${node.name} = inject(${token ?? inner.typeName.name}${optionsStr})\n`
        }

        return {
            'ClassDeclaration[decorators] MethodDefinition[kind="constructor"] > FunctionExpression > :matches(Identifier, TSParameterProperty)'(node: TSESTree.Identifier | TSESTree.TSParameterProperty) {
                const injectorString = getInjectorString(node)
                if (!injectorString)
                    return

                const source = context.getSourceCode()
                const range = node.range

                const tokenBefore = source.getTokenBefore(node)

                if (isPunctuatorToken(tokenBefore) && tokenBefore.value === ',')
                    range[0] = tokenBefore.range[0]
                else {
                    const tokenAfter = source.getTokenAfter(node)

                    if (isPunctuatorToken(tokenAfter) && tokenAfter.value === ',')
                        range[1] = tokenAfter.range[1]
                }

                context.report({
                    messageId: 'injectItem',
                    node,
                    fix: fixer => [
                        fixer.removeRange(range),
                        fixer.insertTextBefore(node.parent!.parent!, injectorString)
                    ]
                })
            }
        }
    }
})
