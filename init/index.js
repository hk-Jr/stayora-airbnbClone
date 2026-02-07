const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/stayora";
main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({});

  //inserting owner to all listings
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: "698588e280fd286c487e727f", // Replace with the actual user ID you want to set as the owner
  }));
  await Listing.insertMany(initData.data);

  console.log("data was Initialized");
};

initDB();
