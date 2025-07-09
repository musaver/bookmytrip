'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const register = async () => {
    setError('');
    const res = await fetch('/api/register', {
      method: 'POST',
      body: JSON.stringify({ email, name, password }),
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Something went wrong');
    } else {
      // Auto-login after register
      const login = await signIn('credentials', {
        email,
        redirect: false,
      });

      if (login?.ok) {
        router.push('/dashboard');
      } else {
        setError('Registered but login failed.');
      }
    }
  };

  const sendEmail = async () => {
    setSending(true);
    setSuccess('');
    setError('');

    const res = await fetch('/api/email/send', {
      method: 'POST',
      body: JSON.stringify({
        to: 'musaverleo@gmail.com',
        subject: 'Hello from Dashboard',
        //message: 'This is a test email from your app.',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();
    setSending(false);

    if (res.ok) {
      setSuccess('Email sent successfully!');
    } else {
      setError(data.error || 'Failed to send email.');
    }
  };

  return (
    <div>
      <h1>Register</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={register}>Register</button>

      <br></br>

      <button onClick={() => signIn('google', { callbackUrl: '/dashboard' })}>
        Sign in with Google
      </button>
      <button onClick={() => signIn('facebook', { callbackUrl: '/dashboard' })}>
        Sign in with Facebook
      </button>

      <hr style={{ margin: '2rem 0' }} />

      <h2>Send Email</h2>
      <button onClick={sendEmail} disabled={sending}>
        {sending ? 'Sending...' : 'Send Email'}
      </button>
      {success && <p style={{ color: 'green' }}>{success}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
