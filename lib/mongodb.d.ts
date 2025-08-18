declare module '../../../lib/mongodb' {
  import { MongoClient } from 'mongodb';
  const clientPromise: Promise<MongoClient>;
  export default clientPromise;
}
declare module '../../lib/mongodb' {
  import { MongoClient } from 'mongodb';
  const clientPromise: Promise<MongoClient>;
  export default clientPromise;
}
declare module 'ELC-CONNECT/lib/mongodb' {
  import { MongoClient } from 'mongodb';
  const clientPromise: Promise<MongoClient>;
  export default clientPromise;
}
declare module '*lib/mongodb' {
  import { MongoClient } from 'mongodb';
  const clientPromise: Promise<MongoClient>;
  export default clientPromise;
}
