import {AST_TOKEN_TYPES, TSESTree} from '@typescript-eslint/typescript-estree'
import {AST_NODE_TYPES, ESLintUtils} from '@typescript-eslint/utils'

export const createRule = ESLintUtils.RuleCreator(ruleName => `https://github.com/GargoyleSoft/eslint-plugin-angular/tree/main/docs/rules/${ruleName}.md`)

export const isCallExpression = (node: TSESTree.Node): node is TSESTree.CallExpression => node.type === AST_NODE_TYPES.CallExpression
export const isObjectExpression = (node: TSESTree.Node): node is TSESTree.ObjectExpression => node.type === AST_NODE_TYPES.ObjectExpression
export const isProperty = (node: TSESTree.Node): node is TSESTree.Property => node.type === AST_NODE_TYPES.Property
export const isIdentifier = (node: TSESTree.Node): node is TSESTree.Identifier => node.type === AST_NODE_TYPES.Identifier
export const isArrayExpression = (node: TSESTree.Node): node is TSESTree.ArrayExpression => node.type === AST_NODE_TYPES.ArrayExpression
export const isArrowFunctionExpression = (node: TSESTree.Node): node is TSESTree.ArrowFunctionExpression => node.type === AST_NODE_TYPES.ArrowFunctionExpression
export const isLiteral = (node: TSESTree.Node): node is TSESTree.Literal => node.type === AST_NODE_TYPES.Literal
export const isTSParameterProperty = (node: TSESTree.Node): node is TSESTree.TSParameterProperty => node.type === AST_NODE_TYPES.TSParameterProperty
export const isTSTypeReference = (node: TSESTree.Node): node is TSESTree.TSTypeReference => node.type === AST_NODE_TYPES.TSTypeReference

export const isPunctuatorToken = (node: TSESTree.Node | TSESTree.Token | null): node is TSESTree.PunctuatorToken => node?.type === AST_TOKEN_TYPES.Punctuator
export const getComponentDecorator = (node: TSESTree.ClassDeclarationWithName) => node.decorators?.find(x => {
    if (!isCallExpression(x.expression))
        return false

    if (!isIdentifier(x.expression.callee))
        return false

    const callee = x.expression.callee

    return callee.name === 'Component'
})

export const getComponentDecoratorProviders = (decorator: TSESTree.Decorator, type: string): TSESTree.Expression[] | TSESTree.ArrayExpression | null => {
    const expression = decorator.expression
    if (!isCallExpression(expression) || expression.arguments.length !== 1)
        return null

    const properties = isObjectExpression(expression.arguments[0]) && expression.arguments[0].properties
    if (!properties)
        return null

    const providers = properties.find(x => isProperty(x) && isIdentifier(x.key) && x.key.name === type)
    if (!(providers && isProperty(providers) && isArrayExpression(providers.value)))
        return null

    const elements = providers.value.elements.filter(x => x && (isObjectExpression(x) || isCallExpression(x))) as TSESTree.Expression[]
    return elements.length ? elements : providers.value as TSESTree.ArrayExpression
}


export const isClassNameArrow = (expression: TSESTree.Node, className: string) => isArrowFunctionExpression(expression) && !expression.params.length && isIdentifier(expression.body) && !expression.async && expression.body.name === className
