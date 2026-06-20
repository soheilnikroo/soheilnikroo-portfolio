# Ambient audio

Drop a licensed looping lofi track here as `ambient.mp3` (and/or `.ogg`) to enable
the background bed. Until then, only the synthesized interaction cues play.

Wire the file by passing `bedSrc="/audio/ambient.mp3"` to `<AmbientProvider>` in
`app/layout.tsx`. Audio is opt-in and never autoplays.
