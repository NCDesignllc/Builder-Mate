import React from 'react';
import { Hammer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../router/routes';

type LoginProps = {
  mode: 'login';
  onLogin: (email: string, password: string) => void;
};

type SignupProps = {
  mode: 'signup';
  onSignup: (name: string, email: string, password: string) => void;
};

type ProfileProps = {
  mode: 'profile';
  onProfile: (title: string) => void;
};

type Props = LoginProps | SignupProps | ProfileProps;

export function AuthPage(props: Props) {
  const navigate = useNavigate();

  const title =
    props.mode === 'login' ? 'Welcome Back' :
    props.mode === 'profile' ? 'Setup Profile' :
    'Create Account';

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    if (props.mode === 'login') {
      props.onLogin(String(fd.get('email') ?? ''), String(fd.get('password') ?? ''));
      navigate(ROUTES.dashboard, { replace: true });
      return;
    }

    if (props.mode === 'signup') {
      props.onSignup(
        String(fd.get('name') ?? ''),
        String(fd.get('email') ?? ''),
        String(fd.get('password') ?? '')
      );
      navigate(ROUTES.profile, { replace: true });
      return;
    }

    props.onProfile(String(fd.get('title') ?? 'Estimator'));
    navigate(ROUTES.dashboard, { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border overflow-hidden">
        <div className="p-8 bg-slate-900 text-white text-center">
          <Hammer size={32} className="mx-auto mb-4 text-orange-500" />
          <h2 className="text-2xl font-black uppercase">{title}</h2>
        </div>

        <form onSubmit={onSubmit} className="p-8 space-y-4">
          {props.mode === 'signup' && (
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Name</label>
              <input name="name" required className="w-full border p-2 rounded" placeholder="John Doe" />
            </div>
          )}

          {props.mode !== 'profile' && (
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
              <input name="email" type="email" required className="w-full border p-2 rounded" placeholder="user@company.com" />
            </div>
          )}

          {props.mode === 'profile' && (
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Job Title</label>
              <input name="title" required className="w-full border p-2 rounded" placeholder="Estimator" />
            </div>
          )}

          {props.mode !== 'profile' && (
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Password</label>
              <input name="password" type="password" required className="w-full border p-2 rounded" placeholder="••••••" />
            </div>
          )}

          <button className="w-full bg-orange-600 text-white py-3 rounded font-bold">Continue</button>

          {props.mode !== 'profile' && (
            <p className="text-center text-sm text-slate-500 mt-4">
              {props.mode === 'login' ? (
                <span className="cursor-pointer hover:text-orange-600" onClick={() => navigate(ROUTES.signup)}>
                  Need an account?
                </span>
              ) : (
                <span className="cursor-pointer hover:text-orange-600" onClick={() => navigate(ROUTES.login)}>
                  Have an account?
                </span>
              )}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
