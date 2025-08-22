export declare function captureScreenshot(): Promise<Blob>;
export declare function captureScreenshotByScreenId(
  screenId: number
): Promise<Blob>;
export interface ScreenInfo {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleFactor: number;
  frequency: number;
  isPrimary: boolean;
}
export declare function listScreens(): Promise<ScreenInfo[]>;
