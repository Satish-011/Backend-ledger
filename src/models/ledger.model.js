const mongoose = require("mongoose");

const ledgerSchema = new mongoose.Schema({});

const ledgerModel = mongoose.model("ledger", ledgerSchema);

module.exports = ledgerModel;
