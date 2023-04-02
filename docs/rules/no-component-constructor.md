# Do not use constructors in Angular components (no-component-constructor)

Angular components should inject readonly properties, not inject via a constructor.

## Examples

<!--tabs-->

### ❌ Incorrect

```ts
@Component({
    selector: 'app-display-change-log',
    standalone: true,
    template: ''
})
export class MyComponent {
    constructor(
        someService: SomeService, 
        @Optional() someOtherService: SomeOtherService, 
        @Inject(BASE_URL) baseUrl: string
    ) {
    }
}
```

### ✅ Correct

```ts
@Component({
    selector: 'app-display-change-log',
    standalone: true,
    template: ''
})
export class MyComponent {
    readonly someService = inject(SomeService)
    readonly someOtherService = inject(SomeOtherService, { optional: true })
    readonly baseUrl = inject(BASE_URL)
}
```
