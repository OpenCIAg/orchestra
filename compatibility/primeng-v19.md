# PrimeNG v19 compatibility matrix

This is the broad-implementation scorecard for the `v19` branch. It is not a claim of drop-in parity.

## Baseline and scoring

- Baseline: PrimeNG `19.1.4` (the version pinned for `v19` in [`versions.json`](./versions.json)).
- Inventory source: the public entry-point directories in the `primeng@19.1.4` npm package.
- `3` — equivalent is implemented, its main public behavior is covered by a focused test, and the documented mapping is usable.
- `2` — an equivalent is implemented and exported, but coverage or API depth is incomplete.
- `1` — a partial alias, directive, or related primitive exists; it is not a complete component equivalent.
- `0` — no meaningful equivalent found.

The score is intentionally about general implementation coverage. It does not score every PrimeNG input, output, CSS token, template hook, or internal implementation detail.

## Matrix

| PrimeNG entry point | Orchestra equivalent | Score | Current gap / evidence |
|---|---|---:|---|
| accordion | AccordionComponent | 2 | Implemented; nested/item API depth needs comparison. |
| animateonscroll | AnimateOnScroll directive | 2 | Directive exists; lifecycle/options need broader tests. |
| autocomplete | AutocompleteComponent | 3 | Selection, filtering, force-selection, keyboard and lifecycle tests exist. |
| autofocus | AutoFocus directive | 2 | Directive exists; option coverage is limited. |
| avatar | AvatarComponent | 3 | Core rendering and fallback behavior are covered. |
| avatargroup | AvatarGroupComponent | 2 | Implemented; overflow/template behavior needs comparison. |
| badge | BadgeComponent | 3 | Value/severity aliases are tested. |
| blockui | BlockUiComponent | 3 | Blocking lifecycle is tested. |
| breadcrumb | BreadcrumbComponent | 3 | Model/navigation behavior is covered. |
| button | ButtonComponent | 3 | Severity, visual flags, badge and focus lifecycle are tested. |
| buttongroup | ButtonGroupComponent | 2 | Implemented; orientation/ARIA depth needs tests. |
| calendar | CalendarComponent | 2 | Implemented; v19 DatePicker/Calendar API is only partially mapped. |
| card | CardComponent | 3 | Header/subheader/style/click aliases are tested. |
| carousel | CarouselComponent | 3 | Value/page aliases and page bounds are tested. |
| cascadeselect | CascadeSelectComponent | 2 | Implemented with CVA; templates and overlay API need comparison. |
| chart | ChartComponent | 2 | Lifecycle wrapper exists; chart adapter behavior is intentionally narrower. |
| checkbox | CheckboxComponent | 3 | Binary/true-value/false-value and array semantics are tested. |
| chip | ChipComponent | 3 | Icon/image/remove aliases are tested. |
| chips | ChipInputComponent | 2 | Input behavior exists; complete Chips API is not mapped. |
| colorpicker | ColorPickerComponent | 2 | Implemented; popup/palette/form API depth needs comparison. |
| confirmdialog | ConfirmDialogComponent | 3 | Confirmation lifecycle and service are covered. |
| confirmpopup | ConfirmPopupComponent | 2 | Implemented; target/positioning behavior needs comparison. |
| contextmenu | ContextMenuComponent | 3 | Visibility, keyboard navigation, activation and outside dismissal are tested. |
| dataview | DataViewComponent | 2 | Pagination/layout/filtering exists; template and sort API depth is incomplete. |
| datepicker | DatePickerComponent | 2 | Implemented; full v19 datepicker surface is not mapped. |
| defer | Defer directive | 2 | Directive exists; trigger/placeholder options need tests. |
| dialog | Modal/DialogComponent | 2 | Visibility and modal lifecycle exist; full Dialog API is narrower. |
| divider | DividerComponent | 2 | Implemented; orientation/ARIA depth needs tests. |
| dock | DockComponent | 2 | Implemented; responsive/menu interaction needs comparison. |
| dragdrop | DragDrop directives | 2 | Standalone directives exist; event payload/constraints need tests. |
| drawer | DrawerComponent | 3 | Visible alias and lifecycle controls are tested. |
| dynamicdialog | Dynamic Dialog alias | 1 | Alias exists through modal; dynamic service/template API is incomplete. |
| editor | EditorComponent | 3 | Text/selection lifecycle and command behavior are tested. |
| fieldset | FieldsetComponent | 3 | Toggle/collapse behavior is covered. |
| fileupload | FileUploaderComponent | 3 | File limits, custom upload and event payloads are tested. |
| floatlabel | FloatLabelComponent | 2 | Implemented; projected control/variant behavior needs tests. |
| fluid | FluidComponent | 2 | Implemented layout primitive; API is intentionally small. |
| focustrap | FocusTrap directive | 2 | Directive exists; focus boundary behavior needs tests. |
| galleria | GalleriaComponent | 3 | Navigation configuration and keyboard behavior are tested. |
| iconfield | IconFieldComponent | 2 | Implemented; projected icon positioning needs tests. |
| icons | Icon primitive | 1 | Icon support exists, but no direct PrimeNG Icons package equivalent. |
| iftalabel | IftaLabelComponent | 2 | Implemented; projected-control behavior needs tests. |
| image | ImageComponent | 3 | Preview, zoom, rotation and hide lifecycle are tested. |
| imagecompare | ImageCompareComponent | 3 | Position behavior is tested. |
| inplace | InplaceComponent | 3 | Activation/deactivation lifecycle is tested. |
| inputgroup | InputGroupComponent | 2 | Implemented; addon/layout API depth needs tests. |
| inputgroupaddon | InputGroupAddonComponent | 2 | Implemented; severity/icon API depth needs tests. |
| inputicon | IconField/Icon primitive | 1 | Related primitive exists; no direct InputIcon equivalent. |
| inputmask | InputMask directive | 2 | Directive exists; mask edge cases need comparison. |
| inputnumber | NumberInputComponent | 3 | Locale/currency/empty-input behavior is covered. |
| inputotp | OtpInputComponent | 2 | Implemented; complete OTP keyboard/slot API needs tests. |
| inputswitch | SwitchComponent | 3 | CVA and toggle behavior are covered. |
| inputtext | InputComponent | 3 | Input aliases and accessibility error behavior are covered. |
| inputtextarea | TextareaComponent | 3 | Input aliases and accessibility error behavior are covered. |
| keyfilter | KeyFilter directive | 2 | Directive exists; pattern coverage needs tests. |
| knob | KnobComponent | 2 | Implemented; drag/keyboard/form API depth needs comparison. |
| listbox | ListboxComponent | 3 | Identity, keyboard navigation and disabled options are tested. |
| megamenu | MegaMenuComponent | 2 | Implemented; responsive/nested model depth needs tests. |
| menu | MenuComponent | 3 | Nested model, keyboard and activation behavior are tested. |
| menubar | MenubarComponent | 2 | Implemented; mobile/submenu behavior needs tests. |
| message | MessageComponent | 3 | Text, severity, closability and style aliases are tested. |
| messages | MessagesComponent | 3 | Add/remove/clear lifecycle is tested. |
| metergroup | MeterGroupComponent | 2 | Implemented; orientation/template API depth needs tests. |
| multiselect | MultiSelectComponent | 3 | Selection, bulk changes, identity and touched lifecycle are tested. |
| orderlist | OrderListComponent | 2 | Reordering and CVA exist; full drag/template API needs comparison. |
| organizationchart | OrganizationChartComponent | 2 | Selection/collapse behavior exists; template depth needs tests. |
| overlay | OverlayComponent | 1 | Structural overlay exists; service/positioning API is narrower. |
| overlaybadge | OverlayBadgeComponent | 2 | Implemented; positioning/content API needs tests. |
| overlaypanel | OverlayPanelComponent | 2 | Visibility, focus, escape and dismissal exist; positioning API is narrower. |
| paginator | PaginatorComponent | 3 | PrimeNG aliases, paging and report fields are tested. |
| panel | PanelComponent | 3 | Header/collapse behavior is covered. |
| panelmenu | PanelMenuComponent | 2 | Expansion/selection exists; nested keyboard/template depth needs tests. |
| password | PasswordComponent | 2 | Implemented; feedback/meter/toggle API needs comparison. |
| picklist | PickListComponent | 2 | Transfer/selection exists; drag/template API needs tests. |
| popover | PopoverComponent | 2 | Overlay lifecycle exists; positioning/target API is narrower. |
| progressbar | ProgressBarComponent | 3 | Value normalization and display configuration are tested. |
| progressspinner | ProgressSpinnerComponent | 2 | Implemented; styling/accessibility API needs tests. |
| radiobutton | RadioButton/RadioGroupComponent | 3 | Group selection and change lifecycle are tested. |
| rating | RatingComponent | 3 | Rate/reset/keyboard behavior is tested. |
| ripple | Ripple directive | 2 | Directive exists; visual timing/options need tests. |
| scroller | VirtualScrollerComponent | 2 | Virtual range/lazy events exist; template/loader API needs tests. |
| scrollpanel | ScrollPanelComponent | 2 | Implemented; orientation/scrollbar API needs tests. |
| scrolltop | ScrollTopComponent | 2 | Implemented; target/threshold behavior needs tests. |
| select | SelectComponent | 3 | Option mapping, filtering, CVA and lifecycle behavior are tested. |
| selectbutton | SelectButtonComponent | 2 | Implemented; multiple/allow-empty/template API needs tests. |
| sidebar | DrawerComponent | 3 | Sidebar alias is implemented and lifecycle-tested. |
| skeleton | SkeletonComponent | 3 | Shape/size/style/animation aliases are tested. |
| slider | SliderComponent | 3 | Orientation, range values and event payloads are tested. |
| speeddial | SpeedDialComponent | 3 | Visibility, action selection and outside dismissal are tested. |
| splitbutton | SplitButtonComponent | 2 | Implemented; menu/keyboard/API depth needs tests. |
| splitter | SplitterComponent | 2 | Resizing and normalized sizes exist; pointer interaction needs tests. |
| stepper | StepperComponent | 2 | Implemented; full v19 Stepper panel API needs tests. |
| steps | StepsComponent | 3 | Model and readonly navigation are tested. |
| styleclass | StyleClass directive | 2 | Directive exists; trigger/class lifecycle needs tests. |
| table | TableComponent | 3 | Filtering, row events and lazy paging are tested. |
| tabmenu | TabMenuComponent | 3 | Model, active item, command and keyboard behavior are tested. |
| tabs | Tabs/TabGroupComponent | 2 | Implemented; v19 panel/template API needs comparison. |
| tabview | TabGroup/TabComponent | 2 | Compatibility alias exists; legacy TabView surface is narrower. |
| tag | TagComponent | 3 | Value/severity/icon/remove behavior is tested. |
| terminal | TerminalComponent | 2 | Command/history behavior exists; prompt/template API needs tests. |
| textarea | TextareaComponent | 3 | Textarea alias and accessibility behavior are covered. |
| tieredmenu | TieredMenuComponent | 3 | Popup, nested activation and keyboard behavior are tested. |
| timeline | TimelineComponent | 2 | Implemented; opposite/align/template API needs tests. |
| toast | ToastComponent | 3 | Add/addAll/remove aliases and message fields are tested. |
| togglebutton | ToggleButtonComponent | 3 | Allow-empty and CVA behavior are tested. |
| toggleswitch | SwitchComponent | 3 | Switch alias and CVA behavior are tested. |
| toolbar | ToolbarComponent | 2 | Implemented; responsive/content API needs tests. |
| tooltip | Tooltip directive | 3 | Content, ARIA preservation and lifecycle behavior are tested. |
| tree | TreeComponent | 2 | Implemented; selection/drag/template API depth needs tests. |
| treeselect | TreeSelectComponent | 2 | Implemented; full overlay/filter/CVA API needs tests. |
| treetable | TreeTableComponent | 2 | Implemented; sorting/selection/template API needs tests. |
| usestyle | UseStyle directive | 2 | Directive exists; stylesheet lifecycle needs tests. |

## Current score

The initial matrix contains 112 public PrimeNG v19 entries. Its current aggregate is **269 / 336 = 80.1%**. Scores are intentionally conservative and should be updated as each row gains direct evidence. The aggregate is calculated as `sum(score) / (3 × row count)`; it is a general implementation-coverage indicator, not a claim of PrimeNG parity.
