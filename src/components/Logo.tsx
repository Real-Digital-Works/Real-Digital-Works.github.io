import Image from "next/image";

type LogoProps = {
  className?: string;
  variant?: "nav" | "lockup";
};

export function Logo({ className = "", variant = "nav" }: LogoProps) {
  if (variant === "lockup") {
    return (
      <span className={`inline-flex rounded-2xl bg-white p-3 ${className}`}>
        <Image
          src="/brand/logo-lockup.png"
          alt="Real Digital Works"
          width={994}
          height={628}
          className="h-[72px] w-auto"
        />
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="inline-flex rounded-lg bg-white px-1.5 py-1">
        <Image
          src="/brand/logo-mark.png"
          alt=""
          width={915}
          height={373}
          className="h-7 w-auto sm:h-8"
          priority
        />
      </span>
      <span className="hidden text-[16.5px] font-medium tracking-[-0.03em] whitespace-nowrap text-fg sm:inline">
        Real <span className="font-semibold text-tech">Digital</span> Works
      </span>
    </span>
  );
}
