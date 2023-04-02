import {ClassDeclarationWithName} from '@typescript-eslint/types/dist/generated/ast-spec'
import {TSESTree} from '@typescript-eslint/typescript-estree'
import {TSESLint} from '@typescript-eslint/utils'
import {COMPONENT_CLASS_DECORATOR} from '../selector'
import {
    createRule,
    getComponentDecorator,
    getComponentDecoratorProviders,
    isArrowFunctionExpression,
    isCallExpression,
    isClassNameArrow,
    isIdentifier,
    isLiteral,
    isObjectExpression,
    isProperty
} from '../utils'

// https://eslint.org/docs/latest/extend/custom-rules
// https://www.darraghoriordan.com/2021/11/06/how-to-write-an-eslint-plugin-typescript/

type MessageIds = 'provideInComponent' | 'shouldUseHelper'

export type ProviderConfiguration = {
    provide: string
    multi?: boolean
    helper?: string
    type: 'providers' | 'viewProviders'
    useExisting?: boolean | string
    useClass?: string
}

type Options = Record<string, ProviderConfiguration>

const baseProperties = {
    provide: {type: 'string', minLength: 1},
    multi: {type: 'boolean'},
    helper: {type: 'string', minLength: 1},
    type: {enum: ['providers', 'viewProviders']}
}

