const mongoose = require('mongoose');

const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username cannot be blank"]
    },
    hashedPassword: { 
        type: String,
        required: [true, "Password cannot be empty"]
    }
})

userSchema.statics.findAndValidate = async function (username, password) {
    const foundUser = await this.findOne({username}); //"this" refers to the User schema. Finds an object in the database of this schema where the username value matches the username the user just typed in. To see this actually in action and the values taht would be entered look at its use in app.js Await is needed because doing this takes time and we don't want the program progressing until this action is complete. 
    const isValid = await bcrypt.compare(password, foundUser.hashedPassword);//Compare to the password object of the user you found to the passwrod that was typed in. 
    return isValid? foundUser : false; //Ternary operator, if the password matches the password object of the user you found, isValid will exist/ be set to "true" and the whole of the user in isValid will be returned else false is returned.
    }

module.exports = mongoose.model("User", userSchema);