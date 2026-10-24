export type RouteHandler = (params: Record<string, string>, query: URLSearchParams) => void;

interface Route {
  pattern: RegExp;
  paramNames: string[];
  handler: RouteHandler;
}

class Router {
  private routes: Route[] = [];
  private ignoredPaths: string[] = [];

  /**
   * Add path prefixes that should be ignored by the SPA router 
   * (e.g., other GitHub Pages projects hosted on the same domain).
   */
  ignorePath(pathPrefix: string) {
    this.ignoredPaths.push(pathPrefix);
  }

  addRoute(path: string, handler: RouteHandler) {
    const paramNames: string[] = [];
    let regexPath: string;

    if (path === '*') {
      regexPath = '.*';
    } else {
      const sanitizedPath = path.replace(/\/+$/, '') || '/';
      regexPath = sanitizedPath.replace(/:([^/]+)/g, (_, paramName) => {
        paramNames.push(paramName);
        return '([^/]+)';
      });
    }

    this.routes.push({
      pattern: new RegExp(`^${regexPath}/?$`),
      paramNames,
      handler,
    });
  }

  navigateTo(path: string, replace = false) {
    if (replace) {
      window.history.replaceState({}, '', path);
    } else {
      window.history.pushState({}, '', path);
    }
    this.handleRoute();
  }

  init() {
    window.addEventListener('popstate', () => this.handleRoute());

    document.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement).closest('a');
      
      if (
        target &&
        target.href &&
        target.origin === window.location.origin &&
        target.getAttribute('target') !== '_blank' &&
        !target.hasAttribute('download') &&
        !target.hasAttribute('data-external') && // Allows manual opting-out via HTML
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey &&
        !e.altKey
      ) {
        const url = new URL(target.href);

        // Check if the target pathname starts with any ignored path prefix
        const isIgnored = this.ignoredPaths.some((prefix) => 
          url.pathname.startsWith(prefix)
        );

        if (isIgnored) {
          // Let the browser handle the navigation normally to GitHub Pages
          return; 
        }

        if (url.pathname !== window.location.pathname || url.search !== window.location.search) {
          e.preventDefault();
          this.navigateTo(url.pathname + url.search + url.hash);
        }
      }
    });

    this.handleRoute();
  }

  private handleRoute() {
    const pathname = window.location.pathname;
    const query = new URLSearchParams(window.location.search);

    for (const route of this.routes) {
      const match = pathname.match(route.pattern);
      if (match) {
        const params: Record<string, string> = {};
        route.paramNames.forEach((name, index) => {
          params[name] = match[index + 1] ? decodeURIComponent(match[index + 1]) : '';
        });
        route.handler(params, query);
        return;
      }
    }

    this.navigateTo('/', true);
  }
}

export const router = new Router();