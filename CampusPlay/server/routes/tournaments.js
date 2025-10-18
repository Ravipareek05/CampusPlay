const router = require("express").Router();
const auth = require("../middleware/auth");
const { create, list, join } = require("../controllers/tournamentController");

router.get("/", list);
router.post("/", auth, create);
router.post("/:id/join", auth, join);

module.exports = router;
