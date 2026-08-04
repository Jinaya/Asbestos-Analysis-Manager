document.addEventListener("DOMContentLoaded", () => {

  const selectedProjectId =
    localStorage.getItem("selectedProjectId");

  if (!selectedProjectId) {
    alert("案件が選択されていません。");
    window.location.href = "projects.html";
    return;
  }

  fetch(`/api/projects/${selectedProjectId}`)
    .then((response) => {

      if (!response.ok) {
        throw new Error("案件データを取得できませんでした。");
      }

      return response.json();

    })
    .then((project) => {


      document.getElementById("detailReportNumber").textContent =
        project.report_number || "-";

      document.getElementById("detailCustomerName").textContent =
        project.customer_name || "-";

      document.getElementById("detailTitle").textContent =
        project.title || "-";

      document.getElementById("detailReceivedDate").textContent =
        project.received_date || "-";

      document.getElementById("detailAnalysisDate").textContent =
        project.analysis_date || "-";

      document.getElementById("detailAnalyst").textContent =
        project.analyst || "-";

      document.getElementById("detailReviewer").textContent =
        project.reviewer || "-";



      const samplesBody =
        document.getElementById("detailSamplesBody");

      samplesBody.innerHTML = "";

      if (!project.samples || project.samples.length === 0) {

        samplesBody.innerHTML = `
          <tr>
            <td colspan="5" class="empty-message">
              登録されている試料はありません。
            </td>
          </tr>
        `;

      } else {

        project.samples.forEach((sample) => {

          const row = document.createElement("tr");

          row.innerHTML = `
            <td>${sample.sample_no ?? "-"}</td>
            <td>${sample.sampling_location || "-"}</td>
            <td>${sample.sample_name || "-"}</td>
            <td>${sample.asbestos_content || "-"}</td>
            <td>${sample.asbestos_type || "-"}</td>
          `;

          samplesBody.appendChild(row);

        });

      }


      const editProjectButton =
        document.getElementById("editProjectButton");

      if (editProjectButton) {

        editProjectButton.addEventListener("click", () => {
          window.location.href = "project-edit.html";
        });

      }

    })

    .catch((error) => {

      console.error(error);

      alert("案件詳細の取得に失敗しました。");

      window.location.href = "projects.html";

    });


const deleteProjectButton =
  document.getElementById("deleteProjectButton");

if (deleteProjectButton) {

  deleteProjectButton.addEventListener("click", async () => {

    const ok = confirm(
      "この案件を削除しますか？"
    );

    if (!ok) {
      return;
    }

    try {

      const response = await fetch(
        `/api/projects/${selectedProjectId}`,
        {
          method: "DELETE"
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      alert("案件を削除しました。");

      window.location.href = "projects.html";

    } catch (error) {

      console.error(error);

      alert(error.message);

    }

  });

}

});