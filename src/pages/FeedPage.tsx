import { Heart, MessageSquare, Zap } from "lucide-react"
import { PageContent, PageHeader } from "@/components/layout/PageContent"
import { LockedFeature } from "@/components/monster/LockedFeature"
import { isFeatureEnabled } from "@/lib/featureFlags"

const MOCK_POSTS = [
  {
    user: "Jordan Lee",
    day: 75,
    caption: "Day 75. DONE. MONSTER status achieved.",
    tasks: 7,
    likes: 234,
    time: "2h ago",
  },
  {
    user: "Marcus Webb",
    day: 42,
    caption: "Day 42 — halfway. WARRIOR climbing to ALPHA.",
    tasks: 7,
    likes: 87,
    time: "5h ago",
  },
]

export function FeedPage() {
  if (isFeatureEnabled("feed")) {
    return null
  }

  return (
    <PageContent>
      <PageHeader
        title="Feed"
        description="Monster Club community activity"
      />

      <LockedFeature title="Community Feed" description="Share progress photos and updates">
        <div className="flex flex-col gap-4">
          {MOCK_POSTS.map((post) => (
            <div key={post.user} className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="flex items-center gap-3 p-4 pb-3">
                <div className="h-10 w-10 shrink-0 rounded-full bg-muted" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">{post.user}</div>
                  <div className="font-mono-label text-[10px] text-muted-foreground">
                    Day {post.day} · {post.time}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <span className="font-mono-label text-[10px] font-bold text-primary">
                    {post.tasks}/7
                  </span>
                  {post.tasks === 7 && <Zap className="h-3.5 w-3.5 text-primary" />}
                </div>
              </div>
              <div className="h-40 bg-muted" />
              <div className="px-4 py-3">
                <p className="text-sm text-foreground/90">{post.caption}</p>
              </div>
              <div className="flex gap-4 border-t border-border px-4 py-3">
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Heart className="h-4 w-4" /> {post.likes}
                </span>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MessageSquare className="h-4 w-4" /> Reply
                </span>
              </div>
            </div>
          ))}
        </div>
      </LockedFeature>
    </PageContent>
  )
}
