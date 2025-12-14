import { handleLogin, handleRegister, handleLogout } from '../../../src/modules/auth/auth.controller';

export async function POST(req: Request) {
  const url = new URL(req.url);
  const pathname = url.pathname;

  if (pathname.includes('/login')) {
    return handleLogin(req);
  }

  if (pathname.includes('/register')) {
    return handleRegister(req);
  }

  if (pathname.includes('/logout')) {
    return handleLogout(req);
  }

  return new Response(
    JSON.stringify({ message: 'Invalid endpoint' }),
    { status: 404, headers: { 'Content-Type': 'application/json' } }
  );
}
