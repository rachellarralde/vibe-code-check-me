/**
 * Simple hash-based router for switching feature sections.
 */

const routes = {};
let currentRoute = null;

export function registerRoute(name, showFn, hideFn) {
  routes[name] = { show: showFn, hide: hideFn };
}

export function navigate(name) {
  if (currentRoute && routes[currentRoute]) {
    routes[currentRoute].hide();
  }
  currentRoute = name;
  if (routes[name]) {
    routes[name].show();
    window.location.hash = name;
  }
}

export function closeCurrentRoute() {
  if (currentRoute && routes[currentRoute]) {
    routes[currentRoute].hide();
    currentRoute = null;
    window.location.hash = '';
  }
}

export function getCurrentRoute() {
  return currentRoute;
}
