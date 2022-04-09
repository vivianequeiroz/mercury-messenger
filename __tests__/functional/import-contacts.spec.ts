import { Readable } from 'stream';
import mongoose from 'mongoose';
import Contact from '../../src/schemas/Contact';
import Tag from '../../src/schemas/Tag';

import ImportContactsService from '../../src/services/ImportContactsService';

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
    const contactsFileStream = Readable.from([
      'test1@test.com\n',
      'test2@test.com\n',
      'test3@test.com\n',
    ]);

    const importContacts = new ImportContactsService();

    await importContacts.run(contactsFileStream, ['Students', 'Class A']);

    const createdTags = await Tag.find({}).lean();

    expect(createdTags).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: 'Students' }),
        expect.objectContaining({ title: 'Class A' }),
      ]),
    );

    const createdTagsIds = createdTags.map(tag => tag._id);

    const createdContacts = await Contact.find({}).lean();

    expect(createdContacts).toEqual([
      expect.objectContaining({
        email: 'test1@test.com',
        tags: createdTagsIds,
      }),
      expect.objectContaining({
        email: 'test2@test.com',
        tags: createdTagsIds,
      }),
      expect.objectContaining({
        email: 'test3@test.com',
        tags: createdTagsIds,
      }),
    ]);
  });
});
