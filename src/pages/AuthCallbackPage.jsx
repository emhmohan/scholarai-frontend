import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function AuthCallbackPage() {
  const [params]  = useSearchParams();
  const navigate  = useNavigate();
  const { setAuth } = useAuth();

  useEffect(() => {
    const token = params.get('token');
    const user  = params.get('user');
    const error = params.get('error');

    if (error) {
      navigate('/login?error=' + error);
      return;
    }

    if (token && user) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(user));
        localStorage.setItem('scholarai_token', token);
        localStorage.setItem('scholarai_user',  JSON.stringify(parsedUser));
        setAuth(token, parsedUser);
        navigate('/dashboard');
      } catch {
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, []);

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16 }}>
      <div style={{ width:40, height:40, borderRadius:'50%', border:'2px solid var(--y)', borderTopColor:'transparent', animation:'spinSlow 0.8s linear infinite' }} />
      <p style={{ color:'var(--muted)', fontSize:14 }}>Signing you in...</p>
    </div>
  );
}