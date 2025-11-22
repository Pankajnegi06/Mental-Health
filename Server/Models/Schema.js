const mongoose = require("mongoose");

const mySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    verifyOtp: {
      type: String,
      default: "",
    },
    verifyOtpExpiredAt: {
      type: Number,
      default: 0,
    },
    isAccountVerified: {
      type: Boolean,
      default: false,
    },
    resetOtpExpiredAt: {
      type: Number,
      default: 0,
    },
    phone: {
      type: String,
      default : ""
    },
    dob: {
      default : null,
      type: Date,
    },
    bloodGroup: {
      default : "",
      type: String,
    },
    address: {
      default : "",
      type: String,
    },
    smoking: {
      type: Boolean,
      default: false,
    },
    profileImage: {
      type: String,
      default : "https://icon-library.com/images/generic-user-icon/generic-user-icon-9.jpg"
    },
    drinking: {
      type: Boolean,
      default: false,
    },
    allDocuments: [
      {
        title: {
          type: String,
          required: true,
        },
        fileLink: {
          type: String,
          required: true,
        },
      },
    ],
    allAppointments: [
      {
        appointmentId: {
          type: Number,
          required: true,
        },
        date: {
          type: Date,
          required: true,
        },
        time: {
          type: String,
          required: true,
        },
        hospitalName: {
          type: String,
          required: true,
        },
        status: {
          type: Boolean,
          default: false,
        },
      },
    ],
    journals:[
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "journals",
      }
    ]
  },
  {
    timestamps: true,
  }
);

const myModel = mongoose.model("patients", mySchema);

module.exports = myModel;