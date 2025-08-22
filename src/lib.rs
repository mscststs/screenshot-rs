use napi::bindgen_prelude::*;
use napi::JsBuffer;
use napi_derive::napi;

use image::codecs::png::PngEncoder;
use image::ColorType;
use image::ImageEncoder;
use screenshots::Screen;

#[cfg(target_os = "macos")]
#[link(name = "ApplicationServices", kind = "framework")]
extern "C" {
    fn CGPreflightScreenCaptureAccess() -> bool;
}

#[cfg(target_os = "macos")]
fn has_screen_capture_permission() -> bool {
    unsafe { CGPreflightScreenCaptureAccess() }
}

#[cfg(not(target_os = "macos"))]
fn has_screen_capture_permission() -> bool {
    true
}

#[derive(Default)]
struct CaptureTask;

#[napi]
impl Task for CaptureTask {
    type Output = Vec<u8>;
    type JsValue = JsBuffer;

    fn compute(&mut self) -> Result<Self::Output> {
        if !has_screen_capture_permission() {
            return Err(Error::from_reason(
				"Screen recording permission not granted. Enable it in System Settings > Privacy & Security > Screen Recording.".to_string(),
			));
        }

        let screens = Screen::all()
            .map_err(|e| Error::from_reason(format!("Failed to enumerate screens: {e}")))?;
        let screen = screens
            .get(0)
            .ok_or_else(|| Error::from_reason("No screens found".to_string()))?;
        let image = screen
            .capture()
            .map_err(|e| Error::from_reason(format!("Failed to capture screen: {e}")))?;

        let width: u32 = image.width();
        let height: u32 = image.height();
        let rgba: Vec<u8> = image.into_raw();

        if rgba.iter().all(|&b| b == 0) {
            return Err(Error::from_reason(
				"Captured image is blank. This is likely due to missing Screen Recording permission.".to_string(),
			));
        }

        let mut png_bytes: Vec<u8> = Vec::new();
        let mut encoder = PngEncoder::new(&mut png_bytes);
        encoder
            .write_image(&rgba, width, height, ColorType::Rgba8)
            .map_err(|e| Error::from_reason(format!("Failed to encode PNG: {e}")))?;

        Ok(png_bytes)
    }

    fn resolve(&mut self, env: Env, output: Self::Output) -> Result<Self::JsValue> {
        let buf = env.create_buffer_with_data(output)?;
        Ok(buf.into_raw())
    }
}

#[napi(js_name = "captureScreenshot")]
pub fn capture_screenshot() -> AsyncTask<CaptureTask> {
    AsyncTask::new(CaptureTask::default())
}

#[napi(js_name = "captureScreenshotByScreenId")]
pub fn capture_screenshot_by_screen_id(env: Env, screen_id: u32) -> Result<JsBuffer> {
    if !has_screen_capture_permission() {
        return Err(Error::from_reason(
            "Screen recording permission not granted. Enable it in System Settings > Privacy & Security > Screen Recording.".to_string(),
        ));
    }
    let screens = Screen::all()
        .map_err(|e| Error::from_reason(format!("Failed to enumerate screens: {e}")))?;
    let screen = screens
        .into_iter()
        .find(|s| s.display_info.id == screen_id)
        .ok_or_else(|| Error::from_reason("Screen not found".to_string()))?;
    let image = screen
        .capture()
        .map_err(|e| Error::from_reason(format!("Failed to capture screen: {e}")))?;
    let width = image.width();
    let height = image.height();
    let rgba = image.into_raw();
    if rgba.iter().all(|&b| b == 0) {
        return Err(Error::from_reason(
            "Captured image is blank. This is likely due to missing Screen Recording permission."
                .to_string(),
        ));
    }
    let mut png_bytes: Vec<u8> = Vec::new();
    let mut encoder = PngEncoder::new(&mut png_bytes);
    encoder
        .write_image(&rgba, width, height, ColorType::Rgba8)
        .map_err(|e| Error::from_reason(format!("Failed to encode PNG: {e}")))?;
    let buf = env.create_buffer_with_data(png_bytes)?;
    Ok(buf.into_raw())
}

#[napi(object)]
pub struct ScreenInfo {
    pub id: u32,
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
    pub rotation: f64,
    pub scale_factor: f64,
    pub frequency: f64,
    pub is_primary: bool,
}

#[napi(js_name = "listScreens")]
pub fn list_screens() -> Result<Vec<ScreenInfo>> {
    let screens = Screen::all()
        .map_err(|e| Error::from_reason(format!("Failed to enumerate screens: {e}")))?;
    let infos = screens
        .into_iter()
        .map(|screen| {
            let info = screen.display_info;
            ScreenInfo {
                id: info.id,
                x: info.x,
                y: info.y,
                width: info.width,
                height: info.height,
                rotation: info.rotation as f64,
                scale_factor: info.scale_factor as f64,
                frequency: info.frequency as f64,
                is_primary: info.is_primary,
            }
        })
        .collect();
    Ok(infos)
}
