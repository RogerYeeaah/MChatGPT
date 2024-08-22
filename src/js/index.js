
const { Configuration, OpenAIApi } = require("openai");
const { markedHighlight } = require('marked-highlight');
const apiKey = process.env.OPENAI_API_KEY;
const marked = require('marked');
const hljs = require('highlight.js');

// css
import '../css/styles.scss';
import 'highlight.js/styles/base16/default-light.css'; 

// 取得使用者輸入的元素
const userInputElement = document.getElementById('insertBox');
// 取得要顯示回應的父元素
const chatBoxFatherElement = document.querySelector('.response');
// 取得要顯示回應的元素
const chatBoxElement = document.querySelector('.responseBox');
// 載入狀態
let isLoading = false;
// 初始化對話紀錄陣列
let conversationHistory = []; 

const configuration = new Configuration({
  apiKey,
  basePath: "https://free.gpt.ge/v1"
});

const openai = new OpenAIApi(configuration);

// highlight
marked.use(markedHighlight({
  langPrefix: 'hljs language-',
  highlight(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  }
}));

async function getResponse() {
  const userMessage = userInputElement.value;
  if(!userMessage) return
  
  // 切換載入狀態
  isLoading = true;
  chatBoxElement.classList.add('loading')
  chatBoxFatherElement.classList.add('loading')
  userInputElement.disabled = true;

  try {
    const chatCompletion = await openai.createChatCompletion({
      //  gpt-4o-mini（速度一般，若要体验极速回复，可购买付费API）
      //  gpt-3.5-turbo-0125
      //  gpt-3.5-turbo-1106
      //  gpt-3.5-turbo
      //  gpt-3.5-turbo-16k
      //  net-gpt-3.5-turbo (可联网搜索模型-稳定性稍差)
      //  whisper-1
      //  dall-e-2
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: userMessage }],
    });

    // 將對話加入紀錄
    conversationHistory.push(
      { role: "user", content: userMessage },
      { role: "assistant", content: chatCompletion.data.choices[0].message.content }
    );

    // 更新 UI 顯示對話紀錄
    updateChatHistory();
  } catch (error) {
    // 處理錯誤，例如顯示錯誤訊息給使用者
    console.error(error);
  } finally {
    isLoading = false;
    insertBox.value = '';
    chatBoxElement.classList.remove('loading')
    chatBoxFatherElement.classList.remove('loading')
    userInputElement.disabled = false;
    userInputElement.focus();
    setTimeout(() => {
      const lastMsg = chatBoxElement.lastElementChild?.offsetTop;
      chatBoxElement.scrollTo( 0 , lastMsg - 90 );
    }, 100);
  }
}

// UI處理
function updateChatHistory() {
  const chatHistoryElement = document.querySelector('.responseBox');
  chatHistoryElement.innerHTML = '';

  conversationHistory.forEach(message => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(message.role);
    messageElement.innerHTML = marked.parse(message.content); // 使用 marked 转换

    chatHistoryElement.appendChild(messageElement);
  });
}

// 按鈕點擊事件
document.querySelector('.submit').addEventListener('click', async () => {
  getResponse();
});

// 按下 Enter 鍵事件
document.querySelector('input').addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault(); // 阻止預設行為 (避免換行)
    getResponse();
  }
});