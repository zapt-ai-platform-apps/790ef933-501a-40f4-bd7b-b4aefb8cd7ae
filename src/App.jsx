import { createSignal, onMount, createEffect, Show, For } from 'solid-js';
import { createEvent, supabase } from './supabaseClient';
import { Auth } from '@supabase/auth-ui-solid';
import { ThemeSupa } from '@supabase/auth-ui-shared';

function App() {
  const [user, setUser] = createSignal(null);
  const [currentPage, setCurrentPage] = createSignal('login');
  const [loading, setLoading] = createSignal(false);
  const [guideContent, setGuideContent] = createSignal('');
  const [selectedReader, setSelectedReader] = createSignal(null);
  const [readers, setReaders] = createSignal([
    { name: 'NVDA', description: 'قارئ شاشة مجاني لنظام Windows' },
    { name: 'JAWS', description: 'قارئ شاشة مدفوع لنظام Windows' },
    { name: 'VoiceOver', description: 'قارئ شاشة مدمج في أجهزة Apple' },
    // أضف المزيد من قارئات الشاشة هنا
  ]);

  const checkUserSignedIn = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      setCurrentPage('homePage');
    }
  };

  onMount(checkUserSignedIn);

  createEffect(() => {
    const authListener = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        setUser(session.user);
        setCurrentPage('homePage');
      } else {
        setUser(null);
        setCurrentPage('login');
      }
    });

    return () => {
      authListener.data.unsubscribe();
    };
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentPage('login');
  };

  const fetchGuideContent = async (readerName) => {
    setLoading(true);
    try {
      const result = await createEvent('chatgpt_request', {
        prompt: `قدم دليلاً مفصلاً حول كيفية استخدام ${readerName} للمكفوفين باللغة العربية.`,
        response_type: 'text',
      });
      setGuideContent(result);
      setSelectedReader(readerName);
      setCurrentPage('guidePage');
    } catch (error) {
      console.error('Error fetching guide content:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 p-4" dir="rtl">
      <Show
        when={currentPage() === 'homePage'}
        fallback={
          <div class="flex items-center justify-center min-h-screen">
            <div class="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
              <h2 class="text-3xl font-bold mb-6 text-center text-purple-600">تسجيل الدخول بواسطة ZAPT</h2>
              <a
                href="https://www.zapt.ai"
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue-500 hover:underline mb-6 block text-center"
              >
                تعرف على المزيد حول ZAPT
              </a>
              <Auth
                supabaseClient={supabase}
                appearance={{ theme: ThemeSupa }}
                providers={['google', 'facebook', 'apple']}
                magicLink={true}
                showLinks={false}
                localization={{
                  variables: {
                    sign_in: {
                      email_label: 'البريد الإلكتروني',
                      password_label: 'كلمة المرور',
                      button_label: 'تسجيل الدخول',
                    },
                  },
                }}
              />
            </div>
          </div>
        }
      >
        <div class="max-w-6xl mx-auto h-full">
          <div class="flex justify-between items-center mb-8">
            <h1 class="text-4xl font-bold text-purple-600">دليل قارئات الشاشة</h1>
            <button
              class="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
              onClick={handleSignOut}
            >
              تسجيل الخروج
            </button>
          </div>

          <Show when={currentPage() === 'homePage'}>
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

          <Show when={currentPage() === 'guidePage'}>
            <button
              class="mb-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
              onClick={() => setCurrentPage('homePage')}
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
      </Show>
    </div>
  );
}

export default App;