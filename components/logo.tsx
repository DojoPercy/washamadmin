import Image from "next/image"

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={className}>
      <Image src="/logo.png" alt="WashAm Logo" width={64} height={64} className="w-full h-full object-contain" />
    </div>
  )
}
