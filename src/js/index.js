const { Configuration, OpenAIApi } = require("openai");
const { markedHighlight } = require('marked-highlight');
const apiKey = process.env.OPENAI_API_KEY;
const marked = require('marked');
const hljs = require('highlight.js');

// css
import '../css/styles.scss';
import 'highlight.js/styles/base16/default-light.css'; 

// DOM元素
const userInputElement = document.getElementById('insertBox');
const chatBoxFatherElement = document.querySelector('.response');
const chatBoxElement = document.querySelector('.responseBox');
const submitButton = document.querySelector('.submit');

// 状态管理
let isLoading = false; 
let conversationHistory = [];

// OpenAI API配置
const configuration = new Configuration({
  apiKey,
  basePath: "https://free.gpt.ge/v1"
});
const openai = new OpenAIApi(configuration);

marked.use(markedHighlight({
  langPrefix: 'hljs language-',
  highlight(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  }
}));

async function getResponse() {
  const userMessage = userInputElement.value.trim();
  if (!userMessage) return;

  toggleLoadingState(true);
  userInputElement.disabled = true;

  try {
    const chatCompletion = await openai.createChatCompletion({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: userMessage }],
    });

    const assistantMessage = chatCompletion.data.choices[0].message.content;
    updateConversationHistory(userMessage, assistantMessage);
    updateChatHistory();
  } catch (error) {
    console.error("Error fetching response:", error);
    // 在此处理 DOM，以显示错误消息。
  } finally {
    toggleLoadingState(false);
    userInputElement.value = '';
    userInputElement.disabled = false;
    userInputElement.focus();
    scrollToLastMessage();
  }
}

function toggleLoadingState(isLoading) {
  chatBoxElement.classList.toggle('loading', isLoading);
  chatBoxFatherElement.classList.toggle('loading', isLoading);
}

function updateConversationHistory(userMessage, assistantMessage) {
  conversationHistory.push(
    { role: "user", content: userMessage },
    { role: "assistant", content: assistantMessage }
  );
}

function updateChatHistory() {
  chatBoxElement.innerHTML = conversationHistory.map(message => `
    <div class="message ${message.role}">
      ${marked.parse(message.content)}
    </div>
  `).join('');
}

function scrollToLastMessage() {
  setTimeout(() => {
    const lastMsg = chatBoxElement.lastElementChild?.offsetTop;
    chatBoxElement.scrollTo(0, lastMsg - 90);
  }, 100);
}

// 事件绑定
submitButton.addEventListener('click', getResponse);
userInputElement.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault(); // 阻止换行
    getResponse();
  }
});