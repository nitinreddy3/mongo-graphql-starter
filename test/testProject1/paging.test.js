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

  await db.collection("books").insert({ title: "Book 4", pages: 200 });
  await db.collection("books").insert({ title: "Book 6", pages: 200 });
  await db.collection("books").insert({ title: "Book 5", pages: 200 });
  await db.collection("books").insert({ title: "Book 8", pages: 200 });
  await db.collection("books").insert({ title: "Book 1", pages: 100 });
  await db.collection("books").insert({ title: "Book 2", pages: 150 });
  await db.collection("books").insert({ title: "Book 7", pages: 210 });
  await db.collection("books").insert({ title: "Book 3", pages: 90 });
});

afterAll(async () => {
  await db.collection("books").remove({});
  db.close();
  db = null;
});

test("Basic LIMIT 1", async () => {
  await queryAndMatchArray({
    schema,
    db,
    query: "{allBooks(SORT: {title: 1}, LIMIT: 3){title, pages}}",
    coll: "allBooks",
    results: [{ title: "Book 1", pages: 100 }, { title: "Book 2", pages: 150 }, { title: "Book 3", pages: 90 }]
  });
});

test("Basic LIMIT 2", async () => {
  await queryAndMatchArray({
    schema,
    db,
    query: "{allBooks(SORTS: [{pages: 1}, {title: -1}], LIMIT: 3){title, pages}}",
    coll: "allBooks",
    results: [{ title: "Book 3", pages: 90 }, { title: "Book 1", pages: 100 }, { title: "Book 2", pages: 150 }]
  });
});

test("Basic SKIP 1", async () => {
  await queryAndMatchArray({
    schema,
    db,
    query: "{allBooks(SORT: {title: 1}, SKIP: 2, LIMIT: 3){title, pages}}",
    coll: "allBooks",
    results: [{ title: "Book 3", pages: 90 }, { title: "Book 4", pages: 200 }, { title: "Book 5", pages: 200 }]
  });
});

test("Basic SKIP 2", async () => {
  await queryAndMatchArray({
    schema,
    db,
    query: "{allBooks(SORTS: [{pages: 1}, {title: -1}], SKIP: 2, LIMIT: 3){title, pages}}",
    coll: "allBooks",
    results: [{ title: "Book 2", pages: 150 }, { title: "Book 8", pages: 200 }, { title: "Book 6", pages: 200 }]
  });
});

test("Paging 1", async () => {
  await queryAndMatchArray({
    schema,
    db,
    query: "{allBooks(SORT: {title: 1}, PAGE: 2, PAGE_SIZE: 2){title, pages}}",
    coll: "allBooks",
    results: [{ title: "Book 3", pages: 90 }, { title: "Book 4", pages: 200 }]
  });
});

test("Paging 2", async () => {
  await queryAndMatchArray({
    schema,
    db,
    query: "{allBooks(SORTS: [{pages: 1}, {title: -1}], PAGE: 2, PAGE_SIZE: 2){title, pages}}",
    coll: "allBooks",
    results: [{ title: "Book 2", pages: 150 }, { title: "Book 8", pages: 200 }]
  });
});

test("Paging 3", async () => {
  await queryAndMatchArray({
    schema,
    db,
    query: "{allBooks(SORT: {title: 1}, PAGE: 1, PAGE_SIZE: 2){title, pages}}",
    coll: "allBooks",
    results: [{ title: "Book 1", pages: 100 }, { title: "Book 2", pages: 150 }]
  });
});

test("Paging 4", async () => {
  await queryAndMatchArray({
    schema,
    db,
    query: "{allBooks(SORTS: [{pages: 1}, {title: -1}], PAGE: 1, PAGE_SIZE: 2){title, pages}}",
    coll: "allBooks",
    results: [{ title: "Book 3", pages: 90 }, { title: "Book 1", pages: 100 }]
  });
});

test("Paging 5", async () => {
  await queryAndMatchArray({
    schema,
    db,
    query: "{allBooks(SORT: {title: 1}, PAGE: 2, PAGE_SIZE: 7){title, pages}}",
    coll: "allBooks",
    results: [{ title: "Book 8", pages: 200 }]
  });
});

test("Paging 6", async () => {
  await queryAndMatchArray({
    schema,
    db,
    query: "{allBooks(SORTS: [{pages: 1}, {title: -1}], PAGE: 2, PAGE_SIZE: 7){title, pages}}",
    coll: "allBooks",
    results: [{ title: "Book 7", pages: 210 }]
  });
});

test("Paging 7", async () => {
  await queryAndMatchArray({
    schema,
    db,
    query: "{allBooks(SORT: {title: 1}, PAGE: 3, PAGE_SIZE: 7){title, pages}}",
    coll: "allBooks",
    results: []
  });
});

test("Paging 8", async () => {
  await queryAndMatchArray({
    schema,
    db,
    query: "{allBooks(SORTS: [{pages: 1}, {title: -1}], PAGE: 3, PAGE_SIZE: 7){title, pages}}",
    coll: "allBooks",
    results: []
  });
});
