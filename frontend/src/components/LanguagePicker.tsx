import Link from 'next/link';

export function LanguagePicker() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-cream dark:bg-charcoal">
      <div className="text-center max-w-md">
        <h1 className="font-display text-2xl sm:text-3xl text-charcoal dark:text-cream tracking-tight mb-2">
          CosmoVid
        </h1>
        <p className="text-stone dark:text-stone/80 text-sm sm:text-base mb-8">
          Choose your language / اختر لغتك
        </p>
        <nav className="flex flex-col sm:flex-row gap-4 justify-center" aria-label="Language selection">
          <Link
            href="/en"
            className="px-6 py-3 rounded-lg font-medium bg-charcoal dark:bg-cream text-cream dark:text-charcoal hover:bg-charcoal/90 dark:hover:bg-cream/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-cream dark:focus-visible:ring-offset-charcoal"
          >
            English
          </Link>
          <Link
            href="/ar"
            className="px-6 py-3 rounded-lg font-medium border-2 border-charcoal dark:border-cream text-charcoal dark:text-cream hover:bg-charcoal/10 dark:hover:bg-cream/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-cream dark:focus-visible:ring-offset-charcoal"
          >
            العربية
          </Link>
        </nav>
      </div>
    </div>
  );
}
