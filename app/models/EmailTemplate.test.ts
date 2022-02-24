import { renderBody } from './EmailTemplate';

describe('renderBody', () => {
  it('empty', () => {
    const body = renderBody([], {});
    expect(body).toEqual('');
  });

  it('empty paragraph', () => {
    const body = renderBody(
      [{ type: 'paragraph', children: [{ text: '' }] }],
      {}
    );
    expect(body).toEqual('');
  });

  it('paragraph with words', () => {
    const body = renderBody(
      [{ type: 'paragraph', children: [{ text: 'Hello World' }] }],
      {}
    );
    expect(body).toEqual('<mj-text>Hello World</mj-text>');
  });

  it('paragraph with a tag', () => {
    const body = renderBody(
      [
        {
          type: 'paragraph',
          children: [
            { text: 'Hello ' },
            { type: 'tag', tag: 'Name', children: [] },
            { text: '!' },
          ],
        },
      ],
      { Name: 'Paul' }
    );
    expect(body).toEqual('<mj-text>Hello Paul!</mj-text>');
  });

  it('paragraph with a tag with file', () => {
    const body = renderBody(
      [
        {
          type: 'paragraph',
          children: [
            { text: 'File: ' },
            { type: 'tag', tag: 'File', children: [] },
          ],
        },
      ],
      { File: 'File 2.pdf (https://my.file.com/file.pdf)' }
    );
    expect(body).toEqual(
      '<mj-text>File: <a href="https://my.file.com/file.pdf">File 2.pdf</a></mj-text>'
    );
  });

  it('paragraph with a link', () => {
    const body = renderBody(
      [
        {
          type: 'paragraph',
          children: [
            { text: 'Website: ' },
            {
              type: 'link',
              url: 'https://test.com',
              children: [{ text: 'Test website' }],
            },
          ],
        },
      ],
      {}
    );
    expect(body).toEqual(
      '<mj-text>Website: <a href="https://test.com">Test website</a></mj-text>'
    );
  });

  it('paragraph with a tag in a link', () => {
    const body = renderBody(
      [
        {
          type: 'paragraph',
          children: [
            { text: 'Website: ' },
            {
              type: 'link',
              url: 'https://test.com',
              children: [
                { text: 'Test website (' },
                { type: 'tag', tag: 'Category', children: [] },
                { text: ')' },
              ],
            },
          ],
        },
      ],
      { Category: 'Cats' }
    );
    expect(body).toEqual(
      '<mj-text>Website: <a href="https://test.com">Test website (Cats)</a></mj-text>'
    );
  });
});
