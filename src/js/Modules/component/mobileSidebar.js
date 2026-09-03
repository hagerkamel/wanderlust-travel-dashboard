export function initMobileSidebar() {
  const menuBtn = document.getElementById("mobile-menu-btn");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  const navItems = document.querySelectorAll(".nav-item");

  function openSidebar() {
    sidebar.classList.add("open");
    overlay.classList.remove("hidden");
  }

  function closeSidebar() {
    sidebar.classList.remove("open");
    overlay.classList.add("hidden");
  }

  menuBtn.addEventListener("click", (event) => {
    event.stopPropagation(); 
    openSidebar();
  });

  overlay.addEventListener("click", closeSidebar);
  document.addEventListener("click", (event) => {
    const clickedOutside =
      !sidebar.contains(event.target) && !menuBtn.contains(event.target);
    if (clickedOutside && sidebar.classList.contains("open")) {
      closeSidebar();
    }
  });

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      if (window.innerWidth <= 768) {
        closeSidebar();
      }
    });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      closeSidebar();
    }
  });
}
