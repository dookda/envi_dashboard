import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">

        {/* App identity */}
        <div className="flex flex-col items-center gap-3 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${process.env.NEXT_PUBLIC_BASE_PATH}/logo.png`}
            alt="Envir Service"
            width={64}
            height={64}
            className="rounded-2xl"
          />
          <div>
            <h1 className="text-xl font-semibold text-[#202124] dark:text-[#e8eaed] tracking-tight">
              Envir Service
            </h1>
            <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] mt-1">
              Environmental Quality Control Terminal
            </p>
          </div>
        </div>

        {/* QR card */}
        <div className="w-full bg-card rounded-3xl border border-border px-6 py-7 flex flex-col items-center gap-5">

          <div className="text-center space-y-1">
            <p className="text-sm font-semibold text-[#202124] dark:text-[#e8eaed]">
              รับการแจ้งเตือนคุณภาพอากาศ
            </p>
            <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">
              สแกน QR หรือกดปุ่มด้านล่างเพื่อเพิ่มเพื่อนกับ LINE OA
            </p>
          </div>

          {/* QR code */}
          <div className="p-3 bg-white rounded-2xl border border-border shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${process.env.NEXT_PUBLIC_BASE_PATH}/231hohun.png`}
              alt="LINE OA QR Code"
              width={200}
              height={200}
              className="rounded-xl"
            />
          </div>

          {/* LINE OA handle */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#e6f4ea]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#06C755" aria-hidden="true">
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.066-.022.136-.033.2-.033.211 0 .39.09.511.252l2.443 3.317V8.108c0-.345.282-.63.63-.63.345 0 .627.285.627.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.07 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
            </svg>
            <span className="text-sm font-semibold text-[#137333]">@231hohun</span>
          </div>

          {/* Add friend button */}
          <a
            href="https://line.me/R/ti/p/%40231hohun"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-[#06C755] hover:bg-[#05b34c] text-white text-sm font-semibold transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white" aria-hidden="true">
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.066-.022.136-.033.2-.033.211 0 .39.09.511.252l2.443 3.317V8.108c0-.345.282-.63.63-.63.345 0 .627.285.627.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.07 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
            </svg>
            เพิ่มเพื่อนใน LINE
          </a>

          <p className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6] text-center leading-relaxed">
            เมื่อเพิ่มเพื่อนแล้ว คุณจะได้รับแจ้งเตือนอัตโนมัติ<br />
            เมื่อคุณภาพอากาศถึงระดับที่มีผลต่อสุขภาพ
          </p>
        </div>

        {/* Dashboard link */}
        <Link
          href="/dashboard"
          className="text-xs text-[#5f6368] dark:text-[#9aa0a6] hover:text-[#1a73e8] transition-colors underline underline-offset-2"
        >
          ไปยังหน้า Dashboard →
        </Link>

      </div>
    </div>
  );
}
