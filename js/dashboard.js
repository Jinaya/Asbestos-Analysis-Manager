document.addEventListener(
  "DOMContentLoaded",
  async () => {

    try {

      const response =
        await fetch("/api/dashboard");

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Dashboardの取得に失敗しました。"
        );
      }

      document.getElementById(
        "totalProjects"
      ).textContent =
        data.totalProjects;

      document.getElementById(
        "totalSamples"
      ).textContent =
        data.totalSamples;

      document.getElementById(
        "monthlyProjects"
      ).textContent =
        data.monthlyProjects;

    } catch (error) {

      console.error(error);

      alert(
        "Dashboardの取得に失敗しました。"
      );

    }

  }
);