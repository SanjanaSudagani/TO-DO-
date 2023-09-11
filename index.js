import express from "express";
import bodyParser from "body-parser";
import _ from "lodash";

const app = express();


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [];
let workItems = [];
let lastDate;

import mongoose from 'mongoose';
mongoose.set('bufferCommands', false);
mongoose.connect('mongodb+srv://sanjanas0507:Sanjana%4001@cluster0.r1lfigu.mongodb.net/todolistDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
    ssl: true
  });

const itemSchema = new mongoose.Schema({

  name: {
      type: String
    }
  
});

const listSchema = new mongoose.Schema({

  name: {
      type: String
    },
    items: [itemSchema]
  
});

const Item = mongoose.model('Item', itemSchema);
const List = mongoose.model('List', listSchema);

const i1=new Item({
  name:"Welcome to your To-Do list..."
});

const i2=new Item({
  name:"Hit + button to add items"
});
const i3=new Item({
  name:"<--- This is to delete items"
});

const ditems = [i1,i2,i3];

// Item.insertMany(ditems);



app.get("/", async function (req, res) {


  const dbitems = await Item.find({});
  if(dbitems.length===0){
Item.insertMany(ditems);
return res.redirect('/');
// dbitems.forEach(element => {
//               console.log(element.name);
//  });
  }


  res.render("index.ejs", {
    listTitle: "Today",
    newListItems: dbitems,
  });
});

app.post("/", async (req, res) => {
  const itemName = req.body.newItem;
  const listName = req.body.list;

    const item=new Item({
      name: itemName
    });

    if(listName==="Today"){
      item.save();
    return res.redirect("/");
    }
    else{
      const foundList= await List.findOne({name: listName});
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    }
    
});

app.post("/delete", async (req, res) => {
  var id=req.body.check;
  const listName=req.body.listName;
  //const ObjectId = mongoose.Types.ObjectId;

  const objectIdToDelete = new mongoose.Types.ObjectId(id);
  if(listName==="Today"){
  Item.deleteOne({ _id: objectIdToDelete._id }).then(res.redirect("/"));
  }
  else{
    const foundList=await List.findOneAndUpdate({name: listName}, {$pull: {items:{_id:objectIdToDelete}}});
    res.redirect("/"+listName);
  }
});



app.get("/:customName", async (req, res) => {
  const customName=_.capitalize(req.params.customName);
  const foundList=await List.find({name: customName})
  if(foundList.length===0){
    const list=new List({
    name: customName,
    items: ditems
  })
  list.save();
  res.redirect("/"+customName);
  }
  else{
    res.render("index.ejs", {
      listTitle: foundList[0].name,
      newListItems: foundList[0].items
    });
  }
  
});

// app.get("/work", async (req, res) => {
//   const workItems = await Work.find({});
//   res.render("index.ejs", {
//     listTitle: "Work List",
//     newListItems: workItems,
//   });
// });
// app.post("/work", (req, res) => {
//   const witem = req.body.newItem;
//   Work.insertMany(witem);
//   res.redirect("/work");
// });

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
