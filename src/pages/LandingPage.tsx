import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Hammer } from 'lucide-react';
import { ROUTES } from '../router/routes';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      <nav className="bg-white border-b px-6 h-16 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <div className="bg-orange-600 text-white p-1.5 rounded"><Hammer size={20}/></div>
          <span className="font-black text-xl uppercase">Builder<span className="text-orange-600">Mate</span></span>
        </div>
        <div className="space-x-4">
          <button onClick={() => navigate(ROUTES.login)} className="font-bold">Log In</button>
          <button onClick={() => navigate(ROUTES.signup)} className="bg-slate-900 text-white px-5 py-2 rounded font-bold">Get Started</button>
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 bg-white">
        <h1 className="text-6xl font-black mb-6">
          Build smarter, <span className="text-orange-600">quote faster.</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mb-10">
          The all-in-one construction management platform (legacy prototype).
        </p>
        <div className="flex gap-4">
          <button onClick={() => navigate(ROUTES.signup)} className="bg-orange-600 text-white px-8 py-4 rounded-xl text-lg font-bold shadow-xl hover:bg-orange-700">
            Start Free
          </button>
          <button onClick={() => navigate(ROUTES.login)} className="bg-white border px-8 py-4 rounded-xl text-lg font-bold">
            View Demo
          </button>
        </div>
      </div>
    </div>
  );
}
