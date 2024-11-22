const usersDB = {
  users: require('../model/users.json'),
  setUsers: function(data) { this.users = data;}
};
const fsPromises = require('fs').promises;
const path = require('path');

const handleLogout = async (req, res) => {
  const cookies = req.cookies;

  // Eğer JWT yoksa
  if (!cookies?.jwt) {
    return res.sendStatus(204); // Yanıt gönder ve işlevi sonlandır
  }

  const refreshToken = cookies.jwt;

  // Veritabanında refreshToken var mı?
  const foundUser = usersDB.users.find(person => person.refreshToken === refreshToken);
  if (!foundUser) {
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
    return res.sendStatus(204); // Yanıt gönder ve işlevi sonlandır
  }

  // RefreshToken'ı sil
  const otherUsers = usersDB.users.filter(person => person.refreshToken !== foundUser.refreshToken);
  const currentUser = { ...foundUser, refreshToken: '' };
  usersDB.setUsers([...otherUsers, currentUser]);

  try {
    await fsPromises.writeFile(
      path.join(__dirname, '..', 'model', 'users.json'),
      JSON.stringify(usersDB.users)
    );
  } catch (error) {
    console.error('Error writing to file:', error);
    return res.sendStatus(500); // Sunucu hatası
  }

  // Çerezi temizle ve yanıt gönder
  res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
  res.sendStatus(204);
};


module.exports = { handleLogout };