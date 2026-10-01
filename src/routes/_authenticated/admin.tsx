import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/app-client";
import { useServerFn } from "@tanstack/react-start";
import { toast, Toaster } from "sonner";
import {
  Music as MusicIcon,
  Calendar,
  ShoppingBag,
  Image as ImageIcon,
  Newspaper,
  Mail,
  Link2,
  Users as UsersIcon,
  LogOut,
  Trash2,
  Plus,
  Instagram,
  Youtube,
  Twitter,
  Facebook,
  Twitch,
  Music2,
  Radio,
  Disc3,
  Globe,
  Ghost,
  AtSign,
  Settings as SettingsIcon,
  Menu,
  Search,
  ChevronDown,
} from "lucide-react";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useConfirm, confirmAction } from "@/components/admin/ConfirmDialog";
import { DateField } from "@/components/admin/DateField";


import { ImageUpload } from "@/components/admin/ImageUpload";
import { RichEditor } from "@/components/admin/RichEditor";
import { resolveMediaUrl, deleteMedia, isCdnRef } from "@/lib/admin-upload";
import {
  createAdminUser,
  listAdminUsers,
  deleteAdminUser,
} from "@/lib/admin-users.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin — 510" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

type Section =
  | "music"
  | "tour"
  | "merch"
  | "gallery"
  | "press"
  | "contacts"
  | "social"
  | "settings"
  | "users";

const NAV: { id: Section; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "music", label: "Music", icon: MusicIcon },
  { id: "tour", label: "Tour", icon: Calendar },
  { id: "merch", label: "Merch", icon: ShoppingBag },
  { id: "gallery", label: "Gallery", icon: ImageIcon },
  { id: "press", label: "Press", icon: Newspaper },
  { id: "contacts", label: "Contacts", icon: Mail },
  { id: "social", label: "Social", icon: Link2 },
  { id: "settings", label: "Site Settings", icon: SettingsIcon },
  { id: "users", label: "Users", icon: UsersIcon },
];


const SOCIAL_PLATFORMS = [
  { value: "instagram", label: "Instagram", Icon: Instagram },
  { value: "youtube", label: "YouTube", Icon: Youtube },
  { value: "twitter", label: "Twitter / X", Icon: Twitter },
  { value: "facebook", label: "Facebook", Icon: Facebook },
  { value: "tiktok", label: "TikTok", Icon: MusicIcon },
  { value: "threads", label: "Threads", Icon: AtSign },
  { value: "spotify", label: "Spotify", Icon: Music2 },
  { value: "soundcloud", label: "SoundCloud", Icon: Radio },
  { value: "bandcamp", label: "Bandcamp", Icon: Disc3 },
  { value: "apple_music", label: "Apple Music", Icon: Music2 },
  { value: "twitch", label: "Twitch", Icon: Twitch },
  { value: "website", label: "Website", Icon: Globe },
] as const;

function socialIcon(platform: string | null | undefined) {
  const p = SOCIAL_PLATFORMS.find((x) => x.value === platform);
  return p ? p.Icon : Ghost;
}

function AdminPage() {
  const navigate = useNavigate();
  const [section, setSection] = useState<Section>("music");
  const [menuOpen, setMenuOpen] = useState(false);
  const { dialog: confirmUI } = useConfirm();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email ?? "");
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!data);
    })();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-background text-muted-foreground grid place-items-center text-sm">
        Loading…
      </div>
    );
  }
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background text-foreground grid place-items-center px-6 text-center">
        <div>
          <h1 className="text-2xl font-semibold">Not authorized</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {email} doesn't have admin access.
          </p>
          <button
            onClick={signOut}
            className="mt-6 border border-border rounded-md px-4 py-2 text-xs uppercase tracking-widest hover:bg-muted"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  const Current = NAV.find((n) => n.id === section)!;

  const navList = (onPick?: () => void) => (
    <nav className="p-2 sm:p-3 flex flex-col gap-1">
      {NAV.map((item) => {
        const Icon = item.icon;
        const active = section === item.id;
        return (
          <button
            key={item.id}
            onClick={() => {
              setSection(item.id);
              onPick?.();
            }}
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
              active
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster theme="dark" position="bottom-right" />
      {confirmUI}
      <div className="lg:grid lg:grid-cols-[240px_1fr] min-h-screen">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex lg:flex-col border-r border-border bg-card lg:sticky lg:top-0 lg:h-screen">
          <div className="p-5 border-b border-border">
            <Link to="/" className="flex items-baseline gap-2 group">
              <span className="text-2xl font-bold tracking-tighter">510</span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground group-hover:text-foreground transition">
                admin
              </span>
            </Link>
            <p className="mt-2 text-xs text-muted-foreground truncate">{email}</p>
          </div>
          {navList()}
          <div className="p-3 mt-auto border-t border-border">
            <button
              onClick={signOut}
              className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </aside>

        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-30 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-card/95 backdrop-blur px-3 py-3">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <button
                aria-label="Open menu"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border"
              >
                <Menu className="h-4 w-4" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[260px] p-0 bg-card">
              <div className="p-4 border-b border-border">
                <Link to="/" className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold tracking-tighter">510</span>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                    admin
                  </span>
                </Link>
                <p className="mt-1 text-xs text-muted-foreground truncate">{email}</p>
              </div>
              {navList(() => setMenuOpen(false))}
              <div className="p-3 border-t border-border">
                <button
                  onClick={signOut}
                  className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex min-w-0 items-center gap-2">
            <Current.icon className="h-4 w-4 shrink-0" />
            <span className="truncate text-sm font-medium">{Current.label}</span>
          </div>
          <button
            onClick={signOut}
            aria-label="Sign out"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </header>

        {/* Content */}
        <main className="p-4 sm:p-6 lg:p-10 max-w-5xl w-full min-w-0">
          <header className="mb-6 sm:mb-8 hidden lg:flex items-center gap-3">
            <Current.icon className="h-6 w-6 shrink-0" />
            <h1 className="text-3xl font-semibold tracking-tight truncate">{Current.label}</h1>
          </header>

          {section === "music" && <MusicSection />}
          {section === "tour" && <TourSection />}
          {section === "merch" && <MerchSection />}
          {section === "gallery" && <GallerySection />}
          {section === "press" && <PressSection />}
          {section === "contacts" && <ContactsSection />}
          {section === "social" && <SocialSection />}
          {section === "settings" && <SiteSettingsSection />}
          {section === "users" && <UsersSection currentUserEmail={email} />}
        </main>

      </div>
    </div>
  );
}



/* ------------------------------ Primitives ------------------------------ */

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-border bg-card p-4 sm:p-5 ${className}`}>{children}</div>
  );
}


function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[10px] uppercase tracking-widest text-muted-foreground">
      {children}
    </label>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-foreground outline-none ${
        props.className ?? ""
      }`}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-foreground outline-none ${
        props.className ?? ""
      }`}
    />
  );
}

function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex items-center gap-2 rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50 ${
        props.className ?? ""
      }`}
    />
  );
}

function DangerIconButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition ${
        props.className ?? ""
      }`}
    />
  );
}

function useTable<T extends { id: string }>(table: string) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from(table as any)
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows(((data as unknown) as T[]) ?? []);
    setLoading(false);
  }, [table]);

  useEffect(() => {
    load();
  }, [load]);

  async function create(payload: Record<string, any>) {
    const { error } = await supabase.from(table as any).insert(payload as any);
    if (error) {
      toast.error(error.message);
      return false;
    }
    toast.success("Created");
    await load();
    return true;
  }

  async function update(id: string, patch: Record<string, any>) {
    const { error } = await supabase.from(table as any).update(patch as any).eq("id", id);
    if (error) {
      toast.error(error.message);
      return false;
    }
    setRows((r) => r.map((row) => (row.id === id ? { ...row, ...patch } : row)));
    return true;
  }

  async function remove(id: string) {
    if (!(await confirmAction({ title: "Delete this item?" }))) return;
    const { error } = await supabase.from(table as any).delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setRows((r) => r.filter((row) => row.id !== id));
    toast.success("Deleted");
  }

  return { rows, loading, load, create, update, remove };
}

/* -------------------------------- Music --------------------------------- */

function ytId(url: string): string | null {
  if (!url) return null;
  const m = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/,
  );
  return m ? m[1] : null;
}

function MusicSection() {
  const tracks = useTable<{
    id: string;
    title: string;
    youtube_url: string;
    sort_order: number;
    is_active: boolean;
  }>("music");
  const bgs = useTable<{ id: string; image_url: string; sort_order: number }>("music_backgrounds");

  const [nt, setNt] = useState({ title: "", youtube_url: "", sort_order: 0, is_active: true });
  const [nb, setNb] = useState<{ image_url: string | null; sort_order: number }>({
    image_url: null,
    sort_order: 0,
  });

  return (
    <div className="space-y-10">
      {/* Tracks */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-medium">Tracks</h2>
          <span className="text-xs text-muted-foreground">{tracks.rows.length} items</span>
        </div>

        <Card>
          <div className="grid gap-4 md:grid-cols-[1fr_1fr_100px_120px]">
            <div>
              <Label>Title</Label>
              <TextInput value={nt.title} onChange={(e) => setNt({ ...nt, title: e.target.value })} />
            </div>
            <div>
              <Label>YouTube URL</Label>
              <TextInput
                value={nt.youtube_url}
                onChange={(e) => setNt({ ...nt, youtube_url: e.target.value })}
                placeholder="https://youtu.be/…"
              />
            </div>
            <div>
              <Label>Order</Label>
              <TextInput
                type="number"
                value={nt.sort_order}
                onChange={(e) => setNt({ ...nt, sort_order: Number(e.target.value) })}
              />
            </div>
            <div className="flex items-end gap-2">
              <label className="mt-6 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={nt.is_active}
                  onChange={(e) => setNt({ ...nt, is_active: e.target.checked })}
                />
                Active
              </label>
            </div>
          </div>
          <PrimaryButton
            className="mt-4"
            onClick={async () => {
              if (!nt.title || !nt.youtube_url) return toast.error("Title and URL required");
              const ok = await tracks.create(nt);
              if (ok) setNt({ title: "", youtube_url: "", sort_order: 0, is_active: true });
            }}
          >
            <Plus className="h-4 w-4" /> Add track
          </PrimaryButton>
        </Card>

        {tracks.loading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : tracks.rows.length === 0 ? (
          <div className="text-sm text-muted-foreground">No tracks yet.</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {tracks.rows.map((t) => {
              const id = ytId(t.youtube_url);
              return (
                <Card key={t.id}>
                  <div className="aspect-video overflow-hidden rounded-md bg-muted">
                    {id ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${id}`}
                        title={t.title}
                        className="h-full w-full"
                        allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="h-full w-full grid place-items-center text-xs text-muted-foreground">
                        Invalid URL
                      </div>
                    )}
                  </div>
                  <div className="mt-3 space-y-3">
                    <div>
                      <Label>Title</Label>
                      <TextInput
                        defaultValue={t.title}
                        onBlur={(e) =>
                          e.target.value !== t.title && tracks.update(t.id, { title: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>YouTube URL</Label>
                      <TextInput
                        defaultValue={t.youtube_url}
                        onBlur={(e) =>
                          e.target.value !== t.youtube_url &&
                          tracks.update(t.id, { youtube_url: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Order</Label>
                        <TextInput
                          type="number"
                          defaultValue={t.sort_order}
                          onBlur={(e) => tracks.update(t.id, { sort_order: Number(e.target.value) })}
                        />
                      </div>
                      <label className="mt-6 flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={t.is_active}
                          onChange={(e) => tracks.update(t.id, { is_active: e.target.checked })}
                        />
                        Active
                      </label>
                    </div>
                    <div className="flex justify-end">
                      <DangerIconButton onClick={() => tracks.remove(t.id)}>
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </DangerIconButton>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Backgrounds */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-medium">Music backgrounds</h2>
          <span className="text-xs text-muted-foreground">{bgs.rows.length} items</span>
        </div>

        <Card>
          <div className="grid gap-4 md:grid-cols-[1fr_140px_140px]">
            <ImageUpload
              bucket="music-bg"
              value={nb.image_url}
              onChange={(v) => setNb({ ...nb, image_url: v })}
              label="Background image"
            />
            <div>
              <Label>Order</Label>
              <TextInput
                type="number"
                value={nb.sort_order}
                onChange={(e) => setNb({ ...nb, sort_order: Number(e.target.value) })}
              />
            </div>
            <div className="flex items-end">
              <PrimaryButton
                onClick={async () => {
                  if (!nb.image_url) return toast.error("Upload an image first");
                  const ok = await bgs.create(nb);
                  if (ok) setNb({ image_url: null, sort_order: 0 });
                }}
              >
                <Plus className="h-4 w-4" /> Add
              </PrimaryButton>
            </div>
          </div>
        </Card>

        {bgs.loading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : bgs.rows.length === 0 ? (
          <div className="text-sm text-muted-foreground">No backgrounds yet.</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bgs.rows.map((b) => (
              <Card key={b.id}>
                <ImageUpload
                  bucket="music-bg"
                  value={b.image_url}
                  onChange={(v) => bgs.update(b.id, { image_url: v ?? "" })}
                  label="Image"
                />
                <div className="mt-3 flex items-end gap-3">
                  <div className="flex-1">
                    <Label>Order</Label>
                    <TextInput
                      type="number"
                      defaultValue={b.sort_order}
                      onBlur={(e) => bgs.update(b.id, { sort_order: Number(e.target.value) })}
                    />
                  </div>
                  <DangerIconButton onClick={() => bgs.remove(b.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </DangerIconButton>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* --------------------------------- Tour --------------------------------- */

type TourRow = {
  id: string;
  event_date: string | null;
  city: string | null;
  venue: string | null;
  event_name: string | null;
  ticket_url: string | null;
  status: string | null;
  sort_order: number;
};

function TourSection() {
  const t = useTable<TourRow>("tour_dates");
  const [n, setN] = useState<Partial<TourRow>>({ status: "available", sort_order: 0 });

  return (
    <div className="space-y-6">
      <Card>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <Label>Date</Label>
            <DateField
              value={n.event_date}
              onChange={(iso) => setN({ ...n, event_date: iso })}
            />
          </div>
          <div>
            <Label>City</Label>
            <TextInput
              value={n.city ?? ""}
              onChange={(e) => setN({ ...n, city: e.target.value })}
            />
          </div>
          <div>
            <Label>Venue</Label>
            <TextInput
              value={n.venue ?? ""}
              onChange={(e) => setN({ ...n, venue: e.target.value })}
            />
          </div>
          <div>
            <Label>Event name</Label>
            <TextInput
              value={n.event_name ?? ""}
              onChange={(e) => setN({ ...n, event_name: e.target.value })}
            />
          </div>
          <div>
            <Label>Ticket URL</Label>
            <TextInput
              value={n.ticket_url ?? ""}
              onChange={(e) => setN({ ...n, ticket_url: e.target.value })}
            />
          </div>
          <div>
            <Label>Status</Label>
            <Select
              value={n.status ?? "available"}
              onChange={(e) => setN({ ...n, status: e.target.value })}
            >
              <option value="available">Available</option>
              <option value="low">Low stock</option>
              <option value="sold_out">Sold out</option>
            </Select>
          </div>
        </div>
        <PrimaryButton
          className="mt-4"
          onClick={async () => {
            const ok = await t.create(n);
            if (ok) setN({ status: "available", sort_order: 0 });
          }}
        >
          <Plus className="h-4 w-4" /> Add date
        </PrimaryButton>
      </Card>

      <div className="space-y-3">
        {t.rows.map((r) => (
          <Card key={r.id}>
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <Label>Date</Label>
                <DateField
                  value={r.event_date}
                  onChange={(iso) => t.update(r.id, { event_date: iso })}
                />
              </div>
              <div>
                <Label>City</Label>
                <TextInput
                  defaultValue={r.city ?? ""}
                  onBlur={(e) => t.update(r.id, { city: e.target.value })}
                />
              </div>
              <div>
                <Label>Venue</Label>
                <TextInput
                  defaultValue={r.venue ?? ""}
                  onBlur={(e) => t.update(r.id, { venue: e.target.value })}
                />
              </div>
              <div>
                <Label>Event name</Label>
                <TextInput
                  defaultValue={r.event_name ?? ""}
                  onBlur={(e) => t.update(r.id, { event_name: e.target.value })}
                />
              </div>
              <div>
                <Label>Ticket URL</Label>
                <TextInput
                  defaultValue={r.ticket_url ?? ""}
                  onBlur={(e) => t.update(r.id, { ticket_url: e.target.value })}
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  defaultValue={r.status ?? "available"}
                  onChange={(e) => t.update(r.id, { status: e.target.value })}
                >
                  <option value="available">Available</option>
                  <option value="low">Low stock</option>
                  <option value="sold_out">Sold out</option>
                </Select>
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <DangerIconButton onClick={() => t.remove(r.id)}>
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </DangerIconButton>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* --------------------------------- Merch -------------------------------- */

type MerchRow = {
  id: string;
  name_en: string;
  name_id: string;
  price: string;
  url: string | null;
  badge: string | null;
  in_stock: boolean;
  sort_order: number;
};

type MerchImage = {
  id: string;
  merch_id: string;
  image_url: string;
  sort_order: number;
};

function MerchImagesEditor({ merchId }: { merchId: string }) {
  const [images, setImages] = useState<MerchImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [previews, setPreviews] = useState<Record<string, string | null>>({});

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("merch_images")
      .select("*")
      .eq("merch_id", merchId)
      .order("sort_order", { ascending: true });
    if (error) toast.error(error.message);
    setImages((data as MerchImage[]) ?? []);
    setLoading(false);
  }, [merchId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    let cancel = false;
    (async () => {
      const entries = await Promise.all(
        images.map(async (img) => [img.id, await resolveMediaUrl(img.image_url)] as const),
      );
      if (!cancel) setPreviews(Object.fromEntries(entries));
    })();
    return () => {
      cancel = true;
    };
  }, [images]);

  async function addImage(ref: string | null) {
    if (!ref) return;
    const next = (images[images.length - 1]?.sort_order ?? -1) + 1;
    const { error } = await supabase
      .from("merch_images")
      .insert({ merch_id: merchId, image_url: ref, sort_order: next });
    if (error) {
      toast.error(error.message);
      void deleteMedia(ref);
      return;
    }
    toast.success("Photo added");
    load();
  }

  async function removeImage(img: MerchImage) {
    if (!(await confirmAction({ title: "Remove this photo?", confirmLabel: "Remove" }))) return;
    const { error } = await supabase.from("merch_images").delete().eq("id", img.id);
    if (error) return toast.error(error.message);
    void deleteMedia(img.image_url);
    setImages((prev) => prev.filter((x) => x.id !== img.id));
  }

  async function reorder(img: MerchImage, dir: -1 | 1) {
    const idx = images.findIndex((x) => x.id === img.id);
    const other = images[idx + dir];
    if (!other) return;
    await Promise.all([
      supabase.from("merch_images").update({ sort_order: other.sort_order }).eq("id", img.id),
      supabase.from("merch_images").update({ sort_order: img.sort_order }).eq("id", other.id),
    ]);
    load();
  }

  return (
    <div className="mt-4 border-t border-border pt-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Photos ({images.length})
        </div>
        <div className="text-[10px] text-muted-foreground">First photo = main</div>
      </div>

      {loading ? (
        <div className="text-xs text-muted-foreground">Loading photos…</div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img, i) => (
            <div key={img.id} className="group relative aspect-[3/4] overflow-hidden rounded-md border border-border bg-muted/30">
              {previews[img.id] ? (
                <img src={previews[img.id] ?? ""} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center text-xs text-muted-foreground">…</div>
              )}
              {i === 0 && (
                <span className="absolute left-2 top-2 rounded bg-foreground px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-background">
                  Main
                </span>
              )}
              <span
                title={
                  isCdnRef(img.image_url)
                    ? "Served from the free CDN — no Cloud usage"
                    : "Stored in Cloud — still uses bandwidth"
                }
                className={`absolute right-2 top-2 rounded px-1.5 py-0.5 text-[9px] uppercase tracking-widest ${
                  isCdnRef(img.image_url)
                    ? "bg-emerald-500/90 text-black"
                    : "bg-amber-500/90 text-black"
                }`}
              >
                {isCdnRef(img.image_url) ? "CDN" : "Cloud"}
              </span>
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-background/85 p-1.5 opacity-0 transition group-hover:opacity-100">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => reorder(img, -1)}
                    disabled={i === 0}
                    className="rounded bg-muted px-1.5 py-0.5 text-xs disabled:opacity-30"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => reorder(img, 1)}
                    disabled={i === images.length - 1}
                    className="rounded bg-muted px-1.5 py-0.5 text-xs disabled:opacity-30"
                  >
                    →
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(img)}
                  className="rounded bg-destructive/90 px-1.5 py-0.5 text-xs text-destructive-foreground"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
          <div className="aspect-[3/4]">
            <ImageUpload bucket="merch" value={null} onChange={addImage} label="+ Add" />
          </div>
        </div>
      )}
    </div>
  );
}

function NewMerchPhotos({
  refs,
  setRefs,
}: {
  refs: string[];
  setRefs: (r: string[]) => void;
}) {
  const [previews, setPreviews] = useState<Record<string, string | null>>({});

  useEffect(() => {
    let cancel = false;
    (async () => {
      const entries = await Promise.all(
        refs.map(async (r) => [r, await resolveMediaUrl(r)] as const),
      );
      if (!cancel) setPreviews(Object.fromEntries(entries));
    })();
    return () => {
      cancel = true;
    };
  }, [refs]);

  return (
    <div className="mt-4 border-t border-border pt-4">
      <div className="mb-3 text-[10px] uppercase tracking-widest text-muted-foreground">
        Photos ({refs.length}) — first photo = main
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {refs.map((r) => (
          <div
            key={r}
            className="group relative aspect-[3/4] overflow-hidden rounded-md border border-border bg-muted/30"
          >
            {previews[r] ? (
              <img src={previews[r] ?? ""} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full place-items-center text-xs text-muted-foreground">…</div>
            )}
            <button
              type="button"
              onClick={() => {
                setRefs(refs.filter((x) => x !== r));
                void deleteMedia(r);
              }}
              className="absolute right-1.5 top-1.5 rounded bg-destructive/90 p-1 text-destructive-foreground"
              aria-label="Remove photo"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
        <div className="aspect-[3/4]">
          <ImageUpload
            bucket="merch"
            value={null}
            onChange={(ref) => ref && setRefs([...refs, ref])}
            label="+ Add"
          />
        </div>
      </div>
    </div>
  );
}

function MerchSection() {
  const m = useTable<MerchRow>("merch");
  const [n, setN] = useState<Partial<MerchRow>>({ in_stock: true, sort_order: 0 });
  const [newPhotos, setNewPhotos] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const filtered = m.rows.filter((r) =>
    (r.name_en ?? "").toLowerCase().includes(query.trim().toLowerCase()),
  );

  async function createItem() {
    if (!n.name_en || !n.price) return toast.error("Name and price required");
    setSaving(true);
    const { data, error } = await supabase
      .from("merch")
      .insert({
        name_en: n.name_en,
        name_id: n.name_en,
        price: n.price,
        url: n.url ?? null,
        badge: (n.badge as any) || null,
        in_stock: n.in_stock ?? true,
        sort_order: n.sort_order ?? 0,
      })
      .select("id")
      .single();
    if (error || !data) {
      setSaving(false);
      return toast.error(error?.message ?? "Failed to create");
    }
    if (newPhotos.length) {
      const { error: imgErr } = await supabase.from("merch_images").insert(
        newPhotos.map((ref, i) => ({ merch_id: data.id, image_url: ref, sort_order: i })),
      );
      if (imgErr) toast.error(imgErr.message);
    }
    toast.success("Item added");
    setN({ in_stock: true, sort_order: 0 });
    setNewPhotos([]);
    setShowForm(false);
    setSaving(false);
    await m.load();
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 sm:flex sm:items-center sm:justify-between">
        <div className="relative min-w-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search merch…"
            className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-foreground"
          />
        </div>
        <PrimaryButton onClick={() => setShowForm((v) => !v)} className="shrink-0">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">{showForm ? "Close" : "Add item"}</span>
        </PrimaryButton>
      </div>

      {showForm && (
        <Card>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Name</Label>
              <TextInput
                value={n.name_en ?? ""}
                onChange={(e) => setN({ ...n, name_en: e.target.value })}
              />
            </div>
            <div>
              <Label>Price</Label>
              <TextInput value={n.price ?? ""} onChange={(e) => setN({ ...n, price: e.target.value })} />
            </div>
            <div>
              <Label>URL</Label>
              <TextInput value={n.url ?? ""} onChange={(e) => setN({ ...n, url: e.target.value })} />
            </div>
            <div>
              <Label>Badge</Label>
              <Select value={n.badge ?? ""} onChange={(e) => setN({ ...n, badge: e.target.value || null })}>
                <option value="">—</option>
                <option value="new">New</option>
                <option value="pre_order">Pre-order</option>
              </Select>
            </div>
            <label className="flex items-center gap-2 text-sm sm:mt-6">
              <input
                type="checkbox"
                checked={n.in_stock ?? true}
                onChange={(e) => setN({ ...n, in_stock: e.target.checked })}
              />
              In stock
            </label>
          </div>

          <NewMerchPhotos refs={newPhotos} setRefs={setNewPhotos} />

          <PrimaryButton className="mt-4" disabled={saving} onClick={createItem}>
            <Plus className="h-4 w-4" /> {saving ? "Saving…" : "Save item"}
          </PrimaryButton>
        </Card>
      )}

      <div className="space-y-2">
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground">No items found.</p>
        )}
        {filtered.map((r) => {
          const open = openId === r.id;
          return (
            <div key={r.id} className="rounded-lg border border-border bg-card">
              <button
                type="button"
                onClick={() => setOpenId(open ? null : r.id)}
                className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 text-left"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{r.name_en}</div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                    <span>{r.price}</span>
                    {r.badge && <span className="rounded bg-muted px-1.5 py-0.5">{r.badge}</span>}
                    {!r.in_stock && <span className="text-destructive">Out of stock</span>}
                  </div>
                </div>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-muted-foreground transition ${open ? "rotate-180" : ""}`}
                />
              </button>

              {open && (
                <div className="border-t border-border p-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label>Name</Label>
                      <TextInput
                        defaultValue={r.name_en}
                        onBlur={(e) =>
                          m.update(r.id, { name_en: e.target.value, name_id: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Price</Label>
                      <TextInput defaultValue={r.price} onBlur={(e) => m.update(r.id, { price: e.target.value })} />
                    </div>
                    <div>
                      <Label>URL</Label>
                      <TextInput defaultValue={r.url ?? ""} onBlur={(e) => m.update(r.id, { url: e.target.value })} />
                    </div>
                    <div>
                      <Label>Badge</Label>
                      <Select
                        defaultValue={r.badge ?? ""}
                        onChange={(e) => m.update(r.id, { badge: e.target.value || null })}
                      >
                        <option value="">—</option>
                        <option value="new">New</option>
                        <option value="pre_order">Pre-order</option>
                      </Select>
                    </div>
                    <label className="flex items-center gap-2 text-sm sm:mt-6">
                      <input
                        type="checkbox"
                        checked={r.in_stock}
                        onChange={(e) => m.update(r.id, { in_stock: e.target.checked })}
                      />
                      In stock
                    </label>
                  </div>

                  <MerchImagesEditor merchId={r.id} />

                  <div className="mt-3 flex justify-end">
                    <DangerIconButton onClick={() => m.remove(r.id)}>
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </DangerIconButton>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}



/* -------------------------------- Gallery ------------------------------- */

function GallerySection() {
  const g = useTable<{ id: string; image_url: string; caption: string | null; sort_order: number }>(
    "gallery",
  );
  const [n, setN] = useState<{ image_url: string | null; caption: string; sort_order: number }>({
    image_url: null,
    caption: "",
    sort_order: 0,
  });

  return (
    <div className="space-y-6">
      <Card>
        <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
          <ImageUpload
            bucket="gallery"
            value={n.image_url}
            onChange={(v) => setN({ ...n, image_url: v })}
            label="Photo"
          />
          <div className="space-y-4">
            <div>
              <Label>Caption</Label>
              <TextInput value={n.caption} onChange={(e) => setN({ ...n, caption: e.target.value })} />
            </div>
            <div>
              <Label>Order</Label>
              <TextInput
                type="number"
                value={n.sort_order}
                onChange={(e) => setN({ ...n, sort_order: Number(e.target.value) })}
              />
            </div>
            <PrimaryButton
              onClick={async () => {
                if (!n.image_url) return toast.error("Upload a photo first");
                const ok = await g.create(n);
                if (ok) setN({ image_url: null, caption: "", sort_order: 0 });
              }}
            >
              <Plus className="h-4 w-4" /> Add photo
            </PrimaryButton>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {g.rows.map((r) => (
          <Card key={r.id}>
            <ImageUpload
              bucket="gallery"
              value={r.image_url}
              onChange={(v) => g.update(r.id, { image_url: v ?? "" })}
              label="Photo"
            />
            <div className="mt-3 space-y-2">
              <div>
                <Label>Caption</Label>
                <TextInput
                  defaultValue={r.caption ?? ""}
                  onBlur={(e) => g.update(r.id, { caption: e.target.value })}
                />
              </div>
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <Label>Order</Label>
                  <TextInput
                    type="number"
                    defaultValue={r.sort_order}
                    onBlur={(e) => g.update(r.id, { sort_order: Number(e.target.value) })}
                  />
                </div>
                <DangerIconButton onClick={() => g.remove(r.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </DangerIconButton>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* --------------------------------- Press -------------------------------- */

type PressRow = {
  id: string;
  title: string;
  published_date: string | null;
  excerpt: string | null;
  image_url: string | null;
  body: string | null;
  sort_order: number;
};

function PressSection() {
  const p = useTable<PressRow>("press");
  const [editing, setEditing] = useState<PressRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Partial<PressRow>>({});

  function startNew() {
    setDraft({
      title: "",
      published_date: new Date().toISOString().slice(0, 10),
      excerpt: "",
      image_url: null,
      body: "",
      sort_order: 0,
    });
    setEditing(null);
    setCreating(true);
  }

  function edit(row: PressRow) {
    setDraft({ ...row });
    setEditing(row);
    setCreating(false);
  }

  async function save() {
    if (!draft.title) return toast.error("Title is required");
    if (creating) {
      const ok = await p.create(draft);
      if (ok) {
        setCreating(false);
        setDraft({});
      }
    } else if (editing) {
      const ok = await p.update(editing.id, draft);
      if (ok) {
        toast.success("Saved");
        setEditing(null);
        setDraft({});
      }
    }
  }

  const isEditing = creating || editing;

  return (
    <div className="space-y-6">
      {!isEditing && (
        <>
          <div className="flex justify-end">
            <PrimaryButton onClick={startNew}>
              <Plus className="h-4 w-4" /> New article
            </PrimaryButton>
          </div>
          <div className="space-y-3">
            {p.rows.map((r) => (
              <Card key={r.id} className="flex gap-4 items-start">
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground">{r.published_date ?? "No date"}</div>
                  <div className="font-medium mt-0.5 truncate">{r.title}</div>
                  {r.excerpt && (
                    <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{r.excerpt}</div>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => edit(r)}
                    className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-muted"
                  >
                    Edit
                  </button>
                  <DangerIconButton onClick={() => p.remove(r.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </DangerIconButton>
                </div>
              </Card>
            ))}
            {p.rows.length === 0 && !p.loading && (
              <div className="text-sm text-muted-foreground">No press articles yet.</div>
            )}
          </div>
        </>
      )}

      {isEditing && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">{creating ? "New article" : "Edit article"}</h2>
            <button
              onClick={() => {
                setCreating(false);
                setEditing(null);
                setDraft({});
              }}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_260px]">
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <TextInput
                  value={draft.title ?? ""}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Date</Label>
                <TextInput
                  type="date"
                  value={draft.published_date ?? ""}
                  onChange={(e) => setDraft({ ...draft, published_date: e.target.value || null })}
                />
              </div>
              <div>
                <Label>Excerpt</Label>
                <textarea
                  value={draft.excerpt ?? ""}
                  onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })}
                  rows={2}
                  className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-foreground outline-none resize-none"
                />
              </div>
            </div>
            <div className="space-y-4">
              <ImageUpload
                bucket="press"
                value={draft.image_url}
                onChange={(v) => setDraft({ ...draft, image_url: v })}
                label="Cover image"
              />
              <div>
                <Label>Order</Label>
                <TextInput
                  type="number"
                  value={draft.sort_order ?? 0}
                  onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Label>Article body</Label>
            <div className="mt-1.5">
              <RichEditor value={draft.body ?? ""} onChange={(html) => setDraft({ ...draft, body: html })} />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <PrimaryButton onClick={save}>Save article</PrimaryButton>
          </div>
        </Card>
      )}
    </div>
  );
}

/* ------------------------------- Contacts ------------------------------- */

function ContactsSection() {
  const c = useTable<{ id: string; label: string; email: string; sort_order: number }>(
    "contact_emails",
  );
  const [n, setN] = useState({ label: "", email: "", sort_order: 0 });

  return (
    <div className="space-y-6">
      <Card>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <Label>Label</Label>
            <TextInput value={n.label} onChange={(e) => setN({ ...n, label: e.target.value })} />
          </div>
          <div>
            <Label>Email</Label>
            <TextInput
              type="email"
              value={n.email}
              onChange={(e) => setN({ ...n, email: e.target.value })}
            />
          </div>
          <div>
            <Label>Order</Label>
            <TextInput
              type="number"
              value={n.sort_order}
              onChange={(e) => setN({ ...n, sort_order: Number(e.target.value) })}
            />
          </div>
        </div>
        <PrimaryButton
          className="mt-4"
          onClick={async () => {
            if (!n.label || !n.email) return toast.error("Both fields required");
            const ok = await c.create(n);
            if (ok) setN({ label: "", email: "", sort_order: 0 });
          }}
        >
          <Plus className="h-4 w-4" /> Add contact
        </PrimaryButton>
      </Card>

      <div className="space-y-3">
        {c.rows.map((r) => (
          <Card key={r.id}>
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <Label>Label</Label>
                <TextInput
                  defaultValue={r.label}
                  onBlur={(e) => c.update(r.id, { label: e.target.value })}
                />
              </div>
              <div>
                <Label>Email</Label>
                <TextInput
                  defaultValue={r.email}
                  onBlur={(e) => c.update(r.id, { email: e.target.value })}
                />
              </div>
              <div>
                <Label>Order</Label>
                <TextInput
                  type="number"
                  defaultValue={r.sort_order}
                  onBlur={(e) => c.update(r.id, { sort_order: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <DangerIconButton onClick={() => c.remove(r.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </DangerIconButton>
            </div>
          </Card>
        ))}
      </div>

      <PhonesBlock />
    </div>
  );
}

function PhonesBlock() {
  const p = useTable<{
    id: string;
    label: string;
    phone: string;
    is_whatsapp: boolean;
    sort_order: number;
  }>("contact_phones");
  const [n, setN] = useState({ label: "", phone: "", is_whatsapp: true, sort_order: 0 });

  return (
    <div className="space-y-4 pt-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Phone / WhatsApp
      </h3>
      <Card>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <Label>Label</Label>
            <TextInput
              placeholder="Booking"
              value={n.label}
              onChange={(e) => setN({ ...n, label: e.target.value })}
            />
          </div>
          <div>
            <Label>Number</Label>
            <TextInput
              placeholder="+62 812 3456 7890"
              value={n.phone}
              onChange={(e) => setN({ ...n, phone: e.target.value })}
            />
          </div>
          <div>
            <Label>Order</Label>
            <TextInput
              type="number"
              value={n.sort_order}
              onChange={(e) => setN({ ...n, sort_order: Number(e.target.value) })}
            />
          </div>
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={n.is_whatsapp}
            onChange={(e) => setN({ ...n, is_whatsapp: e.target.checked })}
          />
          WhatsApp number
        </label>
        <PrimaryButton
          className="mt-4"
          onClick={async () => {
            if (!n.label || !n.phone) return toast.error("Label and number required");
            const ok = await p.create(n);
            if (ok) setN({ label: "", phone: "", is_whatsapp: true, sort_order: 0 });
          }}
        >
          <Plus className="h-4 w-4" /> Add number
        </PrimaryButton>
      </Card>

      <div className="space-y-3">
        {p.rows.map((r) => (
          <Card key={r.id}>
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <Label>Label</Label>
                <TextInput
                  defaultValue={r.label}
                  onBlur={(e) => p.update(r.id, { label: e.target.value })}
                />
              </div>
              <div>
                <Label>Number</Label>
                <TextInput
                  defaultValue={r.phone}
                  onBlur={(e) => p.update(r.id, { phone: e.target.value })}
                />
              </div>
              <div>
                <Label>Order</Label>
                <TextInput
                  type="number"
                  defaultValue={r.sort_order}
                  onBlur={(e) => p.update(r.id, { sort_order: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  defaultChecked={r.is_whatsapp}
                  onChange={(e) => p.update(r.id, { is_whatsapp: e.target.checked })}
                />
                WhatsApp
              </label>
              <DangerIconButton onClick={() => p.remove(r.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </DangerIconButton>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------- Social -------------------------------- */

function SocialSection() {
  const s = useTable<{ id: string; platform: string; url: string; sort_order: number }>(
    "social_links",
  );
  const [n, setN] = useState({ platform: "instagram", url: "", sort_order: 0 });

  return (
    <div className="space-y-6">
      <Card>
        <div className="grid gap-4 md:grid-cols-[220px_1fr_120px]">
          <div>
            <Label>Platform</Label>
            <Select
              value={n.platform}
              onChange={(e) => setN({ ...n, platform: e.target.value })}
            >
              {SOCIAL_PLATFORMS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>URL</Label>
            <TextInput value={n.url} onChange={(e) => setN({ ...n, url: e.target.value })} />
          </div>
          <div>
            <Label>Order</Label>
            <TextInput
              type="number"
              value={n.sort_order}
              onChange={(e) => setN({ ...n, sort_order: Number(e.target.value) })}
            />
          </div>
        </div>
        <PrimaryButton
          className="mt-4"
          onClick={async () => {
            if (!n.url) return toast.error("URL required");
            const ok = await s.create(n);
            if (ok) setN({ platform: "instagram", url: "", sort_order: 0 });
          }}
        >
          <Plus className="h-4 w-4" /> Add link
        </PrimaryButton>
      </Card>

      <div className="space-y-3">
        {s.rows.map((r) => {
          const Icon = socialIcon(r.platform);
          return (
            <Card key={r.id}>
              <div className="grid gap-3 md:grid-cols-[60px_220px_1fr_120px]">
                <div className="flex items-center justify-center rounded-md border border-border bg-muted h-full min-h-[42px]">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <Label>Platform</Label>
                  <Select
                    defaultValue={r.platform}
                    onChange={(e) => s.update(r.id, { platform: e.target.value })}
                  >
                    {SOCIAL_PLATFORMS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>URL</Label>
                  <TextInput
                    defaultValue={r.url}
                    onBlur={(e) => s.update(r.id, { url: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Order</Label>
                  <TextInput
                    type="number"
                    defaultValue={r.sort_order}
                    onBlur={(e) => s.update(r.id, { sort_order: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <DangerIconButton onClick={() => s.remove(r.id)}>
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </DangerIconButton>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------- Users --------------------------------- */

function UsersSection({ currentUserEmail }: { currentUserEmail: string }) {
  const list = useServerFn(listAdminUsers);
  const create = useServerFn(createAdminUser);
  const del = useServerFn(deleteAdminUser);

  const [users, setUsers] = useState<
    { id: string; email: string; role: string; created_at: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [n, setN] = useState({ email: "", password: "", role: "admin" as "admin" | "editor" | "user" });
  const [busy, setBusy] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const data = await list();
      setUsers(data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit() {
    if (!n.email || !n.password) return toast.error("Email and password required");
    setBusy(true);
    try {
      await create({ data: n });
      toast.success("User created");
      setN({ email: "", password: "", role: "admin" });
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!(await confirmAction({ title: "Delete this user?", description: "The account will lose access immediately." }))) return;
    try {
      await del({ data: { id } });
      toast.success("Deleted");
      setUsers((u) => u.filter((x) => x.id !== id));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-sm font-medium mb-4">Create user</h2>
        <div className="grid gap-4 md:grid-cols-[1fr_1fr_160px]">
          <div>
            <Label>Email</Label>
            <TextInput
              type="email"
              value={n.email}
              onChange={(e) => setN({ ...n, email: e.target.value })}
            />
          </div>
          <div>
            <Label>Temporary password</Label>
            <TextInput
              type="text"
              value={n.password}
              onChange={(e) => setN({ ...n, password: e.target.value })}
              placeholder="min 8 chars"
            />
          </div>
          <div>
            <Label>Role</Label>
            <Select
              value={n.role}
              onChange={(e) => setN({ ...n, role: e.target.value as any })}
            >
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="user">User</option>
            </Select>
          </div>
        </div>
        <PrimaryButton className="mt-4" onClick={submit} disabled={busy}>
          <Plus className="h-4 w-4" /> {busy ? "Creating…" : "Create user"}
        </PrimaryButton>
      </Card>

      <div className="space-y-3">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Existing users</div>
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : (
          users.map((u) => (
            <Card key={u.id} className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">{u.email}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {u.role} · {new Date(u.created_at).toLocaleDateString()}
                </div>
              </div>
              {u.email !== currentUserEmail && (
                <DangerIconButton onClick={() => remove(u.id)}>
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </DangerIconButton>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

/* --------------------------- Site Settings ------------------------------ */

function SiteSettingsSection() {
  const [ga, setGa] = useState("");
  const [gsc, setGsc] = useState("");
  const [bit, setBit] = useState("");
  const [rowId, setRowId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("id,ga_measurement_id,gsc_verification_token,bandsintown_artist")
        .limit(1)
        .maybeSingle();
      if (error) toast.error(error.message);
      if (data) {
        setRowId(data.id);
        setGa(data.ga_measurement_id ?? "");
        setGsc(data.gsc_verification_token ?? "");
        setBit((data as { bandsintown_artist?: string | null }).bandsintown_artist ?? "");
      }
      setLoading(false);
    })();
  }, []);

  async function save() {
    setBusy(true);
    const payload = {
      ga_measurement_id: ga.trim() || null,
      gsc_verification_token: gsc.trim() || null,
      bandsintown_artist: bit.trim() || null,
    };
    const { data, error } = rowId
      ? await supabase.from("site_settings").update(payload).eq("id", rowId).select("id").maybeSingle()
      : await supabase.from("site_settings").insert(payload).select("id").maybeSingle();
    setBusy(false);
    if (error) return toast.error(error.message);
    if (data?.id) setRowId(data.id);
    toast.success("Saved");
  }

  if (loading) return <div className="text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <div className="space-y-4">
          <div>
            <Label>Google Analytics Measurement ID</Label>
            <TextInput
              placeholder="G-XXXXXXXXXX"
              value={ga}
              onChange={(e) => setGa(e.target.value)}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Injects the gtag.js snippet on every page. Leave empty to disable.
            </p>
          </div>
          <div>
            <Label>Google Search Console Verification Token</Label>
            <TextInput
              placeholder="abc123... (the content value only)"
              value={gsc}
              onChange={(e) => setGsc(e.target.value)}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Adds a <code>&lt;meta name="google-site-verification"&gt;</code> tag.
            </p>
          </div>
          <div>
            <Label>Bandsintown Artist</Label>
            <TextInput
              placeholder="510 (or the artist id from bandsintown.com/a/...)"
              value={bit}
              onChange={(e) => setBit(e.target.value)}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Upcoming events from Bandsintown are shown in the Tour section together with the dates you add manually. Leave empty to disable.
            </p>
          </div>
        </div>
        <PrimaryButton className="mt-4" onClick={save} disabled={busy}>
          {busy ? "Saving…" : "Save settings"}
        </PrimaryButton>
      </Card>
    </div>
  );
}

