import { Box, Button, Group, Title } from '@mantine/core'
import { RichTextEditor, Link } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { useEffect, useRef } from 'react';
import TurndownService from 'turndown';
import { sendMarkdown } from './sendMarkdown';
import { fetchAI } from './ai';

function App() {
  const content = 'Start writing your notes';
  const title = useRef(null)


  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content,
  });

  // useEffect(() => {
  //   if (editor)
  //     console.log(editor.getHTML())
  // }, [editor])

  // const insertNewContent = () => {
  //   const newContent = '<p>New Content</p>';
  //   editor.chain().appendText(newContent).focus().run();
  // };

  async function handleSendNotes() {
    const turndownService = new TurndownService();
    const theHTML = editor.getHTML();
    const convertedMarkdown = turndownService.turndown(theHTML);
    console.log(convertedMarkdown, title.current.textContent);
    await sendMarkdown(convertedMarkdown, title.current.textContent, 0, 0);
  }


  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === 'Enter') {
        // Your code to handle Ctrl+Enter
        const notes = editor.getHTML();
        fetchAI(notes, 'extend it further', editor);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [editor]); // Empty dependency array ensures the effect runs only once


  return (
    <>
      <Group w={'100%'} justify='center' p={'30px'} style={{ flexDirection: 'column' }}>
        <Group justify='space-between' w={'100%'}>
          <Box bg="gray" p={'sm'} style={{ borderRadius: '10px' }}>
            <Title contentEditable={'true'} order={1} ref={title}>Enter Your title</Title>
          </Box>
          <Button variant="filled" color="dark" size="xl" radius="xl" onClick={handleSendNotes}>Create Note</Button>
        </Group>
        <RichTextEditor editor={editor} w={'100%'}>
          <RichTextEditor.Toolbar sticky stickyOffset={60}>
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Bold />
              <RichTextEditor.Italic />
              <RichTextEditor.Underline />
              <RichTextEditor.ClearFormatting />
              <RichTextEditor.Code />
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.H1 />
              <RichTextEditor.H2 />
              <RichTextEditor.H3 />
              <RichTextEditor.H4 />
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.AlignLeft />
              <RichTextEditor.AlignCenter />
              <RichTextEditor.AlignJustify />
              <RichTextEditor.AlignRight />
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Undo />
              <RichTextEditor.Redo />
            </RichTextEditor.ControlsGroup>
          </RichTextEditor.Toolbar>

          <RichTextEditor.Content />
        </RichTextEditor>      </Group>
    </>
  )
}

export default App
