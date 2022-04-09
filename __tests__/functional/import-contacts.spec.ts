import mongoose from 'mongoose';
import Contact from '../../src/schemas/Contact';

const { MongoClient } = require('mongodb');

describe('Import contacts', () => {
  beforeAll(async () => {
    if (!process.env.MONGO_URL) {
      throw new Error('MongoDB server is not initialized');
    }

    await mongoose.connect(process.env.MONGO_URL);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Contact.deleteMany({});
  });

  it('should be able to import new contacts', async () => {
    await Contact.create({ email: 'test@test.com' });

    const list = await Contact.find({});

    expect(list).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ email: 'test@test.com' }),
      ]),
    );
  });
});
