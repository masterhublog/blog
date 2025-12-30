// 初始化侧边栏
export default () => {
  const menuDOM: any = document.querySelector(".mh-header>.main>nav>span.menu-btn");
  const mobileSidebarDOM: any = document.querySelector("body>.mh-mobilesidebar");
  const addActive = () => setTimeout(() => mobileSidebarDOM.classList.add("active"));
  const removeActive = () => setTimeout(() => mobileSidebarDOM.classList.remove("active"));
  menuDOM.addEventListener("click", addActive);
  mobileSidebarDOM.addEventListener("click", removeActive);
};