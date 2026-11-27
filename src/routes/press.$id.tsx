import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/app-client";
import { LanguageProvider } from "@/lib/i18n";
import { SmoothScroll } from "@/components/SmoothScroll";
import { SectionFX } from "@/components/SectionFX";
import { formatEventDate } from "@/lib/content-hooks";
import { ResolvedImg } from "@/components/ResolvedImg";
import { LOGO_URL } from "@/lib/media";

export const Route = createFileRoute("/press/$id")({
  head: ({ loaderData }) => {
    const p = loaderData as any;
    if (!p) {
      return {
        meta: [
          { title: "Article not found — 510 Press" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    return {
      meta: [
        { title: `${p.title} — 510 Press` },
        { name: "description", content: p.excerpt ?? p.title },
        { property: "og:title", content: p.title },
        { property: "og:description", content: p.excerpt ?? "" },
        { property: "og:type", content: "article" },
        ...(p.image_url
          ? [
              { property: "og:image", content: p.image_url },
              { name: "twitter:image", content: p.image_url },
            ]
          : []),
      ],
    };
  },
  loader: async ({ params }) => {
    const { data, error } = await supabase
      .from("press")
      .select("id,title,published_date,excerpt,image_url,body")
      .eq("id", params.id)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw notFound();
    return data;
  },
  component: () => (
    <LanguageProvider>
      <PressArticle />
    </LanguageProvider>
  ),
  notFoundComponent: PressMissing,
});

function PressMissing() {
  return (
    <div className="grid min-h-screen place-items-center bg-background text-foreground">
      <div className="text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-white/50">404 — Not found</p>
        <h1 className="text-display mt-3 text-5xl">Article unavailable.</h1>
        <Link to="/" className="mt-8 inline-block text-xs uppercase tracking-[0.3em] underline">
          Back home
        </Link>
      </div>
    </div>
  );
}

function PressArticle() {
  const { id } = Route.useParams();
  const { data } = useQuery({
    queryKey: ["press", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("press")
        .select("id,title,published_date,excerpt,image_url,body")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    initialData: Route.useLoaderData(),
  });

  if (!data) return null;

  return (
    <>
      <SmoothScroll />
      <div className="min-h-screen bg-background text-foreground">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-5 md:px-10">
            <Link to="/" className="flex items-center gap-2">
              <img src={LOGO_URL} alt="510" className="h-6 w-6 invert" />
              <span className="text-display text-lg">510</span>
            </Link>
            <Link to="/" hash="press" className="text-[10px] uppercase tracking-[0.3em] text-white/70 hover:text-white">
              ← All press
            </Link>
          </div>
        </header>

        <article className="relative overflow-hidden pb-24 pt-16 md:pb-32 md:pt-24">
          <SectionFX logoOpacity={0.05} grainOpacity={0.15} />

          <div className="relative z-10 mx-auto max-w-3xl px-5 md:px-10">
            <div className="text-[10px] uppercase tracking-[0.3em] text-white/50">
              {formatEventDate(data.published_date)}
            </div>
            <h1 className="text-display mt-4 text-4xl leading-[0.95] md:text-6xl">
              {data.title}
            </h1>
            {data.excerpt && (
              <p className="mt-6 text-lg text-white/70 md:text-xl">{data.excerpt}</p>
            )}

            {data.image_url && (
              <div className="mt-10 overflow-hidden border border-white/10">
                <ResolvedImg src={data.image_url} alt={data.title} className="h-auto w-full object-cover" />
              </div>
            )}


            {data.body && (
              <div
                className="prose prose-invert mt-10 max-w-none prose-headings:text-display prose-a:text-white"
                dangerouslySetInnerHTML={{ __html: data.body }}
              />
            )}
          </div>
        </article>
      </div>
    </>
  );
}
