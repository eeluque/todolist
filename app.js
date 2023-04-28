//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _= require("lodash");

const app = express();

const mongoose = require("mongoose");

main().catch(err => console.log(err));



async function main() {
  let results = [];
  await mongoose.connect("mongodb+srv://eduardoluque08:LJz7P7btwvsdE_5@cluster0.1i5dwuk.mongodb.net/?retryWrites=true&w=majority");


const todoItemSchema = new mongoose.Schema({
  name: String
})

const TodoItem = mongoose.model("Item", todoItemSchema);

const listSchema = new mongoose.Schema({
  name: String,
  items: [todoItemSchema]
})

const List = mongoose.model("List", listSchema);

const item1 = new TodoItem({
  name: "Make coffee"
})
const item2 = new TodoItem({
  name: "Study"
})
const item3 = new TodoItem({
  name: "Go to sleep"
})

const defaultItems = [item1, item2, item3];




app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


app.get("/", async function(req, res) {
  results = await TodoItem.find({});

  if(results.length === 0){
    TodoItem.insertMany(defaultItems);
    res.redirect("/");
  }
  else{

    res.render("list", {listTitle: "Today", newListItems: results})
  }
});

app.post("/", async function(req, res){

  const newItem = req.body.newItem;
  const listSubmitted = req.body.list;

  const newTodoItem = new TodoItem({
    name: newItem
  });

  if(listSubmitted === "Today"){
    await newTodoItem.save();
    res.redirect("/");
  }
  else{
    const searchedList = await List.findOne({name: listSubmitted})
    searchedList.items.push(newTodoItem);
    await searchedList.save();
    res.redirect("/" + listSubmitted);
  }

  });
 
app.post("/delete", async function(req, res){

  const itemToDelete = req.body.check;
  const itemDeleteList = req.body.listName;
  console.log(itemDeleteList);

  if(itemDeleteList === "Today" || itemDeleteList === "favicon.ico"){
    await TodoItem.deleteOne({_id: itemToDelete});
    res.redirect("/");
  }
  else{
   const deleteFromList = await List.findOneAndUpdate({name: itemDeleteList},{$pull: {items: {_id: itemToDelete}}})
   res.redirect("/"+ itemDeleteList);
  }
  

});

app.get("/:category", async function(req,res){
const listName = _.capitalize(req.params.category);

const foundList = await List.findOne({name: listName});

if(!foundList){
//create new list

  const newList = new List({
    name: listName,
    items: defaultItems
  })
 await newList.save();
 res.redirect("/" + listName);
} else{

  //show an existing list

res.render("list", {listTitle: foundList.name, newListItems: foundList.items})

}
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

}
