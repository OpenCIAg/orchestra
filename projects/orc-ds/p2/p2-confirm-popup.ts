/**
 * Compatibility surface: the confirm popup lives in the canonical
 * `confirm-popup` directory; these re-exports keep every p2 entry symbol unchanged.
 */
export {
  ConfirmPopupComponent,
  ConfirmPopupService,
} from '@ciag/orchestra/confirm-popup';
export type { PopupConfirmation } from '@ciag/orchestra/confirm-popup';
