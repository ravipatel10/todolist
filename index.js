
const express = require("express");
const bodyparser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");

// Here, we create date module and use it like this
// const date = require(__dirname + "/date.js");


const app = express();

app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static("public"));

// In ejs(Embended Java Script) module , we should have to create filename.ejs file in "views" folder

app.set("view engine", "ejs");

//*********************** For Connect to the Server ********************** 

mongoose.set('strictQuery', false);

mongoose.connect('mongodb+srv://test:test-123@cluster0.gnhpjmb.mongodb.net/todolistDB', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB', error);
  });


const itemsSchema = {
    name: {
        type: String,
        required: {true:"Please check your data entry, no item name is specified"},
    }
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name:"Welcome to our todolist!",
});

const item2 = new Item({
    name:"Hit the + button to add a new item",
});

const item3 = new Item({
    name:"<-- Hit this to delete an item",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: {
        type: String,
        required: {true:"Please check your data entry, no item name is specified"},
    },
    items: [itemsSchema],
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {

    Item.find({}, function(err, foundItems){
        
        // console.log(foundItems);
        
        if(foundItems.length === 0){
            
            Item.insertMany(defaultItems, function(err){
                if(err){
                    console.log(err);
                }
                else{
                    console("Successfully saved defaultItems to DB.");
                }
            });
            res.redirect("/");
        }
        else{
            res.render("list", { listTitle: "Today", newListItems: foundItems });
        }
    });

    // We have to call the date module such as

    // let day = date.getDate();
    // let day = date.getDay();

});

app.post("/", function (req, res) {

    const itemName = req.body.newItem;
    const listName = _.capitalize(req.body.list);

    const item = new Item({
        name: itemName,
    });

    if(listName === "Today"){

        item.save();
        res.redirect("/");

    }
    else{
        List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }

});

app.get("/:customListName", function(req, res){
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}, function(err, foundList){
        if(!err){
            if(!foundList){
                // Create a new list
                
                const list = new List({
                    name: customListName,
                    items: defaultItems,
                });

                list.save();
                res.redirect("/" + customListName);
            }
            else{
                // Show an existing list

                res.render("list", { listTitle: customListName, newListItems: foundList.items });
            }
        }
    });

});

app.post("/delete", function(req, res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){

        Item.findByIdAndRemove(checkedItemId, function(err){
            if(!err){
                console.log("Successfully deleted the checked item.");
            }
        });

        res.redirect("/");

    }
    else{

        List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}},function(err, foundList){
            if(!err){
                res.redirect("/" + listName);
            }
        });
    }

});


// app.get("/work", function (req, res) {
//     res.render("list", { listTitle: "Work List", newListItems: workItems });
// });

app.listen(3000, function () {
    console.log("The server is run on 3000 port number");
});
