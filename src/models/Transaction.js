const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tipo: {
      type: String,
      required: true,
      enum: ["debito", "credito"],
    },
    descricao: {
      type: String,
      required: true,
      trim: true,
    },
    valor: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: (v) => typeof v === "number" && !Number.isNaN(v) && v > 0,
        message: "valor deve ser maior que zero.",
      },
    },
    data_lancamento: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Transaction", transactionSchema);
