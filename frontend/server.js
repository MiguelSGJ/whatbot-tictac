const express = require("express");
const path = require("path");

const app = express();

app.use("/static", express.static(path.resolve(__dirname, "static")));

app.get("/*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "index.html"));
});
const port = process.env.PORT || 3003; 
app.listen(port, () => console.log(`Server running...${port}`));