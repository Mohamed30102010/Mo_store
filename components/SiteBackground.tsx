const BACKGROUND_SRC = "/Create_luxury_store_logo_animation_202609041413.mp4"; // أو أي مسار حطيته

export default function SiteBackground() {
  if (!BACKGROUND_SRC) return null;

  const isVideo = /\.(mp4|webm)$/i.test(BACKGROUND_SRC);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {isVideo ? (
        <video
          src={BACKGROUND_SRC}
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover opacity-60"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={BACKGROUND_SRC}
          alt=""
          className="h-full w-full object-cover opacity-60"
        />
      )}
      <div className="absolute inset-0 bg-bg/50" />
    </div>
  );
}
