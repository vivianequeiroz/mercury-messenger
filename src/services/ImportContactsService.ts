import { Readable } from 'stream';
import { parse } from 'csv-parse';

import Contact from '@schemas/Contact';
import Tag from '@schemas/Tag';

class ImportContactsService {
  async run(contactsFileStream: Readable, tags: string[]): Promise<void> {
    const parsers = parse({
      delimiter: ',',
    });

    const parseCSV = contactsFileStream.pipe(parsers);

    const existingTags: any = await Tag.find({
      title: {
        $in: tags,
      },
    });

    const existingTagsTitles = existingTags.map(tag => tag.title);

    const newTagsData = tags
      .filter(tag => !existingTagsTitles.includes(tag))
      .map(tag => ({ title: tag }));

    const createdTags = await Tag.create(newTagsData);
    const tagsIds = createdTags.map(tag => tag._id);

    parseCSV.on('data', async line => {
      const [email] = line;

      await Contact.findOneAndUpdate(
        { email },
        { $addToSet: { tags: tagsIds } },
        { upsert: true },
      );
    });

    await new Promise(resolve => parseCSV.on('end', resolve));
  }
}

export default ImportContactsService;
