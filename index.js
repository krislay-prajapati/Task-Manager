import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import fs from "fs";
//import fs module

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  fs.readdir(`./files`, function (err, files) {
    if (err) {
      return res.render("index", { files: [] });
    }
    res.render("index", { files: files });
  });
  //fs.readdir me hum files waala folder read krenge aur index.ejs me render kr do .... humne object bheja hai files naam ka files naam ke object me ky bheja hai vo files jo hum read krenge
});
//fs.readdir se aap kisi direactory ko read kr skte ho
app.get("/file/:filename", (req, res) => {
  fs.readFile(
    `./files/${req.params.filename}`,
    "utf-8",
    function (err, filedata) {
      res.render("show", { filename: req.params.filename, filedata: filedata });
    },
  );
});
app.get("/edit/:filename", (req, res) => {
  res.render("edit", { filename: req.params.filename });
});
app.post("/edit", (req, res) => {
  const previousName = req.body.previous;

  // Safety check for input
  const rawNewName = req.body?.new ? req.body.new.trim() : "";
  if (!rawNewName) {
    return res.status(400).send("Naya naam dena zaroori hai.");
  }

  // Spaces remove karein aur ensure karein ki single .txt extension ho
  let newName = rawNewName.split(" ").join("");
  if (!newName.endsWith(".txt")) {
    newName = `${newName}.txt`;
  }

  fs.rename(`./files/${previousName}`, `./files/${newName}`, function (err) {
    if (err) {
      console.error("Rename Error:", err);
      return res
        .status(500)
        .send(
          "File ka naam nahi badal paya. Check karein file exist karti hai ya nahi.",
        );
    }

    // Error na aane par redirect hoga
    res.redirect("/");
  });
});

app.post("/create", (req, res) => {
  // 1. Title Safety Check
  const title = req.body.title
    ? req.body.title.split(" ").join("")
    : `task-${Date.now()}`;

  // 2. Details Safety Check (Aapke error ko ye line rokegi)
  const details = req.body.details || "";

  fs.writeFile(`./files/${title}.txt`, details, function (err) {
    if (err) {
      console.log("Write Error:", err);
      return res.send("Error writing file.");
    }
    res.redirect("/");
  });
});

app.listen(8000);
