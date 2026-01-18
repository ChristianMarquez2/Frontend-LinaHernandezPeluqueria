interface LoadingAnimationProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingAnimation({ 
  message = "Cargando...", 
  fullScreen = false 
}: LoadingAnimationProps) {
  const containerClasses = fullScreen
    ? "flex h-screen items-center justify-center bg-black"
    : "flex items-center justify-center py-12";

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-32 h-32">
          <img
            src="/tijeras.gif"
            alt="Cargando"
            className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(212,175,55,0.3)]"
          />
        </div>
        <div className="text-center">
          <p className="text-[#D4AF37] font-semibold text-lg animate-pulse">
            {message}
          </p>
          <div className="flex justify-center gap-1 mt-2">
            <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
            <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
            <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
