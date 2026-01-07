const db = require('../config/db');

class UserRepository {
  async findByEmail(email) {
    return db('users').where({ email }).first();
  }

  async findById(id) {
    return db('users').where({ id }).first();
  }
}

module.exports = new UserRepository();