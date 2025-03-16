'use client';

import Warning from '@/components/warning';
import useNotes from '@/lib/context/NotesContext';
import { EditorContent, useEditor } from '@tiptap/react';
import CharacterCount from '@tiptap/extension-character-count';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useState } from 'react';
import { type JSONContent } from "@tiptap/core"

function NovelEditor({ id }: { id: string }) {
  const [data, setData] = useState<JSONContent | string>('');
  const [cloudData, setCloudData] = useState<JSONContent | string>('');
  const [syncWithCloudWarning, setSyncWithCloudWarning] = useState(false);
  const [saveStatus, setSaveStatus] = useState('Saved');
  const [wordCount, setWordCount] = useState(0); // state for word count

  const { revalidateNotes, kv } = useNotes();

  const loadData = async () => {
    try {
      const response = await fetch(`/api/note?id=${id}`);

      if (response.status === 404) {
        return null;
      }
      else if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const jsonData = await response.json() as JSONContent;
      return jsonData;
    } catch (error) {
      console.error('Error loading data from cloud:', error);
      return null;
    }
  };

  // Effect to synchronize data
  useEffect(() => {
    const synchronizeData = async () => {
      const cloud = await loadData();
      if (cloud) {
        setCloudData(cloud);

        const local = localStorage.getItem(id);
        if (local) {
          setData(local);
          if (local !== JSON.stringify(cloud)) {
            setSyncWithCloudWarning(true);
          }
        } else {
          setData(cloud);
          localStorage.setItem(id, JSON.stringify(cloud));
        }
      }
    };

    void synchronizeData();
  }, [id]);

  const handleKeepLocalStorage = () => {
    setSyncWithCloudWarning(false);
  };

  const handleKeepCloudStorage = () => {
    localStorage.setItem(id, JSON.stringify(cloudData));
    setData(cloudData);
    setSyncWithCloudWarning(false);
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      CharacterCount.configure({
        wordCounter: (text) => {
          return text.split(/\s+/).filter(word => word !== '').length;
        },
      }),
    ],
    content: data,
    onUpdate: ({ editor }) => {
      setSaveStatus('Unsaved');
      const json = editor.getJSON();
      setData(json);

      // Update word count when text changes
      setWordCount(editor.storage.characterCount.words());
    },
    onBlur: async ({ editor }) => {
      setSaveStatus('Saving...');
      const json = editor.getJSON();
      const response = await fetch('/api/note', {
        method: 'POST',
        body: JSON.stringify({ id, data: json }),
      });
      const res = await response.text();
      setSaveStatus(res);
    },
  });

  return (
    <>
      {syncWithCloudWarning && (
        <Warning
          handleKeepLocalStorage={handleKeepLocalStorage}
          handleKeepCloudStorage={handleKeepCloudStorage}
        />
      )}
      <div className="relative w-full max-w-screen-lg pb-8">
        <div className="absolute right-5 top-5 mb-5 rounded-lg bg-stone-100 px-2 py-1 text-sm text-stone-400">
          {saveStatus}
        </div>
        <EditorContent
          editor={editor}
          className="novel-relative novel-min-h-[500px] novel-w-full novel-max-w-screen-lg novel-border-stone-200 sm:novel-mb-[calc(20vh)] sm:novel-rounded-lg sm:novel-border sm:novel-shadow-lg"
        />
      </div>
      {/* Word count display */}
      <div className="mt-4 text-center text-sm text-gray-500">
        Word Count: {wordCount}
      </div>
    </>
  );
}

export default NovelEditor;
