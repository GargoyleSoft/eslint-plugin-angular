# Discourage import of CommonModule (no-common-module)

Only import those items that you are using, such as `NgIf`, `NgForOf`, etc&hellip;

The `CommonModule` imports many more directive, formatters and pipes than you likely use.

## Examples

<!--tabs-->

### ❌ Incorrect

```ts
@Component({
    selector: 'app-display-change-log',
    standalone: true,
    imports: [CommonModule, PersonComponent, IgxGridModule]
    template: ''
})
export class MyComponent {}
```

### ✅ Correct

```ts
@Component({
    selector: 'app-display-change-log',
    standalone: true,
    imports: [NgIf, NgForOf, PersonComponent, IgxGridModule]
    template: ''
})
export class MyComponent {}
```
