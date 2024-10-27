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

  return (
    <div class="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 p-4" dir="rtl">
      <div class="max-w-6xl mx-auto h-full">
        <h1 class="text-4xl font-bold mb-8 text-purple-600">دليل قارئ الشاشة TalkBack لنظام أندرويد</h1>
        <Show when={loading()}>
          <p class="text-lg text-gray-700">جاري تحميل الدليل...</p>
        </Show>
        <Show when={!loading() && guideContent()}>
          <div class="bg-white p-6 rounded-lg shadow-md prose prose-lg max-w-full">
            <div innerHTML={guideContent()}></div>
          </div>
        </Show>
      </div>
    </div>
  );
}

export default App;