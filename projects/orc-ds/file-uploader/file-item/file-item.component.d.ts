import { FileItemData } from '../file-uploader.types';
import * as i0 from "@angular/core";
export declare class FileItemComponent {
    readonly fileData: import("@angular/core").InputSignal<FileItemData>;
    readonly disabled: import("@angular/core").InputSignal<boolean>;
    readonly remove: import("@angular/core").OutputEmitterRef<string>;
    readonly isImage: import("@angular/core").Signal<boolean>;
    readonly badgeVariant: import("@angular/core").Signal<"soft" | "outline">;
    readonly badgeStatus: import("@angular/core").Signal<"success" | "danger" | "primary" | "neutral">;
    readonly showProgress: import("@angular/core").Signal<boolean>;
    onRemove(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<FileItemComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<FileItemComponent, "orc-file-item", never, { "fileData": { "alias": "fileData"; "required": true; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; }, { "remove": "remove"; }, never, never, true, never>;
}
