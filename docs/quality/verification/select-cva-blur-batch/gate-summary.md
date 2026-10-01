# Select multi-value blur strategy

`SelectComponent` called its CVA touched callback immediately after each multiple-mode option toggle. With a Reactive Forms control configured as `updateOn: 'blur'`, this committed the pending selection while the user was still interacting with the open Select.

The multiple-selection path now reports the value change without marking the control touched. Existing trigger blur and panel-close paths still call the touched callback, so Angular commits the buffered form value when the composite interaction ends.

The regression in `projects/orc-ds/select/select-repair.spec.ts` uses a real reactive-form host and clicks an option in the rendered overlay. Before the fix, the focused test failed because the form value changed immediately and the control became touched. After the fix, the form value remains unchanged until blur, then receives the selected value.

Validation: `PATH=/Users/matheuscastro/.nvm/versions/node/v24.16.0/bin:$PATH npm run test:lib -- --include='projects/orc-ds/select/select-repair.spec.ts'` passes **17/17** in ChromeHeadless.

This closes the multiple-mode option-selection path only. CVA blur behavior for chip removal and clear actions, plus live-browser and assistive-technology review, remain separate coverage candidates.
