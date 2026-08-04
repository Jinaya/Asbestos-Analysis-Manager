document.addEventListener("DOMContentLoaded", () => {

  const selectedProjectId =
    localStorage.getItem("selectedProjectId");

  const editProjectForm =
    document.getElementById("editProjectForm");

  const editSampleRows =
    document.getElementById("editSampleRows");

  const addEditSampleButton =
    document.getElementById("addEditSampleButton");


  if (!selectedProjectId) {
    alert("編集する案件が選択されていません。");
    window.location.href = "projects.html";
    return;
  }


  function createSampleRow(sample = {}) {

    const rowCount =
      editSampleRows.querySelectorAll(".sample-row").length + 1;

    const row = document.createElement("div");
    row.classList.add("sample-row");

    row.innerHTML = `
      <div>
        <input
          type="text"
          class="sample-no"
          value="${sample.sample_no ?? rowCount}"
          readonly
        >
      </div>

      <div>
        <input
          type="text"
          class="sampling-location"
          value="${escapeHtml(sample.sampling_location ?? "")}"
          placeholder="例：3階 廊下"
        >
      </div>

      <div>
        <input
          type="text"
          class="sample-name"
          value="${escapeHtml(sample.sample_name ?? "")}"
          placeholder="例：天井材"
          required
        >
      </div>

      <div>
        <input
          type="text"
          class="asbestos-content"
          value="${escapeHtml(sample.asbestos_content ?? "")}"
          placeholder="例：5%"
        >
      </div>

      <div class="sample-type-wrapper">
        <input
          type="text"
          class="asbestos-type"
          value="${escapeHtml(sample.asbestos_type ?? "")}"
          placeholder="例：クリソタイル"
        >

        <button
          type="button"
          class="delete-sample-button"
        >
          ×
        </button>
      </div>
    `;

    editSampleRows.appendChild(row);
  }


  function escapeHtml(value) {

    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll('"', "&quot;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");

  }


  function renumberSamples() {

    const rows =
      editSampleRows.querySelectorAll(".sample-row");

    rows.forEach((row, index) => {

      row.querySelector(".sample-no").value =
        index + 1;

    });

  }


  fetch(`/api/projects/${selectedProjectId}`)
    .then((response) => {

      if (!response.ok) {
        throw new Error("案件情報を取得できませんでした。");
      }

      return response.json();

    })
    .then((project) => {

      document.getElementById("customerName").value =
        project.customer_name ?? "";

      document.getElementById("reportNumber").value =
        project.report_number ?? "";

      document.getElementById("receivedDate").value =
        project.received_date ?? "";

      document.getElementById("analysisDate").value =
        project.analysis_date ?? "";

      document.getElementById("analyst").value =
        project.analyst ?? "";

      document.getElementById("reviewer").value =
        project.reviewer ?? "";

      document.getElementById("title").value =
        project.title ?? "";

      editSampleRows.innerHTML = "";

      if (
        Array.isArray(project.samples) &&
        project.samples.length > 0
      ) {

        project.samples.forEach((sample) => {
          createSampleRow(sample);
        });

      } else {

        createSampleRow();

      }

    })
    .catch((error) => {

      console.error(error);
      alert(error.message);
      window.location.href = "projects.html";

    });


  addEditSampleButton.addEventListener("click", () => {
    createSampleRow();
    renumberSamples();
  });


  editSampleRows.addEventListener("click", (event) => {

    if (
      !event.target.classList.contains(
        "delete-sample-button"
      )
    ) {
      return;
    }

    const rows =
      editSampleRows.querySelectorAll(".sample-row");

    if (rows.length <= 1) {
      alert("試料は最低1件必要です。");
      return;
    }

    event.target.closest(".sample-row").remove();

    renumberSamples();

  });


  editProjectForm.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();

      const updatedProject = {

        customerName:
          document.getElementById("customerName").value.trim(),

        reportNumber:
          document.getElementById("reportNumber").value.trim(),

        receivedDate:
          document.getElementById("receivedDate").value,

        analysisDate:
          document.getElementById("analysisDate").value,

        analyst:
          document.getElementById("analyst").value.trim(),

        reviewer:
          document.getElementById("reviewer").value.trim(),

        title:
          document.getElementById("title").value.trim(),

        samples: []

      };

      const sampleRows =
        editSampleRows.querySelectorAll(".sample-row");

      sampleRows.forEach((row, index) => {

        updatedProject.samples.push({

          sampleNo: index + 1,

          samplingLocation:
            row.querySelector(
              ".sampling-location"
            ).value.trim(),

          sampleName:
            row.querySelector(
              ".sample-name"
            ).value.trim(),

          asbestosContent:
            row.querySelector(
              ".asbestos-content"
            ).value.trim(),

          asbestosType:
            row.querySelector(
              ".asbestos-type"
            ).value.trim()

        });

      });

      try {

        const response = await fetch(
          `/api/projects/${selectedProjectId}`,
          {
            method: "PUT",

            headers: {
              "Content-Type": "application/json"
            },

            body: JSON.stringify(updatedProject)
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "更新に失敗しました。"
          );
        }

        alert("案件を更新しました。");

        window.location.href =
          "project-detail.html";

      } catch (error) {

        console.error(error);

        alert(error.message);

      }

    }
  );

});