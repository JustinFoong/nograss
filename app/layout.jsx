import "./globals.css";
import ThemeToggle from "../components/ThemeToggle";

export const metadata = {
  title: "Genshin Exploration Tracker",
  description: "Track exploration progress for Genshin Impact regions",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}

function SiteHeader() {
  return (
    <header className="w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-gray-900/70 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <a href="/" className="font-bold text-gray-900 dark:text-gray-100">Genshin Exploration Tracker</a>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">made by crown :)</span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}