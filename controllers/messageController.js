const Message = require('../models/Message');
const User = require('../models/User');
const Volunteer = require('../models/Volunteer');

exports.getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.session.user.id;
    const messages = await Message.getConversation(currentUserId, userId);
    const otherUser = await User.findById(userId) || await Volunteer.findById(userId);
    res.render('conversation', { messages, otherUser });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Ocurrió un error al cargar la conversación');
    res.redirect('/');
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.session.user.id;
    await Message.create(senderId, receiverId, content);
    res.redirect(`/messages/${receiverId}`);
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Ocurrió un error al enviar el mensaje');
    res.redirect(`/messages/${receiverId}`);
  }
};