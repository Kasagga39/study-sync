import { getAuthUser } from "@/lib/auth";
import { isCourseParticipant } from "@/lib/access";
import { subscribe } from "@/lib/events";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteContext) {
  const authUser = await getAuthUser();
  if (!authUser) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const canView = await isCourseParticipant(id, authUser.userId);
  if (!canView) {
    return new Response("Not found", { status: 404 });
  }

  const encoder = new TextEncoder();
  let cleanup: (() => void) | null = null;

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: string) => {
        try {
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        } catch {
          // Stream already closed.
        }
      };

      const unsubscribe = subscribe(`course:${id}`, send);
      const ping = setInterval(() => send(JSON.stringify({ type: "ping" })), 15000);

      cleanup = () => {
        clearInterval(ping);
        unsubscribe();
      };

      _req.signal?.addEventListener("abort", () => {
        cleanup?.();
        try {
          controller.close();
        } catch {
          // Already closed.
        }
      });

      send(JSON.stringify({ type: "ready" }));
    },
    cancel() {
      cleanup?.();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

export const dynamic = "force-dynamic";
