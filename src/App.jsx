import { createSignal, createEffect, Show, For } from 'solid-js';
import { createEvent } from './supabaseClient';

function App() {
  const [loading, setLoading] = createSignal(false);
  const [guideContent, setGuideContent] = createSignal('');
  const [selectedReader, setSelectedReader] = createSignal(null);
  const [readers, setReaders] = createSignal([
    { name: 'NVDA', description: 'قارئ شاشة مجاني لنظام Windows' },
    { name: 'JAWS', description: 'قارئ شاشة مدفوع لنظام Windows' },
    { name: 'VoiceOver', description: 'قارئ شاشة مدمج في أجهزة Apple' },
    // أضف المزيد من قارئات الشاشة هنا
  ]);

  const fetchGuideContent = async (readerName) => {
    setLoading(true);
    setSelectedReader(readerName);
    try {
      const result = await createEvent('chatgpt_request', {
        prompt: `قدم دليلاً مفصلاً حول كيفية استخدام ${readerName} للمكفوفين باللغة العربية.`,
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

  return (
    <div class="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 p-4" dir="rtl">
      <div class="max-w-6xl mx-auto h-full">
        <Show when={!selectedReader()}>
          <h1 class="text-4xl font-bold mb-8 text-purple-600">دليل قارئات الشاشة</h1>
          <h2 class="text-2xl font-bold mb-4 text-purple-600">اختر قارئ الشاشة للاستعراض</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <For each={readers()}>
              {(reader) => (
                <div
                  class="bg-white p-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
                  onClick={() => fetchGuideContent(reader.name)}
                >
                  <h3 class="text-xl font-bold text-purple-600 mb-2">{reader.name}</h3>
                  <p class="text-gray-700">{reader.description}</p>
                </div>
              )}
            </For>
          </div>
        </Show>

        <Show when={selectedReader()}>
          <button
            class="mb-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
            onClick={() => setSelectedReader(null)}
          >
            العودة لقائمة قارئات الشاشة
          </button>
          <h2 class="text-2xl font-bold mb-4 text-purple-600">دليل {selectedReader()}</h2>
          <Show when={loading()}>
            <p class="text-lg text-gray-700">جاري تحميل الدليل...</p>
          </Show>
          <Show when={!loading() && guideContent()}>
            <div class="bg-white p-6 rounded-lg shadow-md prose prose-lg max-w-full">
              <div innerHTML={guideContent()}></div>
            </div>
          </Show>
        </Show>
      </div>
    </div>
  );
}

export default App;