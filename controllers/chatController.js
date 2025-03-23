const Message = require('../models/Message');
const User = require('../models/User');

exports.getConversations = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const userRole = req.session.user.role;
    const conversations = await Message.getUserConversations(userId);
    
    // Obtener conteo de mensajes no leídos
    const unreadCount = await Message.getUnreadCount(userId);
    
    res.render('chat/conversations', {
      user: req.session.user,
      conversations,
      unreadCount,
      title: 'Mis Conversaciones'
    });
  } catch (error) {
    console.error('Error al cargar conversaciones:', error);
    req.flash('error_msg', 'Error al cargar las conversaciones');
    res.redirect('/users/dashboard');
  }
};

exports.getConversation = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const contactId = req.params.id;
    
    // Verificar que el contacto existe
    const User = require('../models/User');
    const contact = await User.findById(contactId);
    if (!contact) {
      req.flash('error_msg', 'Usuario no encontrado');
      return res.redirect('/chat');
    }
    
    // Marcar mensajes como leídos
    await Message.markAsRead(contactId, userId);
    
    // Obtener mensajes
    const messages = await Message.getConversation(userId, contactId);
    
    // Verificar si hay solicitudes pendientes entre los usuarios
    let pendingRequests = [];
    try {
      const HelpRequest = require('../models/HelpRequest');
      
      if (req.session.user.role === 'blind') {
        // Si el usuario es ciego, buscar solicitudes que ha enviado al voluntario
        pendingRequests = await HelpRequest.getPendingByUserAndVolunteer(userId, contactId);
      } else if (req.session.user.role === 'volunteer') {
        // Si el usuario es voluntario, buscar solicitudes que ha recibido del usuario ciego
        pendingRequests = await HelpRequest.getPendingByUserAndVolunteer(contactId, userId);
      }
    } catch (error) {
      console.error('Error al obtener solicitudes pendientes:', error);
    }
    
    res.render('chat/conversation', {
      user: req.session.user,
      contact,
      messages,
      pendingRequests,
      title: `Chat con ${contact.username}`
    });
  } catch (error) {
    console.error('Error al cargar la conversación:', error);
    req.flash('error_msg', 'Error al cargar la conversación');
    res.redirect('/chat');
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.session.user.id;
    const { receiver_id, content } = req.body;
    
    // Validar que todos los campos necesarios estén presentes
    if (!senderId) {
      console.error('Error: ID del remitente no disponible');
      req.flash('error_msg', 'Error al enviar el mensaje: Sesión inválida');
      return res.redirect('/chat');
    }
    
    if (!receiver_id) {
      console.error('Error: ID del receptor no proporcionado');
      req.flash('error_msg', 'Error al enviar el mensaje: Destinatario no especificado');
      return res.redirect('/chat');
    }
    
    if (!content || content.trim() === '') {
      req.flash('error_msg', 'El mensaje no puede estar vacío');
      return res.redirect(`/chat/${receiver_id}`);
    }
    
    // Registrar los valores para depuración
    console.log('Enviando mensaje con los siguientes datos:');
    console.log('- Remitente (sender_id):', senderId);
    console.log('- Destinatario (receiver_id):', receiver_id);
    console.log('- Contenido:', content);
    
    // Verificar que el receptor existe
    const User = require('../models/User');
    const receiver = await User.findById(receiver_id);
    if (!receiver) {
      req.flash('error_msg', 'Usuario no encontrado');
      return res.redirect('/chat');
    }
    
    // Crear el mensaje
    await Message.create({
      sender_id: senderId,
      receiver_id,
      content
    });
    
    // Crear notificación para el receptor
    try {
      const Notification = require('../models/Notification');
      await Notification.create({
        user_id: receiver_id,
        title: 'Nuevo mensaje',
        content: `Has recibido un nuevo mensaje de ${req.session.user.username}`,
        type: 'message',
        link: `/chat/${senderId}`
      });
    } catch (notifError) {
      console.error('Error al crear notificación:', notifError);
      // Continuar a pesar del error en la notificación
    }
    
    res.redirect(`/chat/${receiver_id}`);
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    req.flash('error_msg', 'Error al enviar el mensaje: ' + error.message);
    
    // Intentar redirigir de manera segura
    if (req.body && req.body.receiver_id) {
      return res.redirect(`/chat/${req.body.receiver_id}`);
    } else {
      return res.redirect('/chat');
    }
  }
};

exports.startConversation = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const contactId = req.params.id;
    
    // Verificar que el contacto existe
    const contact = await User.findById(contactId);
    if (!contact) {
      req.flash('error_msg', 'Usuario no encontrado');
      return res.redirect('/users/dashboard');
    }
    
    // Redirigir a la conversación
    res.redirect(`/chat/${contactId}`);
  } catch (error) {
    console.error('Error al iniciar conversación:', error);
    req.flash('error_msg', 'Error al iniciar la conversación');
    res.redirect('/users/dashboard');
  }
};