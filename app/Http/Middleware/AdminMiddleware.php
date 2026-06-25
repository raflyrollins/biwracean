<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! Auth::check() || ! Auth::user()->is_admin) {
            return redirect('/admin/login');
        }

        $routeName = $request->route()?->getName();

        if ($routeName && str_starts_with($routeName, 'admin.')) {
            $resource = explode('.', $routeName)[1] ?? null;

            if ($resource && $resource !== 'login' && $resource !== 'logout') {
                $permission = str_replace('-', '_', $resource);

                if (! Auth::user()->hasPermission($permission)) {
                    if ($resource === 'dashboard') {
                        abort(403, 'Akses ditolak.');
                    }

                    return redirect()->route('admin.dashboard')
                        ->with('success', 'Anda tidak memiliki akses ke halaman tersebut.');
                }
            }
        }

        return $next($request);
    }
}
