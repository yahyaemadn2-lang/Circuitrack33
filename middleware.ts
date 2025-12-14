import { getSession, getUserRole, UserRole } from './src/modules/auth/auth.session';

type RouteConfig = {
  pattern: RegExp;
  allowedRoles: UserRole[];
};

const protectedRoutes: RouteConfig[] = [
  {
    pattern: /^\/(ar|en|zh)\/buyer\//,
    allowedRoles: ['buyer'],
  },
  {
    pattern: /^\/(ar|en|zh)\/vendor\//,
    allowedRoles: ['vendor'],
  },
  {
    pattern: /^\/(ar|en|zh)\/admin\//,
    allowedRoles: ['admin'],
  },
];

export async function checkRouteAccess(pathname: string): Promise<{
  allowed: boolean;
  redirect?: string;
  status?: number;
  error?: string;
}> {
  const matchedRoute = protectedRoutes.find(route => route.pattern.test(pathname));

  if (!matchedRoute) {
    return { allowed: true };
  }

  const { session } = await getSession();

  if (!session) {
    const lang = pathname.split('/')[1] || 'en';
    return {
      allowed: false,
      redirect: `/${lang}/auth/login`,
      status: 401,
      error: 'Authentication required',
    };
  }

  const { role } = await getUserRole();

  if (!role || !matchedRoute.allowedRoles.includes(role)) {
    return {
      allowed: false,
      status: 403,
      error: 'Insufficient permissions',
    };
  }

  return { allowed: true };
}

export async function protectRoute(pathname: string): Promise<Response | null> {
  const result = await checkRouteAccess(pathname);

  if (!result.allowed) {
    if (result.redirect) {
      return new Response(null, {
        status: 302,
        headers: { Location: result.redirect },
      });
    }

    return new Response(
      JSON.stringify({ error: result.error }),
      {
        status: result.status || 403,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  return null;
}
