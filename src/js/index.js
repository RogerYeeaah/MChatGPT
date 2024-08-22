const { Configuration, OpenAIApi } = require("openai");
const { markedHighlight } = require('marked-highlight');
const apiKey = process.env.OPENAI_API_KEY;
const marked = require('marked');
const hljs = require('highlight.js');

// css
import '../css/styles.scss';
import 'highlight.js/styles/base16/default-light.css';

// DOM元素
const userInputElement = document.getElementById('insertBox'); // user輸入框元素
const chatBoxFatherElement = document.querySelector('.response'); // 聊天室父元素
const chatBoxElement = document.querySelector('.responseBox'); // 聊天室元素
const submitButton = document.querySelector('.submit'); // 送出按鈕元素
const selectElement = document.getElementById('modelChoose'); // select 元素

// 状态管理
let isLoading = false;
let conversationHistory = [];
let module = [
    {
        name:"- - - - - - 模型選擇 - - - - - -",
        module: '',
        discribe: '',
        status: ''
    },
    {
        name:"4o-mini",
        module: 'gpt-4o-mini',
        discribe: '(速度較慢)',
        status: '1'
    },
    {
        name:"3.5-turbo-0125",
        module: 'gpt-3.5-turbo-0125',
        discribe: '',
        status: '1'
    },
    {
        name:"3.5-turbo-1106",
        module: 'gpt-3.5-turbo-1106',
        discribe: '',
        status: '1'
    },
    {
        name:"3.5-turbo",
        module: 'gpt-3.5-turbo',
        discribe: '',
        status: '1'
    },
    {
        name:"3.5-turbo-16k",
        module: 'gpt-3.5-turbo-16k',
        discribe: '',
        status: '1'
    },
    {
        name:"3.5-turbo",
        module: 'net-gpt-3.5-turbo',
        discribe: '(可連網-穩定性較差)',
        status: '1'
    },
    {
        name:"Whisper",
        module: 'whisper-1',
        discribe: '(功能製作中)',
        status: '0'
    },
    {
        name:"DALL.E 2",
        module: 'dall-e-2',
        discribe: '',
        status: '1'
    }
]
const storedModel = localStorage.getItem('model');

// 遍历数组并创造 option 元素
module.forEach(module => {
    const option = document.createElement('option');
    if(module.status === '0') return;
    option.value = module.module;
    option.textContent = module.name + (module.discribe ? ' ' + module.discribe : '');

    // 如果 localStorage 中的模型名稱與當前選項的 module 名稱相符，則設定為 selected
    if (module.status === '1' && module.module === storedModel) {
        option.selected = true;
    }

    selectElement.appendChild(option);
});


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
        return hljs.highlight(code, {
            language
        }).value;
    }
}));

async function getResponse() {
    const userMessage = userInputElement.value.trim();
    var selectedOption = selectElement.options[selectElement.selectedIndex];

    if (!userMessage || !selectedOption) return;

    toggleLoadingState(true);
    userInputElement.disabled = true;

    try {
        const chatCompletion = await openai.createChatCompletion({
            model: selectedOption.value,
            messages: [{
                role: "user",
                content: userMessage
            }],
        });

        const assistantMessage = chatCompletion.data.choices[0].message.content;
        updateConversationHistory(userMessage, assistantMessage);
        updateChatHistory();
        userInputElement.value = '';
    } catch (error) {
        console.error("Error fetching response:", error);
        // 在此处理 DOM，以显示错误消息。
    } finally {
        toggleLoadingState(false);
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
    conversationHistory.push({
        role: "user",
        content: userMessage
    }, {
        role: "assistant",
        content: assistantMessage
    });
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

// custom select
var x, i, j, l, ll, selElmnt, a, b, c;
x = document.getElementsByClassName("customSelect");
l = x.length;
for (i = 0; i < l; i++) {
    selElmnt = x[i].getElementsByTagName("select")[0];
    ll = selElmnt.length;
    a = document.createElement("DIV");
    a.setAttribute("class", "select-selected");
    a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
    x[i].appendChild(a);
    b = document.createElement("DIV");
    b.setAttribute("class", "select-items select-hide");
    for (j = 1; j < ll; j++) {
        c = document.createElement("DIV");
        c.innerHTML = selElmnt.options[j].innerHTML;
        c.addEventListener("click", function (e) {
            var y, i, k, s, h, sl, yl;
            s = this.parentNode.parentNode.getElementsByTagName("select")[0];
            sl = s.length;
            h = this.parentNode.previousSibling;
            for (i = 0; i < sl; i++) {
                if (s.options[i].innerHTML == this.innerHTML) {
                    s.selectedIndex = i;
                    h.innerHTML = this.innerHTML;
                    y = this.parentNode.getElementsByClassName("same-as-selected");
                    yl = y.length;
                    for (k = 0; k < yl; k++) {
                        y[k].removeAttribute("class");
                    }
                    this.setAttribute("class", "same-as-selected");
                    localStorage.setItem('model', selectElement.options[selectElement.selectedIndex].value)
                    break;
                }
            }
            h.click();
        });
        b.appendChild(c);
    }
    x[i].appendChild(b);
    a.addEventListener("click", function (e) {
        e.stopPropagation();
        closeAllSelect(this);
        this.nextSibling.classList.toggle("select-hide");
        this.classList.toggle("select-arrow-active");
    });
}

function closeAllSelect(elmnt) {
    var x, y, i, xl, yl, arrNo = [];
    x = document.getElementsByClassName("select-items");
    y = document.getElementsByClassName("select-selected");
    xl = x.length;
    yl = y.length;
    for (i = 0; i < yl; i++) {
        if (elmnt == y[i]) {
            arrNo.push(i)
        } else {
            y[i].classList.remove("select-arrow-active");
        }
    }
    for (i = 0; i < xl; i++) {
        if (arrNo.indexOf(i)) {
            x[i].classList.add("select-hide");
        }
    }
}

document.addEventListener("click", closeAllSelect);