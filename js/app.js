document.addEventListener("DOMContentLoaded", () => {
  const addSampleButton = document.querySelector(".add-sample-button");
  const sampleTable = document.querySelector(".sample-table");

  let sampleCount = 1;

  addSampleButton.addEventListener("click", () => {
    sampleCount++;

    const sampleRow = document.createElement("div");
    sampleRow.classList.add("sample-row");

    sampleRow.innerHTML = `
        <div>
            <input
            type="text"
            class="sample-no"
            value="${sampleCount}"
            >
        </div>

        <div>
            <input
            type="text"
            class="sampling-location"
            placeholder="例：3階 廊下"
            >
        </div>

        <div>
            <input
            type="text"
            class="sample-name"
            placeholder="例：天井材"
            >
        </div>

        <div>
            <input
            type="text"
            class="asbestos-content"
            placeholder="例：5%"
            >
        </div>

        <div class="sample-type-wrapper">
            <input
            type="text"
            class="asbestos-type"
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

    sampleTable.appendChild(sampleRow);
  });

  sampleTable.addEventListener("click", (event) => {
    if (!event.target.classList.contains("delete-sample-button")) {
        return;
    }
    const rows = document.querySelectorAll(".sample-row");
    if (rows.length <= 1) {
        alert("試料は最低1件必要です。");
        return;
    }
    event.target.closest(".sample-row").remove();
    renumberSamples();
  });

  function renumberSamples() {
    const rows = document.querySelectorAll(".sample-row");

    rows.forEach((row, index) => {
      const sampleNoInput = row.querySelector(
        ".sample-no, #sampleNo"
      );

      if (sampleNoInput) {
        sampleNoInput.value = index + 1;
      }
    });

    sampleCount = rows.length;
  }

  const projectForm = document.getElementById("projectForm");

  projectForm.addEventListener("submit", (event) => {
    event.preventDefault();


    const project = {
        customerName: document.getElementById("customerName").value,
        reportNumber: document.getElementById("reportNumber").value,
        receivedDate: document.getElementById("receivedDate").value,
        analysisDate: document.getElementById("analysisDate").value,
        analyst: document.getElementById("analyst").value,
        reviewer: document.getElementById("reviewer").value,
        title: document.getElementById("title").value,
        samples: []
    };


    const sampleRows = document.querySelectorAll(".sample-row");

    sampleRows.forEach((row) => {
        const sample = {
        sampleNo: row.querySelector(".sample-no").value,
        samplingLocation: row.querySelector(".sampling-location").value,
        sampleName: row.querySelector(".sample-name").value,
        asbestosContent: row.querySelector(".asbestos-content").value,
        asbestosType: row.querySelector(".asbestos-type").value
        };

        project.samples.push(sample);
    });

    console.log("登録する案件データ");
    console.log(project);

    fetch("/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(project)
    })
    .then((response) => response.json())
    .then((result) => {

      console.log(result);

      const savedProjects =
        JSON.parse(localStorage.getItem("projects")) || [];

      savedProjects.push(project);

      localStorage.setItem(
        "projects",
        JSON.stringify(savedProjects)
      );

      alert("案件を登録しました。");

      window.location.href = "projects.html";

    })
    .catch((error) => {

      console.error(error);

      alert("通信エラーが発生しました。");

    });
  });
});