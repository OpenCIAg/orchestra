Both components implement `ControlValueAccessor` and expose a Signals model. Use `[(value)]` for a signal-driven form or `formControl`/`ngModel` when integrating with an existing Angular form.

Variations: helper vs error (error wins), disabled vs readonly, clearable/search, masked/unmasked, prefix/suffix, character count, sm/md/lg. Do not pass `errorMessage` without `status="error"`.

```html
<orc-input label="Email" type="email" [(value)]="email" required clearable helperText="Use your work address." /> <orc-textarea label="Description" [(value)]="description" [maxLength]="240" showCharCount />
```
