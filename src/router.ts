export type RouteHandler = (params: Record<string, string>) => void;

interface Route {
  pattern: RegExp;
  paramNames: string[];
  handler: RouteHandler;
}

class Router {
  private routes: Route[] = [];

  addRoute(path: string, handler: RouteHandler) {
    const paramNames: string[] = [];
    let regexPath: string;

    if (path === '*') {
      regexPath = '.*';
    } else {
      regexPath = path.replace(/:([^/]+)/g, (_, paramName) => {
        paramNames.push(paramName);
        return '([^/]+)';
      });
    }

    this.routes.push({
      pattern: new RegExp(`^${regexPath}$`),
      paramNames,
      handler,
    });
  }

  navigateTo(path: string) {
    window.history.pushState({}, '', path);
    this.handleRoute();
  }

  init() {
    window.addEventListener('popstate', () => this.handleRoute());

    document.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement).closest('a');
      if (target && target.href && target.origin === window.location.origin) {
        const url = new URL(target.href);
        if (url.pathname !== window.location.pathname) {
          e.preventDefault();
          this.navigateTo(url.pathname);
        }
      }
    });

    this.handleRoute();
  }

  private handleRoute() {
    const path = window.location.pathname;

    for (const route of this.routes) {
      const match = path.match(route.pattern);
      if (match) {
        const params: Record<string, string> = {};
        route.paramNames.forEach((name, index) => {
          params[name] = match[index + 1];
        });
        route.handler(params);
        return;
      }
    }

    this.navigateTo('/');
  }
}

export const router = new Router();