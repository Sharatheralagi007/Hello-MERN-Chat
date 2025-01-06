const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // Name is mandatory
    },
    email: {
      type: String,
      required: true, // Email is mandatory
      unique: true, // Email must be unique
    },
    password: {
      type: String,
      required: true, // Password is mandatory
    },
    pic: {
      type: String,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg", // Default image URL
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

// Method to compare entered password with the hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Pre-save middleware to hash the password before saving to the database
userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified or is new
  if (!this.isModified("password")) {
    return next();
  }

  // Generate a salt
  const salt = await bcrypt.genSalt(10);

  // Hash the password with the salt
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

// Create the User model
const User = mongoose.model("User", userSchema);

module.exports = User;
