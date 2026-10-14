import { Leaf } from "lucide-react";

export default function Footer() {
  const footerLinks = [
    {
      title: "Product",
      links: [
        { name: "How It Works", href: "#how-it-works" },
        { name: "Who It's For", href: "#audience" },
        { name: "Pricing", href: "#pricing" },
        { name: "Try the Demo", href: "/login" },
      ]
    },
    {
      title: "Research & privacy",
      links: [
        { name: "Research we build on", href: "#research" },
        { name: "Privacy, in plain language", href: "/privacy" },
        { name: "Sign up", href: "/signup" },
      ]
    },
  ];

  return (
    <footer className="bg-ink pt-20 pb-10 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Row */}
        <div className="flex flex-col md:flex-row justify-between gap-12 mb-16">
          {/* Logo & Tagline */}
          <div className="w-full md:w-1/3">
            <div className="flex items-center mb-4">
              <span className="font-nunito font-bold text-2xl text-white flex items-center gap-2">
                <Leaf className="text-teal-700" size={28} /> NeuroBloom
              </span>
            </div>
            <p className="font-dm-sans text-white/60 text-lg">
              Where every brain gets to bloom.
            </p>
          </div>

          {/* Links Columns */}
          <div className="w-full md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-8">
            {footerLinks.map((column, idx) => (
              <div key={idx} className="flex flex-col gap-4">
                <h4 className="font-dm-sans font-bold text-white mb-2">{column.title}</h4>
                {column.links.map((link, linkIdx) => (
                  <a key={linkIdx} href={link.href} className="font-dm-sans text-white/60 hover:text-white transition-colors text-sm">
                    {link.name}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Row */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-dm-sans text-white/60 text-sm">
            © 2026 NeuroBloom. A pilot project, built with the autism community in mind.
          </p>
        </div>
      </div>
    </footer>
  );
}
