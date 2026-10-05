import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/Card";
import { getAuthUser } from "@/lib/auth";

export default async function LandingPage() {
  const user = await getAuthUser();

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-slate">
      <Navbar user={user ? { name: "User" } : null} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-brand-navy to-brand-primary text-white py-20 px-4 sm:px-6 text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-white">
              One Workspace for All Your Academic Goals
            </h1>
            <p className="text-lg sm:text-xl text-brand-accent max-w-2xl mx-auto">
              Eliminate group chat chaos. Organize your courses, track study tasks, and maintain study links seamlessly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                href="/signup"
                className="bg-brand-accent text-brand-navy px-8 py-3.5 rounded-lg font-bold hover:bg-white transition-colors shadow-lg"
              >
                Get Started Free
              </Link>
              <Link
                href="/login"
                className="border border-white/30 text-white px-8 py-3.5 rounded-lg font-bold hover:bg-white/10 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-brand-navy mb-12">
            Designed to Solve Student Disorganization
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <div className="text-3xl mb-3">📚</div>
              <h3 className="text-xl font-bold text-brand-navy mb-2">Course Workspaces</h3>
              <p className="text-sm text-brand-slate">
                Keep syllabus info, module details, tasks, and reference links cleanly partitioned per course.
              </p>
            </Card>
            <Card>
              <div className="text-3xl mb-3">✅</div>
              <h3 className="text-xl font-bold text-brand-navy mb-2">Task Management</h3>
              <p className="text-sm text-brand-slate">
                Track status across Not Started, In Progress, and Completed. Never miss assignment due dates.
              </p>
            </Card>
            <Card>
              <div className="text-3xl mb-3">🔗</div>
              <h3 className="text-xl font-bold text-brand-navy mb-2">Resource Sharing</h3>
              <p className="text-sm text-brand-slate">
                Centralize important links, documentation, and external study files for immediate team access.
              </p>
            </Card>
          </div>
        </section>
      </main>

      <footer className="bg-brand-navy text-gray-400 text-center py-6 border-t border-brand-primary/30 text-sm">
        © {new Date().getFullYear()} StudySync. Built for academic efficiency.
      </footer>
    </div>
  );
}