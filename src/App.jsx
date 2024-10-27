import { createSignal, createEffect, Show } from 'solid-js';
import { createEvent } from './supabaseClient';

function App() {
  const [loading, setLoading] = createSignal(false);
  const [guideContent, setGuideContent] = createSignal('');

  const fetchGuideContent = async () => {
    setLoading(true);
    try {
      const result = await createEvent('chatgpt_request', {
        prompt: `قدم دليلاً مفصلاً حول كيفية استخدام TalkBack، قارئ الشاشة لأجهزة أندرويد، باللغة العربية.`,
        response_type: 'text',
      });
      setGuideContent(result);
    } catch (error) {
      console.error('Error fetching guide content:', error);
      setGuideContent('حدث خطأ أثناء تحميل الدليل.');
    } finally {
      setLoading(false);
    }
  };

  createEffect(() => {
    fetchGuideContent();
  });

  const handleDeleteAll = () => {
    setGuideContent('');
  };

  const handleRefreshGuide = () => {
    fetchGuideContent();
  };

  return (
    <div class="h-full bg-gradient-to-br from-purple-100 to-blue-100 p-4" dir="rtl">
      <div class="max-w-6xl mx-auto h-full">
        <h1 class="text-4xl font-bold mb-8 text-purple-600">دليل قارئ الشاشة TalkBack لنظام أندرويد</h1>
        <div class="flex space-x-4 mb-4 justify-start">
          <button
            class="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
            onClick={handleDeleteAll}
          >
            حذف الكل
          </button>
          <button
            class="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
            onClick={handleRefreshGuide}
          >
            تحديث الدليل
          </button>
        </div>
        <Show when={loading()}>
          <p class="text-lg text-gray-700">جاري تحميل الدليل...</p>
        </Show>
        <Show when={!loading() && guideContent()}>
          <div class="bg-white p-6 rounded-lg shadow-md prose prose-lg max-w-full text-gray-800">
            <div innerHTML={guideContent()}></div>
          </div>
        </Show>
        <Show when={!loading() && !guideContent()}>
          <p class="text-lg text-gray-700">لا يوجد محتوى لعرضه.</p>
        </Show>
      </div>
    </div>
  );
}

export default App;