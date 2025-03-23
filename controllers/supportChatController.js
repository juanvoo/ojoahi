const SupportChat = require("../models/SupportChat")
const User = require("../models/User")
const Notification = require("../models/Notification")
const pool = require("../config/database");

// Verificar si un usuario es agente de soporte
const isSupport = (user) => {
  return user && (user.role === "admin" || user.role === "support")
}

exports.getIndex = async (req, res) => {
  try {
    const userId = req.session.user.id
    const userRole = req.session.user.role

    if (isSupport(req.session.user)) {
      // Vista para agentes de soporte
      const sessions = await SupportChat.getAgentSessions(userId)
      const waitingCount = await SupportChat.getWaitingSessionsCount()

      res.render("support/agent-dashboard", {
        user: req.session.user,
        sessions,
        waitingCount,
        title: "Panel de Soporte",
      })
    } else {
      // Vista para usuarios regulares
      const sessions = await SupportChat.getUserSessions(userId)

      res.render("support/user-dashboard", {
        user: req.session.user,
        sessions,
        title: "Mis Conversaciones de Soporte",
      })
    }
  } catch (error) {
    console.error("Error al cargar el panel de soporte:", error)
    req.flash("error_msg", "Error al cargar el panel de soporte")
    res.redirect("/users/dashboard")
  }
}

exports.getSession = async (req, res) => {
  try {
    const userId = req.session.user.id
    const sessionId = req.params.id

    // Obtener la sesión
    const session = await SupportChat.getSessionById(sessionId)

    if (!session) {
      req.flash("error_msg", "Sesión de chat no encontrada")
      return res.redirect("/support")
    }

    // Verificar permisos
    const isUserSession = session.user_id === userId
    const isAgentSession =
      isSupport(req.session.user) && (session.support_agent_id === userId || !session.support_agent_id)

    if (!isUserSession && !isAgentSession) {
      req.flash("error_msg", "No tienes permiso para acceder a esta sesión")
      return res.redirect("/support")
    }

    // Si es un agente y la sesión está en espera, asignarla automáticamente
    if (isAgentSession && session.status === "waiting") {
      await SupportChat.assignAgentToSession(sessionId, userId)
      // Actualizar la sesión después de asignarla
      session.support_agent_id = userId
      session.status = "active"
      session.agent_username = req.session.user.username
    }

    // Marcar mensajes como leídos
    if (isUserSession) {
      await SupportChat.markMessagesAsRead(sessionId, false) // Marcar mensajes del agente como leídos
    } else if (isAgentSession) {
      await SupportChat.markMessagesAsRead(sessionId, true) // Marcar mensajes del usuario como leídos
    }

    // Obtener mensajes
    const messages = await SupportChat.getSessionMessages(sessionId)

    res.render("support/chat", {
      user: req.session.user,
      session,
      messages,
      isAgent: isSupport(req.session.user),
      title: `Chat de Soporte - ${session.subject || "Sin asunto"}`,
    })
  } catch (error) {
    console.error("Error al cargar la sesión de chat:", error)
    req.flash("error_msg", "Error al cargar la sesión de chat")
    res.redirect("/support")
  }
}

exports.createSession = async (req, res) => {
  try {
    const userId = req.session.user.id
    const { subject } = req.body

    if (!subject) {
      req.flash("error_msg", "Por favor, indica el asunto de tu consulta")
      return res.redirect("/support")
    }

    // Crear nueva sesión
    const sessionId = await SupportChat.createSession(userId, subject)

    // Redirigir a la sesión
    res.redirect(`/support/chat/${sessionId}`)
  } catch (error) {
    console.error("Error al crear sesión de chat:", error)
    req.flash("error_msg", "Error al crear sesión de chat")
    res.redirect("/support")
  }
}

