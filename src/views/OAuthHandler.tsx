import { useEffect } from 'react';
import { useNavigate } from 'react-router';

export default function OAuthHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash.substring(1); // Remove '#'
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    if (accessToken) {
      localStorage.setItem('access_token', accessToken);
      navigate('/profile'); // Redirect to profile
    }
  }, [navigate]);

  return <div>Logging in...</div>;
}
