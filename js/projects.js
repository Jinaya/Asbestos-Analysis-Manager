document.addEventListener("DOMContentLoaded", () => {

  const projectsTableBody = document.getElementById("projectsTableBody");
  const searchInput = document.getElementById("searchInput");

  let allProjects = [];

  function renderProjects(projects) {

    projectsTableBody.innerHTML = "";

    if (projects.length === 0) {

      projectsTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="empty-message">
            該当する案件はありません。
          </td>
        </tr>
      `;

      return;
    }

    projects.forEach((project) => {

      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${project.report_number}</td>
        <td>${project.customer_name}</td>
        <td>${project.title}</td>
        <td>${project.received_date}</td>
        <td>${project.analysis_date}</td>
        <td>${project.analyst}</td>
        <td>${project.sample_count}</td>
      `;

      row.classList.add("clickable-row");

      row.addEventListener("click", () => {

        localStorage.setItem(
          "selectedProjectId",
          project.id
        );

        window.location.href = "project-detail.html";

      });

      projectsTableBody.appendChild(row);

    });

  }

  fetch("/api/projects")
    .then((response) => response.json())
    .then((projects) => {

      allProjects = projects;

      renderProjects(allProjects);

    })
    .catch((error) => {

      console.error(error);

      alert("案件一覧の取得に失敗しました。");

    });

  searchInput.addEventListener("input", () => {

    const keyword = searchInput.value.toLowerCase();

    const filtered = allProjects.filter(project =>

      (project.customer_name || "").toLowerCase().includes(keyword) ||
      (project.report_number || "").toLowerCase().includes(keyword) ||
      (project.title || "").toLowerCase().includes(keyword)

    );

    renderProjects(filtered);

  });

});