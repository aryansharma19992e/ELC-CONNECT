import mongoose from 'mongoose'

declare global {
  // eslint-disable-next-line no-var
  var mongooseConn: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined
}

let cached = global.mongooseConn

if (!cached) {
  cached = global.mongooseConn = { conn: null, promise: null }
}

export async function connectToDatabase() {
  if (cached!.conn) return cached!.conn

  if (!cached!.promise) {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/elc_connect'
    const dbName = process.env.MONGODB_DB || 'elc_connect'
    cached!.promise = mongoose.connect(uri, { dbName })
  }

  cached!.conn = await cached!.promise
  return cached!.conn
}


