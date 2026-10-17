import SafeImage from '@/components/common/SafeImage';
import { ArrowUpRight } from 'lucide-react';
import { instagramPosts, INSTAGRAM_PROFILE_URL, InstagramPost } from '@/data/instagram';

const MAX_POSTS = 6;

export default function InstagramSection({
  posts = instagramPosts,
  profileUrl = INSTAGRAM_PROFILE_URL,
}: {
  posts?: InstagramPost[];
  profileUrl?: string;
}) {
  const visiblePosts = posts.filter((p) => p.image && p.url).slice(0, MAX_POSTS);

  return (
    <section className="py-14 sm:py-20 bg-white" id="instagram" aria-labelledby="instagram-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10">
          <p className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-primary font-sans font-medium mb-3">
            @lumira_beauuty
          </p>
          <h2
            id="instagram-title"
            className="text-3xl sm:text-4xl md:text-5xl font-display font-medium text-txt mb-3 tracking-tight"
          >
            Síguenos en <span className="text-gradient italic">Instagram</span>
          </h2>
        </div>

        {visiblePosts.length > 0 && (
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mb-8 sm:mb-10">
            {visiblePosts.map((post) => (
              <li key={post.url}>
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block aspect-square overflow-hidden rounded-xl sm:rounded-2xl border border-border-light bg-secondary-100"
                  aria-label={`Ver publicación en Instagram: ${post.alt}`}
                >
                  <SafeImage
                    src={post.image}
                    alt={post.alt}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 bg-[#4a0f2e]/0 group-hover:bg-[#4a0f2e]/30 transition-colors duration-300" />
                </a>
              </li>
            ))}
          </ul>
        )}

        <div className="flex justify-center">
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full border border-primary text-primary text-sm font-semibold tracking-wide hover:bg-primary hover:text-white transition-all duration-300"
          >
            Visitar nuestro Instagram
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
