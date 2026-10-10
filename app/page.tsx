import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/Card";
import { getCurrentUser } from "@/lib/auth";

const features = [
  {
    icon: "📚",
    title: "Course Workspaces",
    description:
      "Keep syllabus info, module details, tasks, and reference links cleanly partitioned per course.",
  },
  {
    icon: "✅",
    title: "Task Management",
    description:
      "Track status across Not Started, In Progress, and Completed. Never miss an assignment deadline.",
  },
  {
    icon: "🔗",
    title: "Resource Sharing",
    description:
      "Centralize important links, documentation, and external study material for immediate access.",
  },
  {
    icon: "📎",
    title: "Files & Study Groups",
    description:
      "Upload files with rich previews, invite study partners, and collaborate live as changes appear instantly.",
  },
];

export default async function LandingPage() {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <Navbar user={user} />

      <main className="flex-1">
        <section className="relative overflow-hidden px-6 py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(55%_55%_at_50%_0%,rgba(99,102,241,0.16),transparent_70%)]"
          />
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
              Built for university students
            </span>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-6xl">
              One workspace for all your <span className="text-gradient">academic goals</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
              Eliminate group-chat chaos. Organize your courses, track study tasks, and keep
              essential study links in one calm, shared place.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="rounded-lg bg-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              >
                Get Started Free
              </Link>
              <Link
                href="/login"
                className="rounded-lg border border-zinc-300 bg-white px-8 py-3.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                Log In
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
            Designed to solve student disorganization
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="h-full">
                <div className="text-3xl" aria-hidden>
                  {feature.icon}
                </div>
                <h3 className="mt-3 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 pb-24">
          <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-sky-600 px-8 py-12 text-center text-white shadow-xl">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Ready to organize your semester?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-indigo-100">
              Create a free account and bring your courses, tasks, and resources together in
              minutes.
            </p>
            <Link
              href="/signup"
              className="mt-6 inline-block rounded-lg bg-white px-8 py-3.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
            >
              Create your account
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 py-6 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        © {new Date().getFullYear()} StudySync. Built for academic efficiency.
      </footer>
    </div>
  );
}
