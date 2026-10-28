import { router } from './router';
import { renderPortfolioHome } from './views/portfolio.view';
import { renderPageEditor, renderProjectEditor } from './views/editor.view';
import { auth } from './services/firebase/firebase';
import { createLink, createMessage, makeElement } from './modules/utils.module';
import { getUserRole, logoutUser, loginWithGoogle } from './services/firebase/authService';
import { onAuthStateChanged } from 'firebase/auth';
import { renderPages } from './views/pages.view';
import { renderPublicPageView } from './views/page.view';
import { getAllPages } from './services/firebase/db';
import { goToLink } from './services/goto.service';
import { renderNotFoundPage } from './views/notFound.view';
import { renderP4aPfp } from './views/p4apfp.view';
import { state } from './modules/state.module';

const appElement = document.getElementById('app') as HTMLDivElement;

async function initApp() {
  await auth.authStateReady();
  state.setCurrentUser(auth.currentUser);
  const urlParams = new URLSearchParams(window.location.search);
  const gotToParam = urlParams.get('goto');
  if (gotToParam) {
    await goToLink(gotToParam);
  }

  // Header setup
  const headerElement = document.querySelector("header") as HTMLElement;
  const nav = document.createElement("nav");
  const portfolioLink = makeElement("a", null, null, "Portfolio");
  portfolioLink.addEventListener("click", () => router.navigateTo("/"));
  nav.appendChild(portfolioLink);

  if (!state.pages) {
    state.setPages(await getAllPages())
  }
  if (state.pages) {
    state.pages.map((page) => {
      if (page.navLink) {
        const pageLink = createLink({ href: `/${page.id}`, linkText: page.title, external: false });
        nav.appendChild(pageLink);
      }
    });
  }

  const adventureBlogLink = createLink({ href: "https://disney.ryanmontville.com/", linkText: "My Adventure Blog", external: false });
  adventureBlogLink.setAttribute('data-external', '');
  // const githubLink = createLink({ href: "https://github.com/RyanMontville", linkText: "GitHub", external: true });
  // const linkedinLink = createLink({ href: "https://www.linkedin.com/in/ryanmontville/", linkText: "LinkedIn", external: true });
  // const instagramLink = createLink({ href: "https://www.instagram.com/ryanmontville/", linkText: "Instagram", external: true });
  nav.append(adventureBlogLink);

  const headerImg = document.createElement("img") as HTMLImageElement;
  headerImg.src = "https://raw.githubusercontent.com/RyanMontville/ryanmontville.github.io/main/images/main.png";
  const headerH1 = makeElement("h1", null, null, "Ryan Montville");
  headerElement.append(nav, headerImg, headerH1);

  const closeMobileNav = () => {
    body.classList.remove('no-scroll-fixed');
    mobileNavToggle.classList.remove('active');
    nav.classList.remove('active');
  };

  const mobileNavToggle = document.getElementById('mobile-nav-toggle') as HTMLElement;
  const body = document.querySelector('body') as HTMLElement;
  mobileNavToggle.addEventListener('click', () => {
    body.classList.toggle('no-scroll-fixed');
    mobileNavToggle.classList.toggle('active');
    nav.classList.toggle('active');
  });

  nav.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'A' || target.closest('a')) {
      closeMobileNav();
    }
  });

  // Footer setup
  const footerElement = document.querySelector("footer");
  if (footerElement) {
    const copyright = document.createElement("p");
    copyright.textContent = `©${new Date().getFullYear().toString()} Ryan Montville. All rights reserved.`;
    const loginBtn = document.createElement("button");
    loginBtn.setAttribute("id", "log-in-btn");
    loginBtn.setAttribute("type", "button");
    loginBtn.textContent = "Loading...";
    loginBtn.addEventListener("click", () => handleLogInButton());
    footerElement.append(copyright, loginBtn);
  }

  await auth.authStateReady();

  if (state.currentUser) {
    try {
      state.setCurrentRole(await getUserRole(state.currentUser.uid));
      console.log(`User ${state.currentUser.displayName} role is ${state.currentRole}`);
    } catch (error: any) {
      createMessage({ messageBody: error.message || error, location: "main-message", type: "error" });
    }
  }

  updateUIBasedOnAuth();

  // Routes
  router.addRoute('/', () => {
    renderPortfolioHome(appElement);
  });

  router.addRoute("/portfolio", () => {
    renderPortfolioHome(appElement);
  });

  router.addRoute("/pages", () => {
    renderPages(appElement);
  });

  router.addRoute("/p4a-pfp-maker", () => {
    renderP4aPfp();
  })

  router.addRoute('/:id/edit', (params) => {
    const pageId = params.id;
    renderPageEditor(appElement, pageId);
  });

  router.addRoute('/portfolio/:id/edit', (params) => {
    const projectID = params.id;
    renderProjectEditor(appElement, projectID);

  })

  router.addRoute('/:id', (params) => {
    const pageId = params.id;
    renderPublicPageView(appElement, pageId);
  });

  router.addRoute('*', () => {
    const attemptedPath = window.location.pathname.replace(/^\/+/, '');

    renderNotFoundPage(appElement, attemptedPath);
  });

  // Auth stuff
  onAuthStateChanged(auth, async (user) => {
    if (user?.uid !== state.currentUser.uid) {
      state.setCurrentUser(user);
      state.setCurrentRole(null);
      try {
        if (user) {
          state.setCurrentRole(await getUserRole(user.uid));
        }
      } catch (error: any) {
        createMessage({ messageBody: error.message || error, location: "main-message", type: "error" });
      }
      updateUIBasedOnAuth();
    }
  });

  router.init();
}

async function updateUIBasedOnAuth() {
  const nav = document.querySelector("header nav") as HTMLElement;
  if (nav) {
    const existingPagesLink = nav.querySelector("#pages-nav-link");
    if (existingPagesLink) existingPagesLink.remove();

    if (state.currentRole === "admin") {
      const pagesLink = document.createElement("a") as HTMLAnchorElement;
      pagesLink.id = "pages-nav-link";
      pagesLink.textContent = "Pages";
      pagesLink.addEventListener("click", () => router.navigateTo(`/pages`));
      nav.appendChild(pagesLink);
    }
  }

  const loginBtn = document.getElementById("log-in-btn") as HTMLButtonElement;
  if (loginBtn) {
    if (state.currentUser) {
      loginBtn.textContent = "Log Out";
    } else {
      loginBtn.textContent = "Log In";
    }
  }
}

async function handleLogInButton() {
  try {
    if (state.currentUser) {
      await logoutUser();
      state.setCurrentUser(null);
      createMessage({ messageBody: "You have been logged out", location: "main-message", type: "info" });
      window.location.reload();
    } else {
      const user = await loginWithGoogle();
      createMessage({ messageBody: `Welcome, ${user?.displayName}`, location: "main-message", type: "info" });
      window.location.reload();
    }
  } catch (error: any) {
    createMessage({ messageBody: error.message || error, location: "main-message", type: "error" });
  }
}

initApp();