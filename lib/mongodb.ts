import { MongoClient } from "mongodb"

if (!process.env.MONGODB_URI) {
	throw new Error("MONGODB_URI não definida no .env")
}

const uri = process.env.MONGODB_URI

const g = global as typeof globalThis & {
	_mongoClientPromise?: Promise<MongoClient>
}

g._mongoClientPromise ??= new MongoClient(uri).connect()

export default g._mongoClientPromise as Promise<MongoClient>
