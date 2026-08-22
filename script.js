(() => {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const canvas = document.querySelector("#scene-canvas");
  let githubRequest;

  function initScene() {
    if (!canvas) return;
    const probe = document.createElement("canvas");
    const webglAvailable = Boolean(
      probe.getContext("webgl") || probe.getContext("experimental-webgl"),
    );
    if (!window.THREE || !webglAvailable) {
      const context = canvas.getContext("2d");
      if (!context) return;
      const points = Array.from({ length: 70 }, () => ({
        x: Math.random(),
        y: Math.random(),
        speed: 0.0002 + Math.random() * 0.0004,
      }));
      let width = 0;
      let height = 0;
      let fallbackFrame;
      let fallbackRunning = !document.hidden && !reduceMotion;
      function fallback(time) {
        const rect = canvas.getBoundingClientRect();
        if (width !== rect.width || height !== rect.height) {
          width = rect.width;
          height = rect.height;
          canvas.width = width * 2;
          canvas.height = height * 2;
        }
        context.setTransform(2, 0, 0, 2, 0, 0);
        context.clearRect(0, 0, width, height);
        context.strokeStyle = "rgba(216,243,107,.2)";
        context.lineWidth = 1;
        context.beginPath();
        points.forEach((point, index) => {
          point.y = (point.y + point.speed) % 1;
          const x = point.x * width;
          const y = point.y * height;
          context.moveTo(x - 3, y);
          context.lineTo(x + 3, y);
          if (index) {
            const previous = points[index - 1];
            context.moveTo(x, y);
            context.lineTo(previous.x * width, previous.y * height);
          }
        });
        context.stroke();
        context.strokeStyle = "#d8f36b";
        context.beginPath();
        context.arc(
          width / 2,
          height / 2,
          Math.min(width, height) * 0.23,
          0,
          Math.PI * 2,
        );
        context.stroke();
        if (fallbackRunning) fallbackFrame = requestAnimationFrame(fallback);
      }
      if (reduceMotion) fallback(0);
      else fallbackFrame = requestAnimationFrame(fallback);
      document.addEventListener("visibilitychange", () => {
        fallbackRunning = !document.hidden && !reduceMotion;
        if (fallbackRunning && !fallbackFrame)
          fallbackFrame = requestAnimationFrame(fallback);
        if (!fallbackRunning && fallbackFrame) {
          cancelAnimationFrame(fallbackFrame);
          fallbackFrame = 0;
        }
      });
      return;
    }
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.z = 5.2;
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const group = new THREE.Group();
    scene.add(group);
    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.2, 2),
      new THREE.MeshBasicMaterial({
        color: 0xd8f36b,
        wireframe: true,
        transparent: true,
        opacity: 0.8,
      }),
    );
    group.add(core);
    const shell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.75, 1),
      new THREE.MeshBasicMaterial({
        color: 0x52705b,
        wireframe: true,
        transparent: true,
        opacity: 0.24,
      }),
    );
    shell.rotation.set(0.3, 0.2, 0.1);
    group.add(shell);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.72, 0.012, 8, 100),
      new THREE.MeshBasicMaterial({
        color: 0xff6b3d,
        transparent: true,
        opacity: 0.8,
      }),
    );
    ring.rotation.set(1.1, 0.4, 0.2);
    group.add(ring);
    const stars = new THREE.BufferGeometry();
    const points = [];
    for (let i = 0; i < 180; i += 1)
      points.push(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 4,
      );
    stars.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
    group.add(
      new THREE.Points(
        stars,
        new THREE.PointsMaterial({
          color: 0xd8f36b,
          size: 0.018,
          transparent: true,
          opacity: 0.65,
        }),
      ),
    );
    const pointer = { x: 0, y: 0 };
    canvas.addEventListener("pointermove", (event) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      pointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    });
    function resize() {
      const rect = canvas.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height, false);
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
    }
    window.addEventListener("resize", resize);
    resize();
    let frameId;
    let running = !document.hidden && !reduceMotion;
    function render(time) {
      if (!running) return;
      const seconds = time * 0.00035;
      group.rotation.y = seconds + pointer.x * 0.18;
      group.rotation.x = pointer.y * 0.12;
      core.rotation.z = seconds * 1.5;
      ring.rotation.z = seconds * 1.8;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(render);
    }
    if (reduceMotion) renderer.render(scene, camera);
    else frameId = requestAnimationFrame(render);
    document.addEventListener("visibilitychange", () => {
      running = !document.hidden && !reduceMotion;
      if (running && !frameId) frameId = requestAnimationFrame(render);
      if (!running && frameId) {
        cancelAnimationFrame(frameId);
        frameId = 0;
      }
    });
  }

  function initMotion() {
    const revealItems = document.querySelectorAll(".reveal");
    if (reduceMotion) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.14 },
    );
    revealItems.forEach((item) => observer.observe(item));
    if (window.Lenis) {
      const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
    if (window.gsap)
      gsap.from(".site-header", {
        y: -30,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });
  }

  function initMenu() {
    const button = document.querySelector(".menu-button");
    const nav = document.querySelector(".site-header nav");
    if (!button) return;
    const closeMenu = () => {
      button.setAttribute("aria-expanded", "false");
      button.closest(".site-header")?.classList.remove("mobile-open");
    };
    button.addEventListener("click", () => {
      const open = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!open));
      button.closest(".site-header")?.classList.toggle("mobile-open", !open);
    });
    nav
      .querySelectorAll("a")
      .forEach((link) => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
  }
  function initProjectControls() {
    const projects = document.querySelectorAll(".project-row");
    document.querySelectorAll(".filter-button").forEach((button) =>
      button.addEventListener("click", () => {
        document
          .querySelectorAll(".filter-button")
          .forEach((item) => item.classList.remove("is-active"));
        button.classList.add("is-active");
        const filter = button.dataset.filter;
        projects.forEach((project) =>
          project.classList.toggle(
            "is-hidden",
            filter !== "all" && project.dataset.category !== filter,
          ),
        );
      }),
    );
    const dialog = document.querySelector(".project-dialog");
    const title = document.querySelector("#dialog-title");
    const copy = document.querySelector("#dialog-copy");
    const tags = document.querySelector("#dialog-tags");
    const details = {
      cofounder: [
        "AI Co-Founder Platform",
        "A multi-agent product system with Technical, Business, and Market agents, RAG pipelines, and a clear focus on helping founders make better decisions faster.",
        ["GPT-4", "RAG", "Multi-agent"],
      ],
      influenceiq: [
        "InfluenceIQ",
        "A creator authenticity and campaign management platform that makes influencer selection measurable, with discovery, scoring, dashboards, and a verification-first payment flow.",
        ["React", "Next.js", "Charts"],
      ],
      records: [
        "Student Record System",
        "A persistent C++ CRUD engine designed around dependable file I/O, object-oriented structure, and zero-loss record management.",
        ["C++", "File I/O", "OOP"],
      ],
    };
    let activeProject;
    const openProject = (project) => {
      const item = details[project.dataset.project];
      if (!item || !dialog) return;
      activeProject = project;
      title.textContent = item[0];
      copy.textContent = item[1];
      tags.innerHTML = item[2].map((tag) => `<span>${tag}</span>`).join("");
      dialog.showModal();
      dialog.querySelector(".dialog-close")?.focus();
    };
    projects.forEach((project) => {
      project.addEventListener("click", () => openProject(project));
      project.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openProject(project);
        }
      });
    });
    document.querySelector(".dialog-close")?.addEventListener("click", () => {
      dialog.close();
      activeProject?.focus();
    });
    dialog?.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog?.addEventListener("close", () => activeProject?.focus());
    dialog?.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        dialog.close();
      }
    });
  }
  function initSkills() {
    const copy = document.querySelector("[data-skill-copy]");
    const content = {
      build: [
        "BUILD / 01",
        "Full-stack systems with an intelligent edge.",
        "React, Next.js, Node, Express, PostgreSQL, Supabase, REST APIs, and the practical layer between a strong interface and dependable data.",
      ],
      think: [
        "THINK / 02",
        "From raw question to useful model.",
        "DSA in C/C++, product reasoning, RAG pipelines, multi-agent architecture, and the habit of reducing a big problem to its clearest next decision.",
      ],
      ship: [
        "SHIP / 03",
        "Make it real. Make it last.",
        "Git, GitHub, Vercel, CI/CD fundamentals, responsive interfaces, performance-minded animation, and a bias toward small deployable loops.",
      ],
    };
    document.querySelectorAll(".skill-tab").forEach((button) =>
      button.addEventListener("click", () => {
        document
          .querySelectorAll(".skill-tab")
          .forEach((item) => item.classList.remove("is-active"));
        button.classList.add("is-active");
        const item = content[button.dataset.skill];
        copy.innerHTML = `<span>${item[0]}</span><h3>${item[1]}</h3><p>${item[2]}</p>`;
      }),
    );
  }
  const GITHUB_CACHE_KEY = "piyush-github-signal-v2";
  const FEATURED_REPOSITORIES = [
    "leetcode-solutions",
    "Stone-Paper-Scissors",
    "Jarvis2.0",
  ];
  function isValidProfile(profile) {
    return (
      profile &&
      typeof profile === "object" &&
      typeof profile.public_repos === "number" &&
      Number.isFinite(profile.public_repos) &&
      typeof profile.followers === "number" &&
      Number.isFinite(profile.followers)
    );
  }
  function isValidRepository(repo) {
    return (
      repo &&
      typeof repo === "object" &&
      typeof repo.name === "string" &&
      typeof repo.html_url === "string" &&
      /^https:\/\/github\.com\//.test(repo.html_url) &&
      typeof repo.stargazers_count === "number" &&
      typeof repo.forks_count === "number" &&
      typeof repo.pushed_at === "string"
    );
  }
  function normalizeGithubData(profile, repositories) {
    if (
      !isValidProfile(profile) ||
      !Array.isArray(repositories) ||
      repositories.some((repo) => !isValidRepository(repo))
    )
      throw new Error("Invalid GitHub response");
    const featuredRepos = FEATURED_REPOSITORIES.map((name) =>
      repositories.find((repo) => repo.name === name),
    )
      .filter(Boolean)
      .map((repo) => ({
        name: repo.name,
        description:
          typeof repo.description === "string"
            ? repo.description
            : "Public repository",
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language:
          typeof repo.language === "string" ? repo.language : "Open source",
        updated: repo.pushed_at,
        url: repo.html_url,
        homepage:
          typeof repo.homepage === "string" &&
          /^https?:\/\//.test(repo.homepage)
            ? repo.homepage
            : "",
      }));
    return {
      profile: {
        name: typeof profile.name === "string" ? profile.name : "Piyush Rajan",
        avatar:
          typeof profile.avatar_url === "string" ? profile.avatar_url : "",
        bio: typeof profile.bio === "string" ? profile.bio : "",
        publicRepos: profile.public_repos,
        followers: profile.followers,
      },
      featuredRepos,
    };
  }
  async function fetchGithubJson(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: "application/vnd.github+json" },
      });
      if (!response.ok) throw new Error(`GitHub ${response.status}`);
      return await response.json();
    } finally {
      clearTimeout(timeout);
    }
  }
  async function initGithub() {
    if (githubRequest) return githubRequest;
    githubRequest = (async () => {
      try {
        const cached = sessionStorage.getItem(GITHUB_CACHE_KEY);
        if (cached) {
          const saved = JSON.parse(cached);
          if (Date.now() - saved.timestamp < 600000)
            return renderGithub(saved.data);
        }
        const profile = await fetchGithubJson(
          "https://api.github.com/users/PiyushRajan2007",
        );
        const repositories = await fetchGithubJson(
          "https://api.github.com/users/PiyushRajan2007/repos?per_page=100&type=owner&sort=pushed",
        );
        const data = normalizeGithubData(profile, repositories);
        sessionStorage.setItem(
          GITHUB_CACHE_KEY,
          JSON.stringify({ timestamp: Date.now(), data }),
        );
        renderGithub(data);
      } catch (error) {
        renderGithubFallback();
      }
    })();
    return githubRequest;
  }
  function renderGithub({ profile, featuredRepos }) {
    document.querySelector("#github-status").textContent =
      "Public signal connected";
    document.querySelector("#github-status").setAttribute("role", "status");
    document.querySelector("#github-repo-count").textContent =
      profile.publicRepos;
    document.querySelector("#github-followers").textContent = profile.followers;
    document.querySelector("#github-stars").textContent = featuredRepos.reduce(
      (total, repo) => total + repo.stars,
      0,
    );
    document.querySelector("#github-updated").textContent = "Live";
    document.querySelector(".github-stats").setAttribute("aria-busy", "false");
    const list = document.querySelector("#github-repositories");
    list.innerHTML = featuredRepos.length
      ? featuredRepos
          .map(
            (repo, index) =>
              `<a href="${escapeHtml(repo.url)}" target="_blank" rel="noopener noreferrer"><span>${String(index + 1).padStart(2, "0")}</span><div><strong>${escapeHtml(repo.name)}</strong><small>${escapeHtml(repo.language)} / ${escapeHtml(repo.description)} · ${repo.forks} forks · pushed ${escapeHtml(formatDate(repo.updated))}</small></div><b>${repo.stars} ★</b></a>`,
          )
          .join("")
      : `<article><span>--</span><div><strong>No featured repositories found</strong><small>The public account has no configured featured matches.</small></div><b>—</b></article>`;
  }
  function renderGithubFallback() {
    document.querySelector("#github-status").textContent =
      "Using curated signal";
    document.querySelector("#github-status").setAttribute("role", "status");
    document.querySelector("#github-repo-count").textContent = "—";
    document.querySelector("#github-stars").textContent = "—";
    document.querySelector("#github-followers").textContent = "—";
    document.querySelector("#github-updated").textContent = "Offline";
    document.querySelector(".github-stats").setAttribute("aria-busy", "false");
  }
  function escapeHtml(value) {
    return String(value).replace(
      /[&<>"]/g,
      (character) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character],
    );
  }
  function formatDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? "unknown"
      : new Intl.DateTimeFormat("en", {
          month: "short",
          year: "numeric",
        }).format(date);
  }
  function initAssistant() {
    const toggle = document.querySelector(".assistant-toggle");
    const panel = document.querySelector(".assistant-panel");
    const answer = document.querySelector(".assistant-answer");
    if (!toggle || !panel) return;
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      panel.hidden = open;
    });
    document
      .querySelector(".assistant-close")
      ?.addEventListener("click", () => {
        toggle.setAttribute("aria-expanded", "false");
        panel.hidden = true;
      });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !panel.hidden) {
        toggle.setAttribute("aria-expanded", "false");
        panel.hidden = true;
        toggle.focus();
      }
    });
    const answers = {
      "What does Piyush build?":
        "AI products, full-stack systems, and interfaces that make complex ideas feel usable.",
      "What is Piyush's stack?":
        "React, Next.js, Node, PostgreSQL, C++, DSA, Three.js, GSAP, and GenAI systems.",
      "How can I contact Piyush?":
        "Email piyushrajan2007@gmail.com for internships, collaborations, and open-source work.",
    };
    document.querySelectorAll("[data-question]").forEach((button) =>
      button.addEventListener("click", () => {
        answer.textContent = answers[button.dataset.question];
      }),
    );
  }
  initScene();
  initMotion();
  initMenu();
  initProjectControls();
  initSkills();
  initGithub();
  initAssistant();
})();
