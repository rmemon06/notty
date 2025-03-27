'use client';

import Warning from '@/components/warning';
import useNotes from '@/lib/context/NotesContext';
import { Editor } from 'novel';
import { useEffect, useState } from 'react';
import { type JSONContent } from "@tiptap/core"

function NovelEditor({ id }: { id: string }) {
  const [data, setData] = useState<JSONContent | string>('');
  const [cloudData, setCloudData] = useState<JSONContent | string>('');
  const [syncWithCloudWarning, setSyncWithCloudWarning] = useState(false);
  const [saveStatus, setSaveStatus] = useState('Saved');
  const [wordCount, setWordCount] = useState(0);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

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

  const handleUpdate = (editor: any) => {
    setSaveStatus('Unsaved');
    // Calculate word count
    const text = editor.getText();
    const count = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    setWordCount(count);
  };

  const updateLastSavedTime = () => {
    setLastSaved(new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    }));
  };

  return (
    <>
      {syncWithCloudWarning && (
        <Warning
          handleKeepLocalStorage={handleKeepLocalStorage}
          handleKeepCloudStorage={handleKeepCloudStorage}
        />
      )}
      <div className="relative w-full max-w-screen-lg pb-8">
        <div className="absolute right-5 top-5 flex items-center gap-2">
          <div className="rounded-lg bg-stone-100 px-2 py-1 text-sm text-stone-400">
            {saveStatus}
          </div>
          {lastSaved && (
            <div className="text-sm text-stone-500">
              Last saved: {lastSaved}
            </div>
          )}
        </div>
        <Editor
          key={JSON.stringify(data)}
          defaultValue={data}
          storageKey={id}
          className="novel-relative novel-min-h-[500px] novel-w-full novel-max-w-screen-lg novel-border-stone-200 sm:novel-mb-[calc(20vh)] sm:novel-rounded-lg sm:novel-border sm:novel-shadow-lg"
          completionApi="/api/generate"
          onUpdate={(editor) => {
            handleUpdate(editor);
          }}
          onDebouncedUpdate={async (editor) => {
            if (!editor) return;
            const kvValue = kv.find(([key]) => key === id);
            const kvValueFirstLine = kvValue?.[1].content?.[0].content[0].text.split('\n')[0];

            // if first line edited, revalidate notes
            if (editor.getText().split('\n')[0] !== kvValueFirstLine) {
              void revalidateNotes();
            }

            setSaveStatus('Saving...');
            try {
              const response = await fetch('/api/note', {
                method: 'POST',
                body: JSON.stringify({ id, data: editor.getJSON() }),
              });
              const res = await response.text();
              setSaveStatus(res);
              updateLastSavedTime();
            } catch (error) {
              setSaveStatus('Save failed');
              console.error('Error saving note:', error);
            }
          }}
        />
        {/* Word count display */}
        <div className="mt-4 text-center text-sm text-gray-500">
          Word Count: {wordCount}
        </div>
      </div>
    </>
  );
}

export default NovelEditor;
