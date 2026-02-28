import Link from "next/link";
import { Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <img 
                src="/Resumr.svg" 
                alt="Resumr Logo" 
                className="w-8 h-8 object-contain" 
              />
              <span className="text-2xl font-bold text-white">Resumr</span>
            </Link>
            <p className="text-slate-400 mb-6 max-w-sm">
              AI-powered resume and cover letter tailoring for every job description. Get hired faster with Resumr.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
              <a href="#" className="hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4">Product</h3>
            <ul className="space-y-3">
              <li><Link href="#features" className="hover:text-indigo-400 transition-colors">Features</Link></li>
              <li><Link href="#pricing" className="hover:text-indigo-400 transition-colors">Pricing</Link></li>
              <li><Link href="#how-it-works" className="hover:text-indigo-400 transition-colors">How it Works</Link></li>
              <li><Link href="/login" className="hover:text-indigo-400 transition-colors">Login</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-3">
              <li><Link href="/about" className="hover:text-indigo-400 transition-colors">About</Link></li>
              <li><Link href="/blog" className="hover:text-indigo-400 transition-colors">Blog</Link></li>
              <li><Link href="/careers" className="hover:text-indigo-400 transition-colors">Careers</Link></li>
              <li><Link href="/contact" className="hover:text-indigo-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><Link href="/privacy" className="hover:text-indigo-400 transition-colors">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-indigo-400 transition-colors">Terms</Link></li>
              <li><Link href="/security" className="hover:text-indigo-400 transition-colors">Security</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm">© {new Date().getFullYear()} Resumr. All rights reserved.</p>
          <div className="flex items-center gap-6 text-sm">
            <span>Made with ❤️ for job seekers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
