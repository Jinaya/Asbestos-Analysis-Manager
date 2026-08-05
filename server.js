const express = require("express");
const path = require("path");
const db = require("./database");

const app = express();
const PORT = 3000;


app.use(express.static(path.join(__dirname)));


app.use(express.json());


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/api/projects", (req, res) => {

  const project = req.body;

  try {

    const statement = db.prepare(`
      INSERT INTO projects (
        customer_name,
        report_number,
        received_date,
        analysis_date,
        analyst,
        reviewer,
        title
      )
      VALUES (
        ?, ?, ?, ?, ?, ?, ?
      )
    `);

    const result = statement.run(
      project.customerName,
      project.reportNumber,
      project.receivedDate,
      project.analysisDate,
      project.analyst,
      project.reviewer,
      project.title
    );

    const projectId = result.lastInsertRowid;

    const sampleStatement = db.prepare(`
        INSERT INTO samples (
            project_id,
            sample_no,
            sampling_location,
            sample_name,
            asbestos_content,
            asbestos_type
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    project.samples.forEach((sample) => {

        const sampleResult = sampleStatement.run(
            projectId,
            sample.sampleNo,
            sample.samplingLocation,
            sample.sampleName,
            sample.asbestosContent,
            sample.asbestosType
        );


    });

    console.log("案件登録成功");
    console.log("Project ID:", result.lastInsertRowid);

    res.json({
      success: true,
      projectId: result.lastInsertRowid
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

});


app.get("/api/projects", (req, res) => {

  try {

    const statement = db.prepare(`
      SELECT
        projects.*,
        COUNT(samples.id) AS sample_count
      FROM projects
      LEFT JOIN samples
        ON projects.id = samples.project_id
      GROUP BY projects.id
      ORDER BY projects.id DESC
    `);

    const projects = statement.all();

    res.json(projects);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

});


app.get("/api/projects/:id", (req, res) => {

  try {

    const projectId = req.params.id;


    const projectStatement = db.prepare(`
      SELECT *
      FROM projects
      WHERE id = ?
    `);

    const project = projectStatement.get(projectId);

    if (!project) {

      return res.status(404).json({
        success: false,
        message: "案件が見つかりません。"
      });

    }


    const sampleStatement = db.prepare(`
      SELECT *
      FROM samples
      WHERE project_id = ?
      ORDER BY sample_no
    `);

    const samples = sampleStatement.all(projectId);


    project.samples = samples;

    res.json(project);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

});

app.put("/api/projects/:id", (req, res) => {

  const projectId = Number(req.params.id);
  const project = req.body;

  if (!Number.isInteger(projectId)) {
    return res.status(400).json({
      success: false,
      message: "案件IDが正しくありません。"
    });
  }

  if (
    !project.customerName ||
    !project.reportNumber ||
    !project.title
  ) {
    return res.status(400).json({
      success: false,
      message: "顧客名・報告書番号・件名は必須です。"
    });
  }

  if (
    !Array.isArray(project.samples) ||
    project.samples.length === 0
  ) {
    return res.status(400).json({
      success: false,
      message: "試料は最低1件必要です。"
    });
  }

  try {

    const updateProjectAndSamples = db.transaction(() => {


      const projectResult = db.prepare(`
        UPDATE projects
        SET
          customer_name = ?,
          report_number = ?,
          received_date = ?,
          analysis_date = ?,
          analyst = ?,
          reviewer = ?,
          title = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        project.customerName,
        project.reportNumber,
        project.receivedDate,
        project.analysisDate,
        project.analyst,
        project.reviewer,
        project.title,
        projectId
      );

      if (projectResult.changes === 0) {
        throw new Error("更新対象の案件が見つかりません。");
      }


      db.prepare(`
        DELETE FROM samples
        WHERE project_id = ?
      `).run(projectId);


      const insertSample = db.prepare(`
        INSERT INTO samples (
          project_id,
          sample_no,
          sampling_location,
          sample_name,
          asbestos_content,
          asbestos_type
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      project.samples.forEach((sample, index) => {

        insertSample.run(
          projectId,
          index + 1,
          sample.samplingLocation,
          sample.sampleName,
          sample.asbestosContent,
          sample.asbestosType
        );

      });

    });

    updateProjectAndSamples();

    console.log("案件更新成功");
    console.log("Project ID:", projectId);

    res.json({
      success: true,
      projectId,
      message: "案件を更新しました。"
    });

  } catch (error) {

    console.error(error);

    if (
      error.code === "SQLITE_CONSTRAINT_UNIQUE" ||
      String(error.message).includes("UNIQUE constraint failed")
    ) {
      return res.status(409).json({
        success: false,
        message: "その報告書番号は別の案件で使用されています。"
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

});


app.delete("/api/projects/:id", (req, res) => {

  try {

    const projectId = req.params.id;

    const result = db.prepare(`
      DELETE FROM projects
      WHERE id = ?
    `).run(projectId);

    if (result.changes === 0) {

      return res.status(404).json({
        success: false,
        message: "案件が見つかりません。"
      });

    }

    console.log("案件削除成功");
    console.log("Project ID:", projectId);

    res.json({
      success: true,
      message: "案件を削除しました。"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

});

app.get("/api/dashboard", (req, res) => {

  try {

    const totalProjects = db.prepare(`
      SELECT COUNT(*) AS count
      FROM projects
    `).get();

    const totalSamples = db.prepare(`
      SELECT COUNT(*) AS count
      FROM samples
    `).get();

    const monthlyProjects = db.prepare(`
      SELECT COUNT(*) AS count
      FROM projects
      WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
    `).get();

    res.json({
      totalProjects: totalProjects.count,
      totalSamples: totalSamples.count,
      monthlyProjects: monthlyProjects.count
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

});


app.listen(PORT, () => {
  console.log("Asbestos Analysis Manager Server Start!");
  console.log(`http://localhost:${PORT}`);
});