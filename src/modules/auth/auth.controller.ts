import { loginSchema, registerSchema } from './auth.schema';
import { login, register, logout } from './auth.service';

export async function handleLogin(req: Request) {
  try {
    const body = await req.json();
    const validated = loginSchema.parse(body);

    const result = await login(validated.email, validated.password);

    if (!result.success) {
      return new Response(
        JSON.stringify({ message: result.error }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ message: 'Login successful', data: result.data }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: 'Invalid input' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function handleRegister(req: Request) {
  try {
    const body = await req.json();
    const validated = registerSchema.parse(body);

    const result = await register(validated.email, validated.password);

    if (!result.success) {
      return new Response(
        JSON.stringify({ message: result.error }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ message: 'Registration successful', data: result.data }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: 'Invalid input' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function handleLogout(_req: Request) {
  try {
    const result = await logout();

    if (!result.success) {
      return new Response(
        JSON.stringify({ message: result.error }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ message: 'Logout successful' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: 'Logout failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
