import { Permission } from "node-appwrite"; 
import { db, questionCollection } from "../name";
import { databases } from "./config";
import { IndexType } from "node-appwrite";
export default async function createQuestionCollection() {
    //create collection
    await databases.createCollection(db, questionCollection, questionCollection, [
        Permission.read("any"),
        Permission.read("users"),
        Permission.create("users"),
        Permission.update("users"),
        Permission.delete("users"),
    ])
    console.log("question collection created ");

  //Creating Attributes
    await Promise.all([
        databases.createStringAttribute(db, questionCollection, "title", 100, true),
        databases.createStringAttribute(db, questionCollection, "content", 1000, true),
        databases.createStringAttribute(db, questionCollection, "authorId", 50, true), 
        databases.createStringAttribute(db, questionCollection, "tags", 50,true, undefined, true), 
        databases.createStringAttribute(db, questionCollection, "attachementId", 50, false), 
    ]);
    console.log("question Attributes created ");

    //create Indexes
   
    await Promise.all([
        databases.createIndex(db, questionCollection, "title", IndexType.Fulltext, ["title"]),
        databases.createIndex(db, questionCollection, "content", IndexType.Fulltext, ["content"]),
    ]);
      console.log("question Indexes created ");

}
