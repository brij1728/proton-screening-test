import { MongoClient } from 'mongodb';

let db = null;

const connectDB = async (done) => {
    try {
        const data = await MongoClient.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
        db = data.db('chatGPT');
        done();
    } catch (err) {
        done(err);
    }
};

export { connectDB, db };
