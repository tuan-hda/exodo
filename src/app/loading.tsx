import { Skeleton } from '../components/ui/skeleton'

export default function Loading() {
  return (
    <main className="mx-auto grid min-h-dvh w-[min(1120px,calc(100%-40px))] content-start gap-6 bg-page pt-6 pb-12 max-[700px]:w-[calc(100%-32px)]">
      <div className="flex items-center justify-between border-b border-line pb-4">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-9 w-56" />
      </div>
      <section className="grid gap-5 pt-20" aria-busy="true" aria-label="Loading Exodo">
        <Skeleton className="h-3 w-36" />
        <Skeleton className="h-24 w-[min(580px,90%)]" />
        <Skeleton className="h-4 w-72" />
        <Skeleton className="mt-8 h-56 w-full rounded-[24px]" />
      </section>
    </main>
  )
}
