import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { useSiteSettings } from "@/lib/content-hooks";


function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: import("@tanstack/react-router").ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "510 — Official Site | Squad 510" },
      { name: "description", content: "510 official website. Stream music, see 510 tour dates, shop 510 merch, gallery and press." },
      { name: "keywords", content: "510, 510 band, 510 official, 510 music, 510 tour, 510 merch, band 510" },
      { name: "author", content: "510" },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { name: "theme-color", content: "#0a0a0a" },
      { property: "og:site_name", content: "510" },
      { property: "og:title", content: "510 — Official Site | Squad 510" },
      { property: "og:description", content: "510 official website. Stream music, see 510 tour dates, shop 510 merch, gallery and press." },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "en_US" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "510 — Official Site | Squad 510" },
      { name: "twitter:description", content: "510 official website. Stream music, see 510 tour dates, shop 510 merch, gallery and press." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/X5kbwAgH0AWBijMcGa0TMGWAIMu1/social-images/social-1785048174744-The_frequency_was_real,_the_energy_was_unmatched.Berikut_sedikit_recap_momen_sakral_Spiritual_Re_(1).webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/X5kbwAgH0AWBijMcGa0TMGWAIMu1/social-images/social-1785048174744-The_frequency_was_real,_the_energy_was_unmatched.Berikut_sedikit_recap_momen_sakral_Spiritual_Re_(1).webp" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&display=swap" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "MusicGroup",
          name: "510",
          alternateName: ["510 band", "510 official"],
          url: "/",
          genre: ["Rock", "Alternative"],
          description: "510 — official website of the band 510.",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "510 — Official Site",
          url: "/",
          potentialAction: {
            "@type": "SearchAction",
            target: "/?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AnalyticsInjector />
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}

function AnalyticsInjector() {
  const { data } = useSiteSettings();
  const ga = data?.ga_measurement_id ?? null;
  const gsc = data?.gsc_verification_token ?? null;

  useEffect(() => {
    if (typeof document === "undefined") return;

    // Google Search Console verification meta tag
    let metaEl = document.querySelector<HTMLMetaElement>(
      'meta[name="google-site-verification"]',
    );
    if (gsc) {
      if (!metaEl) {
        metaEl = document.createElement("meta");
        metaEl.setAttribute("name", "google-site-verification");
        document.head.appendChild(metaEl);
      }
      metaEl.setAttribute("content", gsc);
    } else if (metaEl) {
      metaEl.remove();
    }

    // Google Analytics (gtag.js)
    if (ga) {
      if (!document.getElementById("ga-src")) {
        const s = document.createElement("script");
        s.id = "ga-src";
        s.async = true;
        s.src = `https://www.googletagmanager.com/gtag/js?id=${ga}`;
        document.head.appendChild(s);
      }
      if (!document.getElementById("ga-init")) {
        const s = document.createElement("script");
        s.id = "ga-init";
        s.text = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${ga}');`;
        document.head.appendChild(s);
      }
    }
  }, [ga, gsc]);

  return null;
}

