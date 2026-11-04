import { Config } from "@remotion/cli/config";

// MP4 h264 + AAC liviano para la web.
Config.setVideoImageFormat("jpeg");
Config.setCodec("h264");
// CRF 24 dio 24 MB; 28 deja el video por debajo de 20 MB.
Config.setCrf(28);
Config.setPixelFormat("yuv420p");
Config.setOverwriteOutput(true);
