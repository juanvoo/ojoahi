function login (req, res){
    res.render('login');
}

function register (req, res){
    res.render('register');
}

module.exports = {
    login : login,
    register : register,
}