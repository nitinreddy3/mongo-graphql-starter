import { MongoClient } from "mongodb";
import resolvers from "./graphQL/resolver";
import typeDefs from "./graphQL/schema";
import { makeExecutableSchema } from "graphql-tools";

import { queryAndMatchArray } from "../testUtil";
import conn from "./connection";

let db, schema;
beforeAll(async () => {
  db = await MongoClient.connect(conn);
  schema = makeExecutableSchema({ typeDefs, resolvers, initialValue: { db: {} } });

  await db.collection("books").insert({ title: "Book 1", createdOn: new Date("2004-06-02T01:30:00") });
  await db.collection("books").insert({ title: "Book 2", createdOn: new Date("2004-06-02T01:30:10") });
  await db.collection("books").insert({ title: "Book 3", createdOn: new Date("2004-06-02T01:45:00") });
  await db.collection("books").insert({ title: "Book 4", createdOn: new Date("2004-06-02T02:00:00") });
  await db.collection("books").insert({ title: "Book 5", createdOn: new Date("2004-06-02T02:30:00") });
  await db.collection("books").insert({ title: "Book 6", createdOn: new Date("2004-06-02T03:00:00") });
  await db.collection("books").insert({ title: "Book 7", createdOn: new Date("2004-06-02T03:00:10") });
  await db.collection("books").insert({ title: "Book 8", createdOn: new Date("2004-06-02T03:00:20") });
});

afterAll(async () => {
  await db.collection("books").remove({});
  db.close();
  db = null;
});

test("Basic date match", async () => {
  await queryAndMatchArray({
    schema,
    db,
    query: `{allBooks(createdOn: "2004-06-02T03:00:10"){title}}`,
    coll: "allBooks",
    results: [{ title: "Book 7" }]
  });
});

test("Date in", async () => {
  await queryAndMatchArray({
    schema,
    db,
    query: `{allBooks(createdOn_in: ["2004-06-02T03:00:09", "2004-06-02T03:00:10", "2004-06-02T03:00:11"]){title}}`,
    coll: "allBooks",
    results: [{ title: "Book 7" }]
  });
});

test("Date lt", async () => {
  await queryAndMatchArray({
    schema,
    db,
    query: `{allBooks(createdOn_lt: "2004-06-02T01:30:10"){title}}`,
    coll: "allBooks",
    results: [{ title: "Book 1" }]
  });
});

test("Date lte", async () => {
  await queryAndMatchArray({
    schema,
    db,
    query: `{allBooks(createdOn_lte: "2004-06-02T01:30:10", SORT: {title: 1}){title}}`,
    coll: "allBooks",
    results: [{ title: "Book 1" }, { title: "Book 2" }]
  });
});

test("Date gt", async () => {
  await queryAndMatchArray({
    schema,
    db,
    query: `{allBooks(createdOn_gt: "2004-06-02T03:00:10"){title}}`,
    coll: "allBooks",
    results: [{ title: "Book 8" }]
  });
});

test("Date gte", async () => {
  await queryAndMatchArray({
    schema,
    db,
    query: `{allBooks(createdOn_gte: "2004-06-02T03:00:10", SORT: {title: 1}){title}}`,
    coll: "allBooks",
    results: [{ title: "Book 7" }, { title: "Book 8" }]
  });
});
