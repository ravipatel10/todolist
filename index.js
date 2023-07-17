const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();
const dotenv = require("dotenv");
dotenv.config();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

mongoose.set('strictQuery', false);

mongoose.connect(process.env.MONGO_CLOUD_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB', error);
  });

const itemsSchema = {
  name: {
    type: String,
    required: [true, "Please check your data entry, no item name is specified"],
  }
};

const Item = mongoose.model("Item", itemsSchema);

const defaultItems = [
  {
    name: "Welcome to our todolist!"
  },
  {
    name: "Hit the + button to add a new item"
  },
  {
    name: "<-- Hit this to delete an item"
  }
];

const listSchema = {
  name: {
    type: String,
    required: [true, "Please check your data entry, no item name is specified"]
  },
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully saved defaultItems to DB.");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = _.capitalize(req.body.list);

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", { listTitle: customListName, newListItems: foundList.items });
      }
    }
  });
});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function (err) {
      if (!err) {
        console.log("Successfully deleted the checked item.");
      }
    });

    res.redirect("/");
  } else {
    List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, function (err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  }
});


app.get("/edit/:itemId", function (req, res) {
    const itemId = req.params.itemId;
  
    Item.findOne({ _id: itemId }, function (err, foundItem) {
      if (!err) {
        res.render("edit", { item: foundItem });
      }
    });
  });
  
  app.post("/edit/:itemId", function (req, res) {
    const itemId = req.params.itemId;
    const newName = req.body.newName;
  
    Item.findByIdAndUpdate(itemId, { name: newName }, function (err) {
      if (!err) {
        res.redirect("/");
      }
    });
  });
  
app.listen(3000, function () {
  console.log("The server is running");
});
