import { Heart, MessageSquare, Zap } from "lucide-react"
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
    <div className="flex flex-col gap-5 px-4 py-5">
      <div>
        <h1 className="font-display text-5xl font-black uppercase">Feed</h1>
        <p className="mt-1 font-mono-label text-xs text-muted-foreground">
          Monster Club community activity
        </p>
      </div>

      <LockedFeature title="Community Feed" description="Share progress photos and updates">
        <div className="space-y-4 p-4">
          {MOCK_POSTS.map((post) => (
            <div key={post.user} className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="flex items-center gap-3 p-4 pb-3">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="flex-1">
                  <div className="text-sm font-semibold">{post.user}</div>
                  <div className="font-mono-label text-[10px] text-muted-foreground">
                    Day {post.day} · {post.time}
                  </div>
                </div>
                <div className="flex items-center gap-1">
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
    </div>
  )
}
