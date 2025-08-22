use napi::bindgen_prelude::*;
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

// 通用的屏幕截图任务结构体
pub struct CaptureTask {
  screen_id: Option<u32>,
}

impl CaptureTask {
  pub fn new(screen_id: Option<u32>) -> Self {
    Self { screen_id }
  }
}

impl Default for CaptureTask {
  fn default() -> Self {
    Self::new(None)
  }
}

#[napi]
impl Task for CaptureTask {
  type Output = Vec<u8>;
  type JsValue = Buffer;

  fn compute(&mut self) -> Result<Self::Output> {
    capture_screen_internal(self.screen_id)
  }

  fn resolve(&mut self, _env: Env, output: Self::Output) -> Result<Self::JsValue> {
    Ok(Buffer::from(output))
  }
}

// 内部共用的截图逻辑
fn capture_screen_internal(screen_id: Option<u32>) -> Result<Vec<u8>> {
  if !has_screen_capture_permission() {
    return Err(Error::from_reason(
      "Screen recording permission not granted. Enable it in System Settings > Privacy & Security > Screen Recording.".to_string(),
    ));
  }

  let screens =
    Screen::all().map_err(|e| Error::from_reason(format!("Failed to enumerate screens: {e}")))?;

  let screen = match screen_id {
    Some(id) => screens
      .into_iter()
      .find(|s| s.display_info.id == id)
      .ok_or_else(|| Error::from_reason("Screen not found".to_string()))?,
    None => screens
      .get(0)
      .ok_or_else(|| Error::from_reason("No screens found".to_string()))?
      .clone(),
  };

  let image = screen
    .capture()
    .map_err(|e| Error::from_reason(format!("Failed to capture screen: {e}")))?;

  let width: u32 = image.width();
  let height: u32 = image.height();
  let rgba: Vec<u8> = image.into_raw();

  if rgba.iter().all(|&b| b == 0) {
    return Err(Error::from_reason(
      "Captured image is blank. This is likely due to missing Screen Recording permission."
        .to_string(),
    ));
  }

  let mut png_bytes: Vec<u8> = Vec::new();
  let encoder = PngEncoder::new(&mut png_bytes);
  encoder
    .write_image(&rgba, width, height, ColorType::Rgba8)
    .map_err(|e| Error::from_reason(format!("Failed to encode PNG: {e}")))?;

  Ok(png_bytes)
}

#[napi(js_name = "captureScreenshot")]
pub fn capture_screenshot() -> AsyncTask<CaptureTask> {
  AsyncTask::new(CaptureTask::default())
}

#[napi(js_name = "captureScreenshotByScreenId")]
pub fn capture_screenshot_by_screen_id(screen_id: u32) -> AsyncTask<CaptureTask> {
  AsyncTask::new(CaptureTask::new(Some(screen_id)))
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
  let screens =
    Screen::all().map_err(|e| Error::from_reason(format!("Failed to enumerate screens: {e}")))?;
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
