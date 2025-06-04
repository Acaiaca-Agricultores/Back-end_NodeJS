import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    imageProfile: { type: String, default: "" },
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["agricultor", "consumidor"], required: true },
    propertyName: { type: String, if: { $ne: "consumidor" }, required: true },
    cityName: { type: String, required: true },
    stateName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

export default User;
