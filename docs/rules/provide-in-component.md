# Ensure components provide what they should (provide-in-compoent)

Certain interfaces or classes require the Angular component decorator to include an entry in either
the `providers` or `viewProviders` element.

## Examples

<!--tabs-->

### ❌ Incorrect

```ts
@Component({
    selector: 'app-my-component',
    standalone: true,
    template: ''
})
export class MyComponent impements ControlValueAccessor {}
```

### ✅ Correct

```ts
@Component({
    selector: 'app-my-component',
    standalone: true,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            multi: true,
            useExisting: forwardRef(() => MyComponent)
        }
    ],
    template: ''
})
export class MyComponent impements ControlValueAccessor {}
```

### Configuration

Configuration is performed via a dictionary keyed by either the class name or the interface. The
value is then a dictionary with two required keys:

- `provide` - The name of the injection token that must be provided.
- `type` - One of either `providers` or `viewProviders`

The `type` property specifies which `@Component` entry to examine.

An optional `multi` key should contain a boolean value to be matched. If the key is not present in the
dictionary, it should not be contained in the output. In other words, leaving it blank is not the thing as specifying
false.

Each entry must also specify exactly one of either `useExisting` or `useClass`

#### useExisting

Provide a boolean value (either `true` or `false`, it just has to be boolean) to specify that a `forwardRef` should be
used for the existing class that is decorated. If you specify a string value instead of `true`, the exact text you
supply will be provided to the `useExisting` value.

#### useClass

Takes a string and is provided verbatim to the corresponding entry.

#### useFactory

The useFactory option is not supported due to the complexity of determining a match. Pull requests welcome!
#### Helpers

Helpers allow you to specify a method that should be used instead of a dictionary block. You should declare a variable
like so somewhere in your code:

```ts
export const ProvideValueAccessor = (classRef: ForwardRefFn): Provider => ({
    provide: NG_VALUE_ACCESSOR,
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    useExisting: forwardRef(classRef),
    multi: true
})
```

Then, you specify `ProvideValueAccessor` as the helper and instead of writing a dictionary entry, the component
will be decorated in an arguably cleaner manner:

```ts
@Component({
    selector: 'app-my-component',
    standalone: true,
    providers: [ProvideValueAccessor(() => MyComponent)],
    template: ''
})
export class MyComponent impements ControlValueAccessor {}
```

### Example Configuration

```json
{
  "AbstractControlValueAccessor": {
    "provide": "NG_VALUE_ACCESSOR",
    "multi": true,
    "helper": "ProvideValueAccessor",
    "type": "providers",
    "useExisting": true
  },
  "Validators": {
    "provide": "NG_VALIDATORS",
    "multi": true,
    "helper": "ProvideValidator",
    "type": "providers",
    "useExisting": true
  },
  "NestedForm": {
    "provide": "ControlContainer",
    "type": "viewProviders",
    "useExisting": "FormGroupDirective"
  }
}
```
