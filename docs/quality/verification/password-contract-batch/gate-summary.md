# Password contract batch

The focused Chrome Headless suite passed **14/14**, on Node 24.16.0 with `NG_BUILD_MAX_WORKERS=2` and Karma port 9884. Full output is in [focused-tests.log](focused-tests.log).

The regression covers the Password clear action through the DOM and verifies that it updates the CVA value and invokes the registered touched callback. Password continues to block clear for readonly and disabled states, while visibility toggling remains available for readonly values.

The source fix is limited to `PasswordComponent.clear()`, which now marks the CVA touched after an accepted clear, matching the established Input and NumberInput clear contracts.