exports.sendMessage = async (req, res) => {
  try {
    const userId = req.session.user.id
    const { session_id, message } = req.body

    if (!message || message.trim() === "") {
      req.flash("error_msg", "El mensaje no puede estar vacío")
      return res.redirect(`/support/chat/${session_id}`)
    }

    // Obtener la sesión
    const session = await SupportChat.getSessionById(session_id)

    if (!session) {
      req.flash("error_msg", "Sesión de chat no encontrada")
      return res.redirect("/support")
    }

    // Verificar permisos
    const isUserSession = session.user_id === userId
    const isAgentSession = isSupport(req.session.user) && session.support_agent_id === userId

    if (!isUserSession && !isAgentSession) {
      req.flash("error_msg", "No tienes permiso para enviar mensajes en esta sesión")
      return res.redirect("/support")
    }

    // Determinar si el mensaje es del usuario o del agente
    const isFromUser = isUserSession

    // Crear el mensaje
    await SupportChat.createMessage(session_id, userId, message, isFromUser)

    // Crear notificación para el destinatario
    try {
      let recipientId
      let notificationTitle
      let notificationContent

      if (isFromUser) {
        // Notificar al agente si hay uno asignado
        if (session.support_agent_id) {
          recipientId = session.support_agent_id
          notificationTitle = "Nuevo mensaje de soporte"
          notificationContent = `${req.session.user.username} ha enviado un mensaje en la consulta "${session.subject}"`
        }
      } else {
        // Notificar al usuario
        recipientId = session.user_id
        notificationTitle = "Respuesta de soporte"
        notificationContent = `Un agente ha respondido a tu consulta "${session.subject}"`
      }

      if (recipientId) {
        await Notification.create({
          user_id: recipientId,
          title: notificationTitle,
          content: notificationContent,
          type: "support",
          link: `/support/chat/${session_id}`,
        })
      }
    } catch (notifError) {
      console.error("Error al crear notificación:", notifError)
      // Continuar a pesar del error en la notificación
    }

    // Redirigir de vuelta a la sesión
    res.redirect(`/support/chat/${session_id}`)
  } catch (error) {
    console.error("Error al enviar mensaje:", error)
    req.flash("error_msg", "Error al enviar mensaje")

    // Intentar redirigir de manera segura
    if (req.body && req.body.session_id) {
      return res.redirect(`/support/chat/${req.body.session_id}`)
    } else {
      return res.redirect("/support")
    }
  }
}

exports.closeSession = async (req, res) => {
  try {
    const userId = req.session.user.id
    const sessionId = req.params.id

    // Obtener la sesión
    const session = await SupportChat.getSessionById(sessionId)

    if (!session) {
      req.flash("error_msg", "Sesión de chat no encontrada")
      return res.redirect("/support")
    }

    // Verificar permisos (solo agentes pueden cerrar sesiones)
    if (!isSupport(req.session.user)) {
      req.flash("error_msg", "No tienes permiso para cerrar esta sesión")
      return res.redirect("/support")
    }

    // Cerrar la sesión
    await SupportChat.closeSession(sessionId)

    // Notificar al usuario
    try {
      await Notification.create({
        user_id: session.user_id,
        title: "Consulta cerrada",
        content: `Tu consulta "${session.subject}" ha sido cerrada por el equipo de soporte`,
        type: "support",
        link: `/support/chat/${sessionId}`,
      })
    } catch (notifError) {
      console.error("Error al crear notificación:", notifError)
    }

    req.flash("success_msg", "Sesión cerrada correctamente")
    res.redirect("/support")
  } catch (error) {
    console.error("Error al cerrar sesión:", error)
    req.flash("error_msg", "Error al cerrar sesión")
    res.redirect("/support")
  }
}

exports.getHelp = async (req, res) => {
  try {
    // Obtener preguntas frecuentes
    const [faqs] = await pool.execute("SELECT * FROM faqs..."); // Si la tabla no existe...
  } catch (error) {
    console.error("Error en getHelp:", error.message); // Muestra el mensaje específico
    res.status(500).send(`Error interno: ${error.message}`);
  }
}

