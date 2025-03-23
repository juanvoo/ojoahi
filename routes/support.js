const express = require("express")
const router = express.Router()
const { isAuthenticated } = require("../middleware/auth")
const supportChatController = require("../controllers/supportChatController")

// Página principal de ayuda
router.get("/help", supportChatController.getHelp)

// Rutas de chat de soporte (requieren autenticación)
router.get("/", isAuthenticated, supportChatController.getIndex)
router.get("/chat/:id", isAuthenticated, supportChatController.getSession)
router.post("/create", isAuthenticated, supportChatController.createSession)
router.post("/send", isAuthenticated, supportChatController.sendMessage)
router.get("/close/:id", isAuthenticated, supportChatController.closeSession)

module.exports = router

