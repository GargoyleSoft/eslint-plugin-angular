import recommended from './configs/recommended'
import noCommonModule from './rules/no-common-module'
import noComponentConstructor from './rules/no-component-constructor'
import provideInComponent from './rules/provide-in-component'

export default {
    rules: {
        'no-common-module': noCommonModule,
        'no-component-constructor': noComponentConstructor,
        'provide-in-component': provideInComponent
    },
    configs: {
        'recommended': recommended
    }
}