const rule = createRule({
    name: 'provide-in-component',
    meta: {
        type: 'problem',
        docs: {
            description: 'Ensure proper providers are defined in @Component declaration.',
            recommended: 'error'
        },
        schema: [
            {
                type: 'object',
                patternProperties: {
                    '.': {
                        type: 'object',
                        oneOf: [
                            {
                                properties: {
                                    ...baseProperties,
                                    useExisting: {
                                        oneOf: [
                                            {type: 'string', minLength: 1},
                                            {type: 'boolean'}
                                        ]
                                    }
                                },
                                additionalProperties: false,
                                required: ['provide', 'type', 'useExisting']
                            },
                            {
                                properties: {
                                    ...baseProperties,
                                    useClass: {type: 'string', minLength: 1}
                                },
                                additionalProperties: false,
                                required: ['provide', 'type', 'useClass']
                            }
                        ]
                    }
                }
            }
        ],
        messages: {
            provideInComponent: 'Must provide {{provide}}',
            shouldUseHelper: 'Prefer to use {{helper}} instead of directly providing {{provide}}.'
        },
        fixable: 'code',
        hasSuggestions: true
    },
    defaultOptions: [],
    create: (context: Readonly<TSESLint.RuleContext<MessageIds, Options[]>>) => {
        const isProviderHelper = (expression: TSESTree.Expression | TSESTree.SpreadElement, name: string, className: string) => isCallExpression(expression) && isIdentifier(expression.callee) && expression.callee.name === name && expression.arguments.length === 1 && isClassNameArrow(expression.arguments[0], className)

        const isProviderDictionary = (expression: TSESTree.Expression, componentName: string, config: ProviderConfiguration) => {
            if (!isObjectExpression(expression))
                return false

            let foundProvide = false
            let foundMulti = false
            let foundUse = false

            for (const property of expression.properties) {
                if (!(isProperty(property) && isIdentifier(property.key)))
                    return false

                const value = property.value

                switch (property.key.name) {
                    case 'provide':
                        if (!(isIdentifier(value) && value.name === config.provide))
                            return false

                        foundProvide = true
                        break

                    case 'useClass':
                        if (!(config.useClass && isIdentifier(value) && value.name === config.useClass))
                            return false

                        foundUse = true
                        break

                    case 'useExisting':
                        if (config.useExisting === undefined)
                            return false

                        // They might have just listed the component name
                        if (isIdentifier(value)) {
                            if (!(typeof config.useExisting === 'boolean' && value.name === componentName || value.name === config.useExisting))
                                return false

                            foundUse = true
                            break
                        }

                        // It should be a forwardRef call expression
                        if (!(isCallExpression(value) && isIdentifier(value.callee) && value.callee.name === 'forwardRef'))
                            return false

                        if (value.arguments.length !== 1)
                            return false

                        const arrow = value.arguments[0]
                        if (!(isArrowFunctionExpression(arrow) && !arrow.params.length && isIdentifier(arrow.body) && arrow.body.name === componentName))
                            return false

                        foundUse = true
                        break

                    case 'multi':
                        if (!(isLiteral(value) && value.raw === `${!!config.multi}`))
                            return false

                        foundMulti = true
                        break

                    default:
                        return false
                }
            }

            return foundProvide && (foundMulti || config.multi === undefined) && foundUse
        }

        const createProviderString = (config: Readonly<ProviderConfiguration>, className: Readonly<string>) => {
            if (config.helper)
                return `${config.helper}(() => ${className})`

            const obj: Record<string, string | boolean> = {
                provide: config.provide
            }

            if (config.multi !== undefined)
                obj.multi = config.multi

            if (config.useExisting)
                obj.useExisting = typeof config.useExisting === 'boolean' ? `forwardRef(() => ${className})` : config.useExisting
            else if (config.useClass)
                obj.useClass = config.useClass

            return JSON.stringify(obj)
        }

        const parseClassProviders = (node: ClassDeclarationWithName, config: ProviderConfiguration) => {
            const componentDecorator = getComponentDecorator(node)
            if (!componentDecorator)
                return

            const className = node.id.name
            const makeProviderString = createProviderString(config, className)
            const providers = getComponentDecoratorProviders(componentDecorator, config.type)

            if (!providers) {
                if (!isCallExpression(componentDecorator.expression))
                    return

                const argument = componentDecorator.expression.arguments[0]
                if (!isObjectExpression(argument))
                    return

                // If they have just @Component({}) this will happen.  Ignore it as it's a compiler
                // error anyway since they're missing things like selector.
                if (!argument.properties.length)
                    return

                // They have @Component dictionary elements but none of them are providers
                context.report({
                    messageId: 'provideInComponent',
                    node: componentDecorator,
                    data: {provide: config.provide},
                    fix: fixer => fixer.insertTextAfterRange([argument.range[0], argument.range[1] - 1], `, ${config.type}: [${makeProviderString}]`)
                })
            } else if (Array.isArray(providers)) {
                // OK, we have providers, do any of them match?
                for (const provider of providers) {
                    if (isProviderDictionary(provider, className, config)) {
                        if (config.helper)
                            context.report({
                                messageId: 'shouldUseHelper',
                                node: provider,
                                suggest: [
                                    {
                                        messageId: 'shouldUseHelper',
                                        fix: fixer => fixer.replaceText(provider, makeProviderString)
                                    }
                                ],
                                data: {
                                    helper: config.helper,
                                    provide: config.provide
                                }
                            })

                        return
                    } else if (config.helper && isProviderHelper(provider, config.helper, className))
                        return
                }

                // If we got here, none of the providers matched, so we need to add it.
                context.report({
                    messageId: 'provideInComponent',
                    node: componentDecorator,
                    data: {provide: config.provide},
                    fix: fixer => fixer.insertTextBeforeRange(providers[0].range, `${makeProviderString}, `)
                })
            } else
                context.report({
                    messageId: 'provideInComponent',
                    node: componentDecorator,
                    data: {provide: config.provide},
                    fix: fixer => fixer.replaceText(providers, `[${makeProviderString}]`)
                })
        }

        return {
            [COMPONENT_CLASS_DECORATOR](node: TSESTree.Decorator): void {
                const classDeclaration = node.parent! as TSESTree.ClassDeclarationWithName
                const options = context.options[0]

                if ((classDeclaration.superClass && isIdentifier(classDeclaration.superClass))) {
                    const wanted = options[classDeclaration.superClass.name]
                    if (!wanted)
                        return

                    parseClassProviders(classDeclaration, wanted)
                }

                classDeclaration.implements?.forEach(x => {
                    if (!isIdentifier(x.expression))
                        return

                    const wanted = options[x.expression.name]
                    if (!wanted)
                        return

                    parseClassProviders(classDeclaration, wanted)
                })
            }
        }
    }
})

export default rule
