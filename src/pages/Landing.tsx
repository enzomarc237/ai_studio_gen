import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Sparkles, FileText, LayoutTemplate, MessageSquare } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col">
      <header className="px-8 py-6 flex justify-between items-center border-b border-zinc-200 bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-6 w-6 text-indigo-600" />
          <span className="text-xl font-bold tracking-tight">AI Studio</span>
        </div>
        <nav className="flex space-x-4">
          <Link to="/auth" className="text-zinc-600 hover:text-zinc-900 font-medium px-4 py-2 transition-colors">Log in</Link>
          <Link to="/auth" className="bg-zinc-900 text-white px-5 py-2 rounded-xl font-medium hover:bg-zinc-800 transition-colors shadow-sm">Get Started</Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-3xl">
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-zinc-900 mb-6 leading-tight">
            From Idea to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500">Execution</span> in Minutes.
          </h1>
          <p className="text-xl text-zinc-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Generate PRDs, specifications, designs, and plans effortlessly. Brainstorm ideas, create UI wireframes, and chat with advanced AI models.
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/auth" className="bg-zinc-900 text-white px-8 py-4 rounded-2xl font-medium text-lg hover:bg-zinc-800 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
              Start Building Free
            </Link>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="h-14 w-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
              <FileText className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-zinc-900">Document Generation</h3>
            <p className="text-zinc-600">Instantly create comprehensive PRDs, technical specs, and project plans from simple prompts.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="h-14 w-14 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center mb-6">
              <LayoutTemplate className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-zinc-900">UI & Brand Design</h3>
            <p className="text-zinc-600">Generate wireframes, color palettes, typography suggestions, and brand assets automatically.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="h-14 w-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
              <MessageSquare className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-zinc-900">Intelligent Chatbot</h3>
            <p className="text-zinc-600">Interact with advanced AI models to brainstorm, refine ideas, and get instant answers.</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
